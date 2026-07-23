import { useState } from "react";
import { FormField } from "../form/form-field";
import { Send } from "lucide-react";

export function ContactUs({
  setSubmitted,
}: {
  setSubmitted: (value: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const allFilled = Object.values(fields).every((v) => v.trim() !== "");
  const canSubmit = allFilled;

  function handleChange(name: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [name]: e.target.value }));
    };
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact/us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });

      if (!response.ok) {
        throw new Error("Failed to send contact form");
      }

      setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <FormField
          label="Your Name"
          name="fullName"
          type="text"
          required
          placeholder="John Doe"
          onChange={handleChange("fullName")}
        />

        <FormField
          label="E-mail"
          name="email"
          type="email"
          required
          placeholder="john@email.com"
          onChange={handleChange("email")}
        />

        <FormField
          label="Subject"
          name="subject"
          type="text"
          required
          placeholder="How can we help?"
          onChange={handleChange("subject")}
        />

        <FormField
          label="Message"
          name="message"
          type="textarea"
          required
          placeholder="Tell us more..."
          onChange={handleChange("message")}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0ABDAD] text-white text-sm font-semibold hover:bg-[#09a89a] active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#0ABDAD] disabled:active:scale-100"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
