"use client";

import { createContext, useContext, useState } from "react";
import type { RoomFilter, RoomRecord } from "@/types/rooms";

type RoomsContextType = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  activeFilter: RoomFilter;
  setActiveFilter: React.Dispatch<React.SetStateAction<RoomFilter>>;

  filteredRoomsCount: number;
  setFilteredRoomsCount: React.Dispatch<React.SetStateAction<number>>;

  showCount: boolean;
  setShowCount: React.Dispatch<React.SetStateAction<boolean>>;
};

const RoomsContext = createContext<RoomsContextType | null>(null);

export function RoomsProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<RoomFilter>("all");

  const [filteredRoomsCount, setFilteredRoomsCount] = useState(0);

  const [showCount, setShowCount] = useState(false);

  return (
    <RoomsContext.Provider
      value={{
        search,
        setSearch,
        activeFilter,
        setActiveFilter,
        filteredRoomsCount,
        setFilteredRoomsCount,
        showCount,
        setShowCount,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms() {
  const context = useContext(RoomsContext);

  if (!context) {
    throw new Error("useRooms must be used inside RoomsProvider");
  }

  return context;
}
