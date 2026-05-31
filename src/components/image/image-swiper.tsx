"use client";

import { DriveImage } from "@/lib/drive";
import { field } from "@/lib/room-utils";
import { RoomRecord } from "@/types/rooms";
import Image from "next/image";
import { useMemo, useState } from "react";
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
    return `/api/drive-image/${encodeURIComponent(image.id)}`;
  }

  return image.thumbnailUrl.replace("?size=thumb", "");
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
  const images = useMemo(() => getImageGroups(room), [room]);
  const activeImages = images[activeGroup];
  const activeImage = activeImages[activeIndex] || null;
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
            loading="lazy"
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
              setActiveIndex((index) =>
                index === 0 ? activeImages.length - 1 : index - 1,
              )
            }
          />
          <SliderButton
            label="Next image"
            position="right"
            onClick={() =>
              setActiveIndex((index) => (index + 1) % activeImages.length)
            }
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
                onClick={() => setActiveIndex(index)}
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
