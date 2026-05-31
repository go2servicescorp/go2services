"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoomCard } from "@/components/room-card";
import {
  displayFont,
  field,
  getRoomDetailsId,
  isAvailable,
  monoFont,
} from "@/lib/room-utils";
import type { RoomRecord } from "@/types/rooms";
import { useRouter } from "next/navigation";
import { useRooms } from "@/provider/RoomsProvider";

type RoomsResponse = {
  rooms?: RoomRecord[];
  updatedAt?: string;
  error?: string;
};

const CACHE_KEY = "room_data_v3";
const CACHE_TIME = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 15;

export default function RoomListings() {
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [syncText, setSyncText] = useState("Loading...");
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  const { search, activeFilter, setFilteredRoomsCount } = useRooms();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVisibleCount(PAGE_SIZE);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [search, activeFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadRooms(forceRefresh = false) {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(`${CACHE_KEY}_time`);
      const cacheValid =
        cached && cachedTime && Date.now() - Number(cachedTime) < CACHE_TIME;

      if (!forceRefresh && cacheValid) {
        setRooms(JSON.parse(cached) as RoomRecord[]);
        setSyncText(
          `Cached at ${new Date(Number(cachedTime)).toLocaleTimeString("en-US")}`,
        );
        setIsLive(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      setSyncText("Syncing...");
      setIsLive(false);

      try {
        const res = await fetch(`/api/rooms`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const data = (await res.json()) as RoomsResponse;

        if (!res.ok) throw new Error(data.error || "Failed to load data.");
        if (cancelled) return;

        const nextRooms = Array.isArray(data.rooms) ? data.rooms : [];
        setRooms(nextRooms);
        localStorage.setItem(CACHE_KEY, JSON.stringify(nextRooms));
        localStorage.setItem(`${CACHE_KEY}_time`, String(Date.now()));
        setSyncText(`Updated at ${new Date().toLocaleTimeString("en-US")}`);
        setIsLive(true);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data.");
        setSyncText("Sync error");
        setIsLive(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadRooms();
    const interval = window.setInterval(() => loadRooms(true), CACHE_TIME);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rooms.filter((room) => {
      const roomText = Object.values(room).join(" ").toLowerCase();
      const matchesSearch =
        !normalizedSearch || roomText.includes(normalizedSearch);
      const available = isAvailable(room);
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "available" && available) ||
        (activeFilter === "not-available" && !available);
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, rooms, search]);

  useEffect(() => {
    setFilteredRoomsCount(filteredRooms.length);
  }, [filteredRooms, setFilteredRoomsCount]);

  const visibleRooms = filteredRooms.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRooms.length;

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node || !hasMore) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisibleCount((prev) => prev + PAGE_SIZE);
          }
        },
        { rootMargin: "200px" },
      );

      observerRef.current.observe(node);
    },
    [hasMore],
  );

  function handleCardClick(room: RoomRecord) {
    const roomId = getRoomDetailsId(room);
    if (roomId) router.push(`/pages/roomDetails/${encodeURIComponent(roomId)}`);
  }

  return (
    <main className="min-h-screen bg-white text-[#1a1410]">
      <section
        className="flex invisible sm:hidden sm:visible items-center gap-3 border-t border-[#333] px-5 py-4"
        aria-label="Room filters"
      />
      {isLoading ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div className="h-0.5 w-50 overflow-hidden bg-[#ddd5c8]">
            <div className="h-full w-2/5 animate-pulse bg-[#0ABDAD]" />
          </div>
          <div className="text-[11px] uppercase tracking-[3px] text-[#8a7f72]">
            Loading rooms...
          </div>
        </div>
      ) : error ? (
        <div
          className={`${monoFont} m-12 border border-[#f5c6c6] bg-[#fff5f5] p-6 text-[13px] text-[#c8401a]`}
        >
          {error}
        </div>
      ) : (
        <>
          <section
            className="grid grid-cols-1 gap-6 min-[700px]:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] p-4 sm:px-12 sm:py-5"
            aria-label="Room listings"
          >
            {visibleRooms.length === 0 ? (
              <div className="col-span-full p-20 text-center text-sm text-[#8a7f72]">
                <big
                  className={`${displayFont} mb-2 block text-6xl font-black text-[#ddd5c8]`}
                >
                  0
                </big>
                No rooms found
              </div>
            ) : (
              visibleRooms.map((room, index) => (
                <RoomCard
                  key={`${field(room, "Room", "room")}-${index}`}
                  room={room}
                  onClick={() => handleCardClick(room)}
                />
              ))
            )}
          </section>

          <div ref={sentinelRef} className="flex justify-center py-8">
            {hasMore && (
              <div className="flex flex-col items-center gap-2">
                <div className="h-0.5 w-32 overflow-hidden bg-[#ddd5c8]">
                  <div className="h-full w-2/5 animate-pulse bg-[#0ABDAD]" />
                </div>
                <span className="text-[11px] uppercase tracking-[3px] text-[#8a7f72]">
                  Loading more...
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
