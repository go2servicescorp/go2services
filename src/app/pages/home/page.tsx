"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Wifi, Sofa, ParkingSquare, Car, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useIsIOS } from "@/hooks/useIsIOS";

const VancouverMap = dynamic(() => import("@/components/maps"), {
  ssr: false,
});

const accommodations = [
  {
    name: "West End",
    sub: "Near Stanley Park",
    img: "/west_end.avif",
  },
  {
    name: "Downtown",
    sub: "City centre",
    img: "/downtown.avif",
  },
  {
    name: "Chinatown",
    sub: "Cultural district",
    img: "/chinatown.avif",
  },
  {
    name: "Coal Harbour",
    sub: "Waterfront views",
    img: "/coal_harbour.avif",
  },
];

const amenities = [
  { icon: "wifi", label: "Internet", desc: "High-speed Wi-Fi" },
  { icon: "sofa", label: "Fully furnished", desc: "Move-in ready" },
  { icon: "parking", label: "Parking", desc: "On-site available" },
  { icon: "car", label: "Pick up & drop off", desc: "Transfer services" },
  { icon: "sparkles", label: "Cleaning", desc: "Regular service" },
];

export default function HomePage() {
  const isIOS = useIsIOS();
  return (
    <main className="min-h-screen font-sans text-[#1a1a1a]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden bg-[#2d7a5f] w-full px-6 text-center"
        style={{
          backgroundImage: "url('/background_mountain.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: isIOS ? "scroll" : "fixed",
        }}
      >
        {/* subtle diagonal texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#fff,#fff 1px,transparent 1px,transparent 40px)",
          }}
        />

        <div className="relative mx-auto max-w-2xl">
          {/* eyebrow */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-black/80">
            <MapPin />
            Vancouver, Canada
          </span>

          <h1 className="mb-4 font-serif text-5xl font-normal leading-[1.1] text-[#008b8b] sm:text-6xl">
            Welcome
          </h1>

          <p className="mx-auto mb-8 max-w-md text-[20px] leading-relaxed text-black/65">
            We understand that life can get overwhelming, which is why
            we&apos;re here to assist you. Whether you&apos;re looking for
            rental options, reliable transfer services, or comfortable
            accommodation, our dedicated team is prepared to deliver the highest
            quality of service. Let us handle the details so you can focus on
            what truly matters to you.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/pages/accommodations"
              className="rounded-md bg-white px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              View accommodations
            </Link>
            <Link
              href="/pages/contact"
              className="rounded-md border border-black/30 px-6 py-2.5 text-sm font-normal text-black transition-colors hover:bg-black/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>

      {/* ── Accommodations ───────────────────────────────────── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[2px] text-[#2d7a5f]">
              Accommodations
            </p>
            <h2 className="font-serif text-3xl font-normal text-[#1a1a1a] sm:text-4xl">
              Find your neighbourhood
            </h2>
          </div>

          {/* grid separated by 1px lines */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[#e8e4df] sm:grid-cols-4">
            {accommodations.map((acc) => (
              <Link
                key={acc.name}
                // href={`/accommodations/${acc.name.toLowerCase().replace(" ", "-")}`}
                href="#"
                className="group bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={acc.img}
                    alt={acc.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-3.5 pb-4 pt-3">
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    {acc.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#999]">{acc.sub}</p>
                  <span className="mt-2 inline-block rounded-[3px] bg-[#e8f4f0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#2d7a5f]">
                    Available
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Amenities ────────────────────────────────────────── */}
      <section className="bg-[#f5f2ed] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[2px] text-[#2d7a5f]">
              Included in every stay
            </p>
            <h2 className="font-serif text-3xl font-normal text-[#1a1a1a] sm:text-4xl">
              What we offer
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[#e8e4df] sm:grid-cols-5">
            {amenities.map((a) => (
              <div
                key={a.label}
                className="flex flex-col items-center bg-white px-4 py-6 text-center"
              >
                <AmenityIcon name={a.icon} />
                <p className="mt-2.5 text-[13px] font-medium text-[#1a1a1a]">
                  {a.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[#aaa]">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locations ────────────────────────────────────────── */}
      <section className="bg-[#1a1a1a] px-6 py-16">
        <div className="mx-auto grid max-w-4xl items-center gap-12 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[2px] text-[#6ec9a8]">
              Our locations
            </p>
            <h2 className="font-serif text-3xl font-normal text-white sm:text-4xl">
              Central, connected &amp; convenient
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/50">
              Looking for a convenient location for your stay? Our properties
              are situated near grocery stores, restaurants, shops, and public
              transportation making it easy for you to explore the area. Check
              out our locations page to find the perfect spot for you.
            </p>
          </div>

          {/* map placeholder — swap for <GoogleMap /> or next/dynamic embed */}
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-white/10 bg-[#252525]">
            <VancouverMap />
          </div>
        </div>
      </section>
    </main>
  );
}

function AmenityIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="h-6 w-6 text-[#2d7a5f]" />,
    sofa: <Sofa className="h-6 w-6 text-[#2d7a5f]" />,
    parking: <ParkingSquare className="h-6 w-6 text-[#2d7a5f]" />,
    car: <Car className="h-6 w-6 text-[#2d7a5f]" />,
    sparkles: <Sparkles className="h-6 w-6 text-[#2d7a5f]" />,
  };
  return <>{icons[name] ?? null}</>;
}

// export function MapEmbed() {
//   return (
//     <div className="w-full aspect-[4/3] rounded-xl overflow-hidden">
//       <iframe
//         src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83268.55111238468!2d-123.16493421169905!3d49.29264892829354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548673f143a94fb3%3A0xbb9196ea9b81f38b!2sVancouver%2C%20BC%2C%20Canad%C3%A1!5e0!3m2!1spt-BR!2sbr!4v1780175105599!5m2!1spt-BR!2sbr"
//         width="100%"
//         height="100%"
//         loading="lazy"
//         style={{ border: 0 }}
//         referrerPolicy="no-referrer-when-downgrade"
//       />
//     </div>
//   );
// }
