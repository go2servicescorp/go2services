"use client";

import { useState } from "react";
import { Phone, Mail, Send } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaInstagram } from "react-icons/fa";

const socials = [
  {
    icon: FaFacebook,
    href: "https://www.facebook.com/people/GoTwo-Prime-Living/pfbid02NqdVCuAf3zNf5x7rR9ZdsZEX4Eu1FA5hfJByH9eCzpijvsCTdT4G3D5a6yCEwMBCl/?mibextid=wwXIfr&rdid=BIUp1o8XR0iex6m6&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DweBRFqcF%2F%3Fmibextid%3DwwXIfr",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/go2corp",
    label: "Instagram",
  },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/17783186563?text=Hello%2C%20I%20found%20you%20on%20Go2Rent!",
    label: "WhatsApp",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <main className="flex-1 min-h-[calc(100dvh-80px)] grid grid-cols-1 md:grid-cols-2">
      {/* Esquerda — informações */}
      <section className="flex flex-col items-center justify-center gap-8 p-10 md:p-16 bg-[#0ABDAD]/10 border-r border-[#ddd5c8]">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <Mail className="text-[#0ABDAD] w-10 h-10 md:w-12 md:h-12 flex-shrink-0" />
            <h1 className="text-5xl md:text-6xl font-bold text-[#1a1410] leading-tight">
              Contact Us
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            <a
              href="tel:7783186563"
              className="flex items-center gap-3 text-[#1a1410] hover:text-[#0ABDAD] transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0ABDAD]/10 group-hover:bg-[#0ABDAD]/20 transition-colors">
                <Phone size={18} className="text-[#0ABDAD]" />
              </div>
              <span className="text-base font-medium">(778) 318-6563</span>
            </a>

            <a
              href="mailto:support@go2servicesca.com"
              className="flex items-center gap-3 text-[#1a1410] hover:text-[#0ABDAD] transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0ABDAD]/10 group-hover:bg-[#0ABDAD]/20 transition-colors">
                <Mail size={18} className="text-[#0ABDAD]" />
              </div>
              <span className="text-base font-medium">
                support@go2servicesca.com
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#ddd5c8] text-[#888] hover:border-[#0ABDAD] hover:text-[#0ABDAD] transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Direita — formulário */}
      <section className="flex items-center justify-center p-10 md:p-16 bg-white">
        {submitted ? (
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
              onClick={handleReset}
              className="mt-2 text-sm text-[#0ABDAD] hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-xs uppercase tracking-[1.5px] text-[#8a7f72]"
              >
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-[#ddd5c8] bg-white text-sm text-[#1a1410] placeholder:text-[#ccc] outline-none focus:border-[#0ABDAD] focus:ring-2 focus:ring-[#0ABDAD]/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-[1.5px] text-[#8a7f72]"
              >
                Email <span className="text-[#0ABDAD]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="john@email.com"
                className="w-full px-4 py-3 rounded-xl border border-[#ddd5c8] bg-white text-sm text-[#1a1410] placeholder:text-[#ccc] outline-none focus:border-[#0ABDAD] focus:ring-2 focus:ring-[#0ABDAD]/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="subject"
                className="text-xs uppercase tracking-[1.5px] text-[#8a7f72]"
              >
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="w-full px-4 py-3 rounded-xl border border-[#ddd5c8] bg-white text-sm text-[#1a1410] placeholder:text-[#ccc] outline-none focus:border-[#0ABDAD] focus:ring-2 focus:ring-[#0ABDAD]/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message"
                className="text-xs uppercase tracking-[1.5px] text-[#8a7f72]"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us more..."
                className="w-full px-4 py-3 rounded-xl border border-[#ddd5c8] bg-white text-sm text-[#1a1410] placeholder:text-[#ccc] outline-none focus:border-[#0ABDAD] focus:ring-2 focus:ring-[#0ABDAD]/20 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0ABDAD] text-white text-sm font-semibold hover:bg-[#09a89a] active:scale-[0.98] transition-all"
            >
              <Send size={16} />
              Send Message
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
