"use client";

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
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
          isAvailable ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-700"
        }`}
      >
        <span
          aria-hidden
          className={`size-1.5 rounded-full ${
            isAvailable ? "bg-teal-600" : "bg-red-600"
          }`}
        />
        {isAvailable ? "Available" : "Not available"}
      </span>

      <h2 className="text-lg font-bold">{title}</h2>

      <p className="text-sm text-gray-600">
        {isAvailable
          ? `Move-in: ${moveInLabel}`
          : "Not available right now. Contact us to ask about upcoming availability."}
      </p>
    </div>
  );
}
