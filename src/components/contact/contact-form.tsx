import { useState } from "react";
import { FormField } from "../form/form-field";

export function ContactForm({ roomName }: { roomName: string }) {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="rounded-lg border border-[#d8ebe8] bg-[#f7fffd] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <h2 className="mb-5 text-xl font-black">Book a viewing</h2>
      <input name="room" type="hidden" value={roomName} />
      <FormField label="Full name" name="fullName" type="text" />
      <FormField label="Email" name="email" type="email" />
      <FormField label="Phone" name="phone" type="tel" />
      <button
        className="mt-2 w-full rounded bg-[#0ABDAD] px-4 py-3 text-sm font-black uppercase tracking-[1px] text-white transition hover:bg-[#079b8d]"
        type="submit"
      >
        Send request
      </button>
      {sent ? (
        <p className="mt-3 text-sm font-semibold text-[#2a5c3f]">
          Request ready to be connected to your booking flow.
        </p>
      ) : null}
    </form>
  );
}
