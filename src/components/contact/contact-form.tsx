import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { FormField } from "../form/form-field";
import ContactSuccess from "./contact-success";
import PhoneInput, {
  isValidPhoneNumber,
  formatPhoneNumberIntl,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

const initialState = {
  fullName: "",
  email: "",
  phone: "",
  introduction: "",
  availableDates: "",
};

export function ContactForm({ roomName }: { roomName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fields, setFields] = useState(initialState);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);

  const allFilled = Object.values(fields).every((v) => v.trim() !== "");
  const phoneValid = fields.phone ? isValidPhoneNumber(fields.phone) : false;
  const canSubmit = allFilled && phoneValid && agreed && token !== "";

  function handleChange(name: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [name]: e.target.value }));
    };
  }

  function handleReset() {
    setSubmitted(false);
    setFields(initialState);
    setAgreed(false);
    setTouched(false);
    setError("");
    setToken(""); // o Turnstile será remontado e gerará um novo token
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    // Honeypot: campo escondido, deve permanecer vazio
    const formData = new FormData(event.currentTarget);
    const website = (formData.get("website") as string) ?? "";

    const payload = {
      ...fields,
      phone: fields.phone ? formatPhoneNumberIntl(fields.phone) : fields.phone,
      room: roomName,
      website,
      turnstileToken: token,
    };

    try {
      const response = await fetch("/api/contact/form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Too many attempts. Please try again in a few minutes.",
          );
        }
        throw new Error("Failed to send contact form");
      }

      setSubmitted(true); // só mostra sucesso se realmente enviou
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
  console.log("SITE KEY:", process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  return (
    <form
      className="rounded-lg border border-[#d8ebe8] bg-[#f7fffd] p-5"
      onSubmit={onSubmit}
    >
      {submitted ? (
        <ContactSuccess clearForm={handleReset} />
      ) : (
        <>
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
            onChange={handleChange("email")}
          />
          <div className="mb-4 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[1.2px] text-[#6f665d]">
              Phone
              <span className="text-red-500">*</span>
            </span>
            <PhoneInput
              international
              defaultCountry="CA"
              value={fields.phone}
              onChange={(value) =>
                setFields((prev) => ({ ...prev, phone: value ?? "" }))
              }
              onBlur={() => setTouched(true)}
              placeholder="Digite o número"
              className={`flex items-center gap-2 rounded border px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-[#0ABDAD]/20 ${
                touched && !phoneValid
                  ? "border-red-400 focus-within:border-red-400"
                  : "border-[#bfe8e3] focus-within:border-[#0ABDAD]"
              }`}
              numberInputProps={{
                className:
                  "flex-1 border-none outline-none text-sm bg-transparent",
              }}
            />
            {touched && !phoneValid && (
              <p className="mt-1 text-xs text-red-500">
                {fields.phone
                  ? "Invalid phone number"
                  : "Phone number is required"}
              </p>
            )}
          </div>
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

          {/* Honeypot: invisível para humanos, bots costumam preencher */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          />

          <div className="mt-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setToken}
              onExpire={() => setToken("")}
              onError={() => setToken("")}
            />
          </div>

          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}

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
        </>
      )}
    </form>
  );
}
