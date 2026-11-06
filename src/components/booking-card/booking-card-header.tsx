"use client";

import { AvailabilityTag } from "./availability";

interface BookingCardHeaderProps {
  title: string;
  moveIn: Date | string;
  isAvailable: boolean;
}

export function BookingCardHeader({
  title,
  moveIn,
  isAvailable,
}: BookingCardHeaderProps) {
  // timeZone UTC evita que "2026-09-01" apareça como 31 de agosto
  const moveInLabel = new Date(moveIn).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="sm:hidden">
        <AvailabilityTag isAvailable={isAvailable} />
      </div>

      <h2 className="text-lg font-bold">{title}</h2>

      <p className="text-sm text-gray-600">
        {isAvailable
          ? `Move-in: ${moveInLabel}`
          : "Not available right now. Contact us to ask about upcoming availability."}
      </p>
    </div>
  );
}
