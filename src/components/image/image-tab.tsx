import { cn } from "@/lib/room-utils";

export function ImageTab({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "border-b-2 px-4 py-3 text-sm font-bold transition-colors",
        active
          ? "border-[#0ABDAD] text-[#1a1410]"
          : "border-transparent text-[#6f665d] hover:text-[#1a1410]",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
      <span className="ml-2 text-xs text-[#8a7f72]">{count}</span>
    </button>
  );
}
