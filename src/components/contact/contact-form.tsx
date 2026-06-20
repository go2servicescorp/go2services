import { useState } from "react";
import { FormField } from "../form/form-field";

export function ContactForm({ roomName }: { roomName: string }) {
  const [sent, setSent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    phone: "",
    introduction: "",
    availableDates: "",
  });

  const allFilled = Object.values(fields).every((v) => v.trim() !== "");
  const canSubmit = allFilled && agreed;

  function handleChange(name: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [name]: e.target.value }));
    };
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Here you would typically send the data to your server
    console.log("Form submitted:", { ...fields, room: roomName });
    const filledFields = { ...fields, room: roomName };
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filledFields),
    });

    if (response.ok) {
      alert("Email enviado!");
    }
    setSent(true);
  }

  return (
    <form
      className="rounded-lg border border-[#d8ebe8] bg-[#f7fffd] p-5"
      onSubmit={onSubmit}
    >
      <h2 className="mb-5 text-xl font-black">Book a viewing</h2>
      <input name="room" type="hidden" value={roomName} />
      <FormField
        label="Full name"
        name="fullName"
        type="text"
        onChange={handleChange("fullName")}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        pattern="/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/"
        onChange={handleChange("email")}
      />
      <FormField
        label="Phone"
        name="phone"
        type="tel"
        pattern="[0-9]+"
        onChange={handleChange("phone")}
      />
      <FormField
        label="A short introduction about yourself"
        name="introduction"
        type="textarea"
        onChange={handleChange("introduction")}
      />
      <FormField
        label="Please provide 3 available dates"
        name="availableDates"
        type="textarea"
        rows={2}
        onChange={handleChange("availableDates")}
      />
      <FormField
        label="I understand there is a minimum stay of 3 months"
        name="agreed"
        type="checkbox"
        onChange={(e) => {
          const target = e.target as HTMLInputElement;
          setAgreed(target.checked);
        }}
      />
      <button
        className="mt-2 w-full rounded px-4 py-3 text-sm font-black uppercase tracking-[1px] text-white transition disabled:cursor-not-allowed disabled:opacity-40 bg-[#0ABDAD] hover:bg-[#079b8d] disabled:hover:bg-[#0ABDAD]"
        type="submit"
        disabled={!canSubmit}
      >
        Send request
      </button>
    </form>
  );
}
