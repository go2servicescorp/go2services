import { Home, MailIcon, PhoneIcon } from "lucide-react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

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

const navItems = [
  { label: "Home", href: "/pages/home" },
  { label: "About Us", href: "/pages/about" },
  { label: "Services", href: "/pages/services" },
  { label: "Contact", href: "/pages/contact" },
];

const serviceItems = [
  { label: "Accommodations", href: "/pages/accommodations" },
  { label: "Transfers", href: "#" },
  { label: "Cleaning", href: "#" },
  { label: "Parking", href: "#" },
  { label: "Bank Account", href: "#" },
  { label: "Documents", href: "#" },
  { label: "Handyman", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-white px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 grid gap-8 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* brand */}
          <div>
            <span className="mb-3 block font-serif text-xl text-[#1a1a1a]">
              <Image
                src="/logo.png"
                alt="Go 2 Corp"
                width={40}
                height={40}
                loading="lazy"
              />
            </span>
            <p className="text-[13px] leading-relaxed text-[#999]">
              Rental, transfer, and accommodation services in Vancouver since
              2019.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="tel:+17783186563"
                className="flex items-center gap-2 text-[13px] text-[#666] hover:text-[#1a1a1a]"
              >
                <PhoneIcon size={16} /> +1 778-318-6563
              </a>
              <a
                href="mailto:support@go2services.ca"
                className="flex items-center gap-2 text-[13px] text-[#666] hover:text-[#1a1a1a]"
              >
                <MailIcon size={16} /> support@go2services.ca
              </a>
            </div>
          </div>

          <FooterCol title="Services" links={serviceItems} />
          <FooterCol title="Company" links={navItems} />

          <div>
            <p className="mb-3 text-[12px] font-medium uppercase tracking-widest text-[#1a1a1a]">
              Connect
            </p>
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-[#666] transition-colors hover:border-[#2d7a5f] hover:text-[#2d7a5f]"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#eee] pt-6">
          <p className="text-[12px] text-[#ccc]">
            © 2024 Go 2 Corp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<Record<string, string>>;
}) {
  return (
    <div>
      <p className="mb-3 text-[12px] font-medium uppercase tracking-widest text-[#1a1a1a]">
        {title}
      </p>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          className="mb-1.5 block text-[13px] text-[#999] hover:text-[#1a1a1a]"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
