import { Send } from "lucide-react";

interface ContactSuccessProps {
  clearForm: () => void;
}

export default function ContactSuccess({ clearForm }: ContactSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#0ABDAD]/10">
        <Send size={28} className="text-[#0ABDAD]" />
      </div>
      <h2 className="text-2xl font-bold text-[#1a1410]">Message sent!</h2>
      <p className="text-sm text-gray-500">
        We&apos;ll get back to you as soon as possible.
      </p>
      <button
        type="button"
        onClick={clearForm}
        className="mt-2 text-sm text-[#0ABDAD] hover:underline"
      >
        Send another message
      </button>
    </div>
  );
}
