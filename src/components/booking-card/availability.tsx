export function AvailabilityTag({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
        isAvailable ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-700"
      }`}
    >
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${isAvailable ? "bg-teal-600" : "bg-red-600"}`}
      />
      {isAvailable ? "Available" : "Not available"}
    </span>
  );
}
