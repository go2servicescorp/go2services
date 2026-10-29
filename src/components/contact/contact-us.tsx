import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { FormField } from "../form/form-field";
import { Send } from "lucide-react";

export function ContactUs({
  setSubmitted,
}: {
  setSubmitted: (value: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const allFilled = Object.values(fields).every((v) => v.trim() !== "");
  const canSubmit = allFilled && token !== "";

  function handleChange(name: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [name]: e.target.value }));
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    // Honeypot: campo escondido, deve permanecer vazio
    const formData = new FormData(event.currentTarget);
    const website = (formData.get("website") as string) ?? "";

    try {
      const response = await fetch("/api/contact/us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...fields,
          website,
          turnstileToken: token,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Too many attempts. Please try again in a few minutes.",
          );
        }
        throw new Error("Failed to send contact form");
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message.startsWith("Too many")
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      // O token é de uso único: sempre gerar um novo
      turnstileRef.current?.reset();
      setToken("");
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

        {/* Honeypot: invisível para humanos, bots costumam preencher */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0 }}
        />
      </div>

      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setToken}
        onExpire={() => setToken("")}
        onError={() => setToken("")}
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

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
