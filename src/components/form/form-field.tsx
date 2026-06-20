import { useState } from "react";

export function FormField({
  label,
  name,
  type,
  required = false,
  pattern,
  rows = 4,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  pattern?: string;
  rows?: number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) {
  const [error, setError] = useState("");

  function handleInvalid(
    e: React.InvalidEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    e.preventDefault();
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.validity.valueMissing) {
      setError("This field is required.");
    } else if (target.validity.patternMismatch) {
      setError("Please enter a valid value.");
    } else if (target.validity.typeMismatch) {
      setError("Please enter a valid value.");
    } else {
      setError("Invalid field.");
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.validity.valid) setError("");
    onChange?.(e);
  }

  if (type === "checkbox") {
    return (
      <label className="mb-4 flex items-center gap-2 cursor-pointer">
        <input
          className="h-4 w-4 accent-[#0ABDAD]"
          name={name}
          type="checkbox"
          onChange={handleChange}
        />
        <span className="text-sm text-[#1a1410]">{label}</span>
      </label>
    );
  }

  const errorClass = error
    ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
    : "border-[#bfe8e3] focus:border-[#0ABDAD] focus:ring-[#0ABDAD]/20";

  const baseClass = `w-full rounded border bg-white px-3 text-sm outline-none transition focus:ring-2 ${errorClass}`;

  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[1.2px] text-[#6f665d]">
        {label}
        <span className="text-red-500">*</span>
      </span>
      {type === "textarea" ? (
        <textarea
          className={`${baseClass} py-2.5 resize-none`}
          name={name}
          required={required}
          rows={rows}
          onChange={handleChange}
          onInvalid={handleInvalid}
        />
      ) : (
        <input
          className={`${baseClass} h-11`}
          name={name}
          required={required}
          type={type}
          pattern={pattern}
          onChange={handleChange}
          onInvalid={handleInvalid}
        />
      )}
      {error ? (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      ) : null}
    </label>
  );
}
