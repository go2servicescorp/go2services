"use client";

import { DriveImage } from "@/lib/drive";
import { field } from "@/lib/room-utils";
import { RoomRecord } from "@/types/rooms";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SliderButton } from "./slider-button";

type ImageGroup = "room" | "house";

export function getImageGroups(
  room: RoomRecord | null,
): Record<ImageGroup, DriveImage[]> {
  if (!room) return { room: [], house: [] };

  return {
    room: getImages(room, "RoomImages", "RoomImageUrl"),
    house: getImages(room, "HouseImages", "HouseImageUrl"),
  };
}

function getImages(room: RoomRecord, imagesKey: string, fallbackKey: string) {
  const images = room[imagesKey];

  if (Array.isArray(images)) {
    return images.filter(isDriveImage);
  }

  const fallbackUrl = field(room, fallbackKey);

  return fallbackUrl
    ? [
        {
          id: fallbackUrl,
          name: fallbackKey,
          thumbnailUrl: fallbackUrl,
          viewUrl: fallbackUrl,
        },
      ]
    : [];
}

function isDriveImage(value: unknown): value is DriveImage {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "thumbnailUrl" in value &&
    typeof value.thumbnailUrl === "string"
  );
}

function isDriveFileId(value: string) {
  return Boolean(
    value && !value.startsWith("/") && !/^https?:\/\//.test(value),
  );
}

function getFullImageUrl(image: DriveImage) {
  if (isDriveFileId(image.id)) {
    return `/api/drive-image/${encodeURIComponent(image.id)}?size=gallery`;
  }

  if (image.thumbnailUrl.startsWith("/api/drive-image/")) {
    return image.thumbnailUrl.includes("?")
      ? image.thumbnailUrl.replace(/([?&])size=[^&]*/, "$1size=gallery")
      : `${image.thumbnailUrl}?size=gallery`;
  }

  return image.thumbnailUrl;
}

function isSlowConnection() {
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return conn?.saveData || conn?.effectiveType?.includes("2g");
}

export function ImageSwiper({
  room,
  roomId,
  activeGroup,
}: {
  room: RoomRecord | null;
  roomId: string;
  activeGroup: ImageGroup;
}) {
  const decodedRoomId = decodeURIComponent(roomId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const images = useMemo(() => getImageGroups(room), [room]);
  const activeImages = images[activeGroup];
  const activeImage = activeImages[activeIndex] || null;

  const navigate = useCallback((next: number) => {
    setHasInteracted(true);
    setActiveIndex(next);
  }, []);

  // Preload das vizinhas após primeira interação
  useEffect(() => {
    if (!hasInteracted || isSlowConnection()) return;

    const neighbors = [
      activeImages[activeIndex + 1],
      activeImages[activeIndex - 1],
    ].filter(Boolean) as DriveImage[];

    const links = neighbors.map((img) => {
      const href = getFullImageUrl(img);
      if (document.querySelector(`link[rel="preload"][href="${href}"]`)) {
        return null;
      }

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach((link) => link?.remove());
    };
  }, [activeIndex, activeImages, hasInteracted]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#aee9e3] bg-[#f5f0e8]">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        {activeImage ? (
          <Image
            src={getFullImageUrl(activeImage)}
            alt={activeImage.name || decodedRoomId}
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover"
            loading={activeIndex === 0 ? "eager" : "lazy"}
            priority={activeIndex === 0}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[2px] text-[#8a7f72]">
            No images available
          </div>
        )}
      </div>

      {activeImages.length > 1 ? (
        <>
          <SliderButton
            label="Previous image"
            position="left"
            onClick={() =>
              navigate(
                activeIndex === 0 ? activeImages.length - 1 : activeIndex - 1,
              )
            }
          />
          <SliderButton
            label="Next image"
            position="right"
            onClick={() => navigate((activeIndex + 1) % activeImages.length)}
          />
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              display: "flex",
              gap: "8px",
            }}
          >
            {activeImages.map((_, index) => (
              <button
                aria-label={`Show image ${index + 1}`}
                key={index}
                onClick={() => navigate(index)}
                type="button"
                style={{
                  height: "7px",
                  width: index === activeIndex ? "32px" : "7px",
                  borderRadius: "9999px",
                  border: "2px solid",
                  borderColor: index === activeIndex ? "#0ABDAD" : "#ffffff",
                  backgroundColor:
                    index === activeIndex ? "#0ABDAD" : "#ffffff",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
