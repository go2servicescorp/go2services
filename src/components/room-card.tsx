import Image from "next/image";
import type { RoomRecord } from "@/types/rooms";
import {
  cn,
  displayFont,
  field,
  formatMoney,
  isAvailable,
} from "@/lib/room-utils";

export function RoomCard({
  room,
  onClick,
}: {
  room: RoomRecord;
  onClick: () => void;
}) {
  const available = isAvailable(room);
  const imageUrl = field(room, "RoomImageUrl", "HouseImageUrl");
  const imageAlt = field(room, "Name (site)", "name") || "Room";

  return (
    <article
      className="group relative min-h-78.5 cursor-pointer overflow-hidden bg-white transition-colors before:absolute before:left-0 before:top-0 before:h-full before:w-0.75 before:origin-bottom before:scale-y-0 before:bg-[#0ABDAD] before:transition-transform hover:bg-[#f6fffd] hover:before:scale-y-100 border border-[#aee9e3] rounded-lg"
      onClick={onClick}
    >
      {imageUrl ? (
        <div className="relative h-48 w-full bg-[#ddd5c8] overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 700px) 33vw, 100vw"
            className="object-cover"
            unoptimized
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center bg-[#f5f0e8] text-[10px] uppercase tracking-[2px] text-[#8a7f72]">
          No preview
        </div>
      )}

      <div className="p-7">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div
            className={`${displayFont} text-5xl font-black leading-none text-[#ddd5c8]`}
          >
            {field(room, "Room", "room") || "-"}
          </div>
          <span
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1.5px]",
              available
                ? "bg-[#e8f5e9] text-[#2a5c3f]"
                : "bg-[#fce8e8] text-[#c8401a]",
            )}
          >
            {available ? "Available" : "Not Available"}
          </span>
        </div>

        <h2
          className={`${displayFont} mb-4 text-[1.6rem] font-black leading-[1.1] tracking-normal`}
        >
          {field(room, "Name (site)", "name") || "-"}
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <MetaItem
            label="Rent/month"
            value={
              available
                ? formatMoney(field(room, "Monthly Rent", "monthly_rent"))
                : "-"
            }
            price
          />
          <MetaItem
            label="Deposit"
            value={
              available ? formatMoney(field(room, "Deposit", "deposit")) : "-"
            }
          />
          <MetaItem
            label="Move-in"
            value={formatDate(field(room, "Move-in date", "move_in_date"))}
          />
          <MetaItem label="Area" value={field(room, "Area") || "-"} />
        </div>
      </div>
    </article>
  );
}

function MetaItem({
  label,
  price,
  value,
}: {
  label: string;
  price?: boolean;
  value: string;
}) {
  return (
    <div>
      <div className="mb-0.5 text-[10px] uppercase tracking-[1.5px] text-[#8a7f72]">
        {label}
      </div>
      <div
        className={cn(
          "text-sm font-bold text-[#1a1410]",
          price && `${displayFont} text-[1.4rem] font-black text-black`,
        )}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}
