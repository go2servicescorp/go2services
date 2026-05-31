export function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-24 border border-[#d8ebe8] bg-white p-4">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#8a7f72]">
        {label}
      </div>
      <div className="text-sm font-semibold leading-relaxed text-[#1a1410]">
        {value || "-"}
      </div>
    </div>
  );
}
