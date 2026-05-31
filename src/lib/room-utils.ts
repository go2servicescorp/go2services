import type { RoomRecord } from "@/types/rooms";

export const displayFont =
  "[font-family:Impact,'Arial_Narrow',Arial,sans-serif]";
export const monoFont =
  "[font-family:'SFMono-Regular',Consolas,'Liberation_Mono',monospace]";

export function field(room: RoomRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = room[key];
    if (
      value !== null &&
      value !== undefined &&
      !Array.isArray(value) &&
      String(value).trim()
    ) {
      return String(value);
    }
  }

  return "";
}

export function getRoomDetailsId(room: RoomRecord) {
  const roomName = field(room, "Name (site)", "name");
  const roomNumber = field(room, "Room", "room");

  return roomName && roomNumber
    ? `${roomName} - Room ${roomNumber}`
    : roomName || roomNumber;
}

export function formatMoney(value: string) {
  if (!value) return "-";

  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(amount)) return value;

  return `$${amount.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function isAvailable(room: RoomRecord) {
  const value = field(room, "available", "Available").toLowerCase();
  return value === "available" || value === "yes" || value === "true";
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
