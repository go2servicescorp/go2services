import type { DriveImage } from "@/lib/drive";

export type RoomRecord = Record<
  string,
  | string
  | number
  | boolean
  | DriveImage[]
  | null
  | undefined
>;

export type RoomFilter = "all" | "available" | "not-available";
