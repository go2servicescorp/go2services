import { Briefcase } from "lucide-react";
import Image from "next/image";
import { ServiceCards } from "./services-card";

export default function Services() {
  return (
    <main className="flex-1">
      {/* Hero — coluna no mobile, linha no desktop */}
      <section className="flex flex-col md:flex-row items-center justify-center p-8 gap-8 bg-[#0ABDAD]/20">
        {/* Título — primeiro no mobile, segundo no desktop */}
        <div className="flex items-center justify-center md:flex-1 gap-2 order-first md:order-last">
          <Briefcase className="text-[#0ABDAD] w-10 h-10 md:w-16 md:h-16 flex-shrink-0" />
          <h1 className="text-5xl md:text-7xl font-bold text-center md:text-left">
            Services
          </h1>
        </div>

        {/* Imagem — segunda no mobile, primeira no desktop */}
        <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden order-last md:order-first">
          <Image
            src="/services.webp"
            alt="Go2Rent"
            fill
            className="object-cover opacity-80"
          />
        </div>
      </section>

      {/* Texto */}
      <section className="flex items-center justify-center py-10 px-6 md:px-8">
        <div className="w-full md:w-3/4 flex flex-col gap-5 text-gray-700 text-base md:text-xl leading-relaxed">
          <p className="text-center">The Functionality You Will Love</p>
          <ServiceCards />
        </div>
      </section>
    </main>
  );
}
