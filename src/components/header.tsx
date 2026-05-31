"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

import SearchBar from "./search-bar";
import { useRooms } from "@/provider/RoomsProvider";
import { NavMenu } from "./MenuDropdown";
import { useRouter } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    filteredRoomsCount,
  } = useRooms();

  const showSearch =
    activeFilter !== undefined && pathname.includes("accommodations");

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-6 px-4 sm:px-12 sm:h-20 border-b border-[#e5e7eb]">
      {/* Linha superior: logo + menu */}
      <div className="flex items-center justify-between h-16 sm:h-auto sm:w-full">
        <Image
          src="/logo.png"
          alt="Go2Rent"
          width={100}
          height={100}
          loading="lazy"
          className="cursor-pointer"
          onClick={() => router.push("/")}
        />

        {/* SearchBar — desktop */}
        {showSearch && (
          <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-full max-w-xl items-center gap-3">
            <SearchBar
              search={search ?? ""}
              setSearch={setSearch}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              filteredRoomsCount={filteredRoomsCount}
              showCount={true}
            />
          </div>
        )}

        <NavMenu />
      </div>

      {/* SearchBar — mobile */}
      {showSearch && (
        <div className="sm:hidden w-full pb-3 mt-3">
          <SearchBar
            search={search ?? ""}
            setSearch={setSearch}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            filteredRoomsCount={filteredRoomsCount}
            showCount={true}
          />
        </div>
      )}
    </header>
  );
}
