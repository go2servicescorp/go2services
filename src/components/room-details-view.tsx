"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  cn,
  displayFont,
  field,
  formatMoney,
  getRoomDetailsId,
  isAvailable,
} from "@/lib/room-utils";
import type { DriveImage } from "@/lib/drive";
import type { RoomRecord } from "@/types/rooms";

import { ImageTab } from "./image/image-tab";
import { getImageGroups, ImageSwiper } from "./image/image-swiper";
import { ContactForm } from "./contact/contact-form";
import { TagBlock } from "./tags/tag-block";
import { DetailItem } from "./detailItem/detail-item";

type RoomsResponse = {
  rooms?: RoomRecord[];
  error?: string;
};

type DriveFolderResponse = {
  images?: DriveImage[];
  error?: string;
};

type ImageGroup = "room" | "house";

const CACHE_KEY = "room_data_v7";

const detailFields = [
  ["Area", "Area"],
  ["Nearest station", "Nearest station"],
  ["Move-in date", "Move-in date"],
  ["Monthly rent", "Monthly Rent"],
  ["Deposit", "Deposit"],
  ["Couples move-in", "Couples move-in"],
  ["People sharing house", "Number of people sharing a house"],
  ["People sharing bathroom", "Number of people sharing the bathroom"],
  ["Description", "Description"],
] as const;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export function RoomDetailsView({
  roomId,
  token,
}: {
  roomId: string;
  token: string;
}) {
  const decodedRoomId = decodeURIComponent(roomId);
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeGroup, setActiveGroup] = useState<ImageGroup>("room");
  const [loadedFolderIds, setLoadedFolderIds] = useState<string[]>([]);
  const isDesktop = useIsDesktop();

  // Load room data
  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      setIsLoading(true);
      setError("");
      setLoadedFolderIds([]);

      const cachedRooms = readCachedRooms();
      const cachedRoom = findRoom(cachedRooms, decodedRoomId);

      if (cachedRoom) {
        setRoom(cachedRoom);
        setIsLoading(false);
        return;
      }

      try {
        const roomsUrl = token
          ? `/api/rooms?token=${encodeURIComponent(token)}`
          : "/api/rooms";
        const res = await fetch(roomsUrl, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const data = (await res.json()) as RoomsResponse;

        if (!res.ok)
          throw new Error(data.error || "Unable to load room details.");

        const rooms = Array.isArray(data.rooms) ? data.rooms : [];
        localStorage.setItem(CACHE_KEY, JSON.stringify(rooms));
        localStorage.setItem(`${CACHE_KEY}_time`, String(Date.now()));

        if (cancelled) return;

        const nextRoom = findRoom(rooms, decodedRoomId);
        if (nextRoom) {
          setRoom(nextRoom);
        } else {
          setError("Room not found.");
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Unable to load room details.",
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadRoom();
    return () => {
      cancelled = true;
    };
  }, [decodedRoomId, token]);

  // Load both image folders in parallel, updating state as each one resolves
  useEffect(() => {
    let cancelled = false;

    if (!room) return;

    const roomFolderId = field(room, "Pictures Room Folder ID");
    const houseFolderId = field(room, "Pictures House Folder ID");

    if (roomFolderId && !loadedFolderIds.includes(roomFolderId)) {
      fetchFolderImages(roomFolderId).then((imgs) => {
        if (cancelled || !imgs.length) return;
        setRoom((r) => (r ? { ...r, RoomImages: imgs } : r));
        setLoadedFolderIds((prev) =>
          prev.includes(roomFolderId) ? prev : [...prev, roomFolderId],
        );
      });
    }

    if (houseFolderId && !loadedFolderIds.includes(houseFolderId)) {
      fetchFolderImages(houseFolderId).then((imgs) => {
        if (cancelled || !imgs.length) return;
        setRoom((r) => (r ? { ...r, HouseImages: imgs } : r));
        setLoadedFolderIds((prev) =>
          prev.includes(houseFolderId) ? prev : [...prev, houseFolderId],
        );
      });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const images = useMemo(() => getImageGroups(room), [room]);
  const available = room ? isAvailable(room) : false;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#1a1410]">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#8a7f72]">
          Loading room details...
        </p>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-[#1a1410] sm:px-12">
        <div className="mx-auto max-w-3xl border border-[#f5c6c6] bg-[#fff5f5] p-6 text-sm text-[#c8401a]">
          {error || "Room not found."}
        </div>
      </main>
    );
  }

  const imageTabs = (
    <div className="mb-4 flex border-b border-[#d8ebe8]">
      <ImageTab
        active={activeGroup === "room"}
        count={images.room.length}
        label="Room images"
        onClick={() => setActiveGroup("room")}
      />
      <ImageTab
        active={activeGroup === "house"}
        count={images.house.length}
        label="House images"
        onClick={() => setActiveGroup("house")}
      />
    </div>
  );

  const imageSwiper = (
    <>
      {imageTabs}
      {images[activeGroup].length === 0 ? (
        <div className="h-72 w-full animate-pulse rounded-lg bg-[#ddd5c8]" />
      ) : (
        <ImageSwiper
          key={activeGroup}
          room={room}
          roomId={roomId}
          activeGroup={activeGroup}
        />
      )}
    </>
  );

  const detailsBlock = (
    <div className="flex flex-col gap-6">
      {/* {field(room, "Description") ? (
        <section className="rounded-lg border border-[#d8ebe8] bg-white p-5">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#8a7f72]">
            Description
          </div>
          <p className="text-sm font-semibold leading-relaxed text-[#1a1410]">
            {field(room, "Description")}
          </p>
        </section>
      ) : null} */}

      <div className="grid gap-px overflow-hidden rounded-lg border border-[#d8ebe8] bg-white sm:grid-cols-2 lg:grid-cols-3">
        {detailFields.map(([label, key]) => (
          <DetailItem
            key={key}
            label={label}
            value={formatDetailValue(room, key)}
          />
        ))}
      </div>

      <TagBlock
        label="Equipment"
        value={field(room, "Equipment")}
        type="equipment"
      />
      <TagBlock label="Amenities" value={field(room, "Amenities")} />
      <TagBlock label="Additional" value={field(room, "Additional")} />
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-[#1a1410]">
      <div className="mx-auto w-full" style={{ maxWidth: "1600px" }}>
        <section className="grid gap-8 px-4 pt-6 sm:px-8 lg:px-12">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <Link
                  className="mb-4 inline-flex items-center text-sm font-bold text-[#0ABDAD] underline-offset-4 hover:underline"
                  href={token ? `/?token=${encodeURIComponent(token)}` : "/"}
                >
                  Back to listings
                </Link>
                <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-[#0ABDAD]">
                  Room details
                </p>
                <h1
                  className={`${displayFont} text-5xl font-black leading-none sm:text-7xl`}
                >
                  {decodedRoomId}
                </h1>
              </div>
              <span
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px]",
                  available
                    ? "bg-[#e8f5e9] text-[#2a5c3f]"
                    : "bg-[#fce8e8] text-[#c8401a]",
                )}
              >
                {available ? "Available" : "Not available"}
              </span>
            </div>
          </div>
        </section>

        {isDesktop ? (
          <section className="grid gap-8 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] lg:grid-rows-[auto_1fr] lg:px-12">
            <div className="lg:col-start-1 lg:row-start-1">{imageSwiper}</div>

            <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:pt-24">
              <ContactForm roomName={decodedRoomId} />
            </aside>

            <div className="lg:col-start-1 lg:row-start-2">{detailsBlock}</div>
          </section>
        ) : (
          <section className="flex flex-col gap-8 px-4 py-6 sm:px-8">
            {imageSwiper}
            {detailsBlock}
            <ContactForm roomName={decodedRoomId} />
          </section>
        )}
      </div>
    </main>
  );
}

function findRoom(rooms: RoomRecord[], roomId: string) {
  return rooms.find((room) => getRoomDetailsId(room) === roomId) || null;
}

function readCachedRooms() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? (JSON.parse(cached) as RoomRecord[]) : [];
  } catch {
    return [];
  }
}

async function fetchFolderImages(folderId: string) {
  try {
    const res = await fetch(
      `/api/driver-folder/${encodeURIComponent(folderId)}`,
    );
    const data = (await res.json()) as DriveFolderResponse;

    if (!res.ok) {
      console.warn(data.error || "Unable to load folder images.");
      return [];
    }

    return Array.isArray(data.images) ? data.images : [];
  } catch (error) {
    console.warn(error);
    return [];
  }
}

function formatDetailValue(room: RoomRecord, key: string) {
  const value = field(room, key);
  if (key === "Monthly Rent" || key === "Deposit") return formatMoney(value);
  if (key === "Move-in date") return formatDate(value);
  return value;
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", { timeZone: "UTC" });
}
