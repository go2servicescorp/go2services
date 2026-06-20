import { useState } from "react";
import { FormField } from "../form/form-field";

export function ContactForm({ roomName }: { roomName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);

    const filledFields = { ...fields, room: roomName };

    try {
      const response = await fetch("/api/contact/form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filledFields),
      });

      if (!response.ok) {
        throw new Error("Failed to send contact form");
      }

      alert("Email enviado!");
    } catch (error) {
      console.error(error);
      alert("Não foi possível enviar o email. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
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
        className="mt-2 flex w-full items-center justify-center gap-2 rounded px-4 py-3 text-sm font-black uppercase tracking-[1px] text-white transition disabled:cursor-not-allowed disabled:opacity-40 bg-[#0ABDAD] hover:bg-[#079b8d] disabled:hover:bg-[#0ABDAD]"
        type="submit"
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Sending...
          </>
        ) : (
          "Send request"
        )}
      </button>
    </form>
  );
}
