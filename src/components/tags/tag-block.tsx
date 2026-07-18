import {
  Droplets, // Water
  Flame, // Electric heating / Heat
  WashingMachine, // In-unit laundry / Free laundry
  Wifi, // Internet
  Snowflake, // Snow removal
  Trash2, // Garbage collection
  Recycle, // Recycling services
  Leaf, // Kitchen scrap collection
  Refrigerator, // Refrigerator
  UtensilsCrossed, // Dishwasher
  Dumbbell, // Recreation facilities
  ChefHat, // Stove and oven
  Sofa, // Furniture
  // CircleParking, // Parking (if you have an icon for this, otherwise we can use a generic one)
  Sparkles,
  Car,
  LayoutTemplate,
  Waves, // Swimming Pool
  PawPrint,
  Ban, // Not allowed pets
} from "lucide-react";
import { IoLogoNoSmoking } from "react-icons/io";

const EQUIPMENT_ICONS: Record<string, React.ElementType> = {
  Water: Droplets,
  "Electric heating": Flame,
  "In-unit laundry": WashingMachine,
  Internet: Wifi,
  Heat: Flame,
  "Snow removal": Snowflake,
  "Garbage collection": Trash2,
  "Recycling services": Recycle,
  "Kitchen scrap collection": Leaf,
  "Free laundry": WashingMachine,
  Refrigerator: Refrigerator,
  Dishwasher: UtensilsCrossed,
  "Recreation facilities": Dumbbell,
  "Stove and oven": ChefHat,
  Furniture: Sofa,
};

const TAG_ICONS: Record<string, React.ElementType> = {
  "Cleaner biweekly (only for common areas)": Sparkles,
  available: Car,
  "Window covering": LayoutTemplate,
  Gym: Dumbbell,
  Sauna: Flame,
  "Swimming Pool": Waves,
  "Hot tub": Droplets,
  "Recreation facilities": Dumbbell,
  "No pets allowed": NoPetsIcon,
  "No smoking": IoLogoNoSmoking,
};

export function TagBlock({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type?: "equipment" | "tag";
}) {
  const items = value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) return null;

  return (
    <section className="mt-4 rounded-lg border border-[#d8ebe8] bg-white p-5">
      <div className="mb-4 text-[10px] font-bold uppercase tracking-[1.5px] text-[#8a7f72]">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon =
            type === "equipment" ? EQUIPMENT_ICONS[item] : TAG_ICONS[item];
          return (
            <span
              className={`flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-semibold text-[#1a1410] ${
                item.startsWith("No")
                  ? "border-[#f5c6c6] bg-[#fff7f7]"
                  : "border-[#bfe8e3] bg-[#f7fffd]"
              }`}
              key={item}
            >
              {Icon ? (
                <Icon
                  size={20}
                  className={
                    item.startsWith("No") ? "text-[#e55d5d]" : "text-[#0ABDAD]"
                  }
                />
              ) : null}
              {item}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export function NoPetsIcon() {
  return (
    <div className="relative h-5 w-5 text-[#e55d5d]">
      <PawPrint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3" />
      <Ban className="absolute top-0 left-0 h-5 w-5" />
    </div>
  );
}
