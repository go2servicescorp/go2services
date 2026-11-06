import { Users } from "lucide-react";
import Image from "next/image";

export default function AboutUs() {
  return (
    <main className="flex-1 h-[calc(100dvh-80px)] flex flex-col overflow-hidden">
      {/* Hero — coluna no mobile, linha no desktop */}
      <section className="flex flex-col md:flex-row items-center justify-center p-8 gap-8 bg-[#0ABDAD]/20">
        <div className="flex items-center justify-center md:flex-1 gap-2">
          <Users className="text-[#0ABDAD] w-10 h-10 md:w-16 md:h-16 flex-shrink-0" />
          <h1 className="text-5xl md:text-7xl font-bold text-center md:text-left">
            About Us
          </h1>
        </div>
        <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden">
          <Image
            src="/about_us.avif"
            alt="Go2Rent"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Texto */}
      <section className="flex items-center justify-center py-10 px-6 md:px-8">
        <div className="w-full md:w-3/4 flex flex-col gap-5 text-gray-700 text-base md:text-xl leading-relaxed">
          <p className="first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-none">
            At Go 2 Rent & Services Corp, we understand the challenges of
            settling in a new country. As a Brazilian couple who has been
            through it ourselves, we know how overwhelming it can be.
            That&apos;s why we&apos;ve made it our mission.
          </p>
          <p>
            We provide a complete package for newcomers and students who are
            unsure of what to do. We offer assistance to help you settle in and
            make the transition as smooth as possible. Let us help you get
            started on your new journey!
          </p>
          <p>
            The company also provides exceptional services to property owners
            and tenants. With years of experience in the industry, we have built
            a reputation for excellence and professionalism. Our team of experts
            is dedicated to ensuring that your property is well-maintained and
            tenants are satisfied.
          </p>
        </div>
      </section>
    </main>
  );
}
