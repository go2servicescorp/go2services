"use client";

import { useState } from "react";
import { cn, monoFont } from "@/lib/room-utils";
import { RoomFilter } from "@/types/rooms";

export default function SearchBar({
  search,
  setSearch,
  activeFilter,
  setActiveFilter,
  filteredRoomsCount,
  showCount = false,
}: {
  search: string;
  setSearch: (v: string) => void;
  activeFilter: RoomFilter;
  setActiveFilter: (f: RoomFilter) => void;
  filteredRoomsCount: number;
  showCount?: boolean;
}) {
  const [filterOpen, setFilterOpen] = useState(false);

  const filters = ["all", "available", "not-available"] as const;
  const labels = ["All", "Available", "Not Available"];

  return (
    <>
      {/* Pill + drawer agrupados num flex-col — ocupa flex-1 no desktop */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* ── Pill ── */}
        <div
          className={cn(
            "flex items-center bg-white border border-[#ddd5c8] h-[42px] shadow-sm transition-all duration-200",
            filterOpen
              ? "rounded-t-[20px] sm:rounded-full border-b-white sm:border-b-[#ddd5c8]"
              : "rounded-full",
          )}
        >
          {/* Input compartilhado */}
          <input
            className="flex-1 min-w-0 bg-transparent pl-5 pr-2 text-sm text-[#1a1410] outline-none placeholder:text-[#bbb] h-full"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, area, station..."
          />

          <div className="w-px h-[22px] bg-[#e0dbd4] flex-shrink-0" />

          {/* Desktop: chips de filtro */}
          <div className="hidden sm:flex items-center gap-[2px] px-1.5 py-1.5">
            {filters.map((f, i) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{ minWidth: "64px" }}
                className={cn(
                  "rounded-full px-2.5 py-2 text-xs transition-colors whitespace-nowrap min-w-14",
                  activeFilter === f
                    ? "bg-[#0ABDAD] text-[#1a1410]"
                    : "text-[#888] hover:bg-[#d7fdf5] hover:text-[#1a1410]",
                )}
              >
                {labels[i]}
              </button>
            ))}
          </div>

          {/* Mobile: botão ícone filtro */}
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={cn(
              "sm:hidden flex items-center justify-center w-[42px] h-[42px] flex-shrink-0 relative transition-colors",
              filterOpen || activeFilter !== "all"
                ? "text-[#1a1410]"
                : "text-[#999]",
            )}
            aria-label="Filters"
          >
            {activeFilter !== "all" && (
              <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-[#0ABDAD] border-[1.5px] border-white" />
            )}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
          </button>
        </div>

        {/* Mobile: drawer */}
        <div
          className={cn(
            "sm:hidden w-full bg-white border border-[#ddd5c8] border-t-0 rounded-b-[20px] overflow-hidden transition-all duration-200",
            filterOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0 border-0",
          )}
        >
          <div className="px-4 pt-2.5 pb-3.5 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[1.5px] text-[#bbb]">
              Availability
            </span>
            <div className="flex gap-2">
              {filters.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs transition-colors",
                    activeFilter === f
                      ? "bg-[#0ABDAD] border-[#0ABDAD] text-[#1a1410]"
                      : "bg-white border-[#ddd5c8] text-[#777]",
                  )}
                >
                  {labels[i]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Count — mobile: abaixo do drawer */}
        {showCount && (
          <span
            className={`sm:hidden ${monoFont} text-[11px] text-[#bbb] px-1 pt-2`}
          >
            {filteredRoomsCount} rooms
          </span>
        )}
      </div>

      {/* Count — desktop: ao lado do pill */}
      {showCount && (
        <span
          className={`hidden sm:block ${monoFont} text-xs text-[#555] whitespace-nowrap`}
        >
          {filteredRoomsCount} rooms
        </span>
      )}
    </>
  );
}
