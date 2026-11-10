import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function PhoneField({
  label,
  value,
  onChange,
  touched,
  onBlur,
  valid,
  required,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  touched: boolean;
  onBlur: () => void;
  valid: boolean;
  required?: boolean;
}) {
  return (
    <div className="mb-4 block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[1.2px] text-[#6f665d]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <PhoneInput
        international
        defaultCountry="CA"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onBlur={onBlur}
        placeholder="Enter phone number"
        className={`flex items-center gap-2 rounded border px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-[#0ABDAD]/20 ${
          touched && !valid
            ? "border-red-400 focus-within:border-red-400"
            : "border-[#bfe8e3] focus-within:border-[#0ABDAD]"
        }`}
        numberInputProps={{
          className: "flex-1 border-none outline-none text-sm bg-transparent",
        }}
      />
      {touched && !valid && (
        <p className="mt-1 text-xs text-red-500">
          {value ? "Invalid phone number" : "Phone number is required"}
        </p>
      )}
    </div>
  );
}
