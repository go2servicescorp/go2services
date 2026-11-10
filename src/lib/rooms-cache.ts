import type { RoomRecord } from "@/types/rooms";

export const ROOMS_CACHE_TTL = 24 * 60 * 60 * 1000; // 1 dia
export const ROOMS_CACHE_KEY = "room_data_v7";

export function clearRoomsCache(key: string) {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_time`);
  } catch {}
}

/** Returns the cached rooms, or null if missing or older than 1 day (and removes it). */
export function readRoomsCache(
  key: string,
): { rooms: RoomRecord[]; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(key);
    const savedAt = Number(localStorage.getItem(`${key}_time`));

    if (!raw || !savedAt || Date.now() - savedAt >= ROOMS_CACHE_TTL) {
      clearRoomsCache(key);
      return null;
    }
    return { rooms: JSON.parse(raw) as RoomRecord[], savedAt };
  } catch {
    clearRoomsCache(key); // corrupted JSON, storage blocked, etc.
    return null;
  }
}

export function writeRoomsCache(key: string, rooms: RoomRecord[]) {
  try {
    localStorage.setItem(key, JSON.stringify(rooms));
    localStorage.setItem(`${key}_time`, String(Date.now()));
  } catch {} // quota exceeded or storage disabled: just skip caching
}
