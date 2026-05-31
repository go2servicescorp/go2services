export function FormField({
  label,
  name,
  type,
}: {
  label: string;
  name: string;
  type: string;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[1.2px] text-[#6f665d]">
        {label}
      </span>
      <input
        className="h-11 w-full rounded border border-[#bfe8e3] bg-white px-3 text-sm outline-none transition focus:border-[#0ABDAD] focus:ring-2 focus:ring-[#0ABDAD]/20"
        name={name}
        required
        type={type}
      />
    </label>
  );
}
