import { RoomRecord } from "@/types/rooms";
import { field, formatMoney } from "./room-utils";

export function formatDetailValue(
  room: RoomRecord,
  key: string,
  available?: boolean,
) {
  const value = field(room, key);
  if (key === "Monthly Rent" || key === "Deposit")
    return available ? formatMoney(value) : "-";
  if (key === "Move-in date") return formatDate(value);
  return value;
}

export function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", { timeZone: "UTC" });
}

export function toText(value: unknown) {
  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
    ? String(value)
    : "";
}
