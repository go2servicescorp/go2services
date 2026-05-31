import { cn } from "@/lib/room-utils";

export function SliderButton({
  label,
  onClick,
  position,
}: {
  label: string;
  onClick: () => void;
  position: "left" | "right";
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-bold shadow transition hover:bg-white",
        position === "left" ? "left-4" : "right-4",
      )}
      onClick={onClick}
      type="button"
    >
      {position === "left" ? "<" : ">"}
    </button>
  );
}
