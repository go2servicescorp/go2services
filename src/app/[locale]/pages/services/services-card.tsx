import { Car, Building2, FileText, Sparkles, Wrench } from "lucide-react";

const services = [
  {
    icon: Car,
    title: "Transfer",
    description:
      "We offer safe and reliable transportation to your desired destination. Our experienced drivers and comfortable vehicles ensure a stress-free journey. Book your transfer now and enjoy a hassle-free ride!",
  },
  {
    icon: Building2,
    title: "Bank Account",
    description:
      "Looking to open a bank account? Our partnership can assist you with that. We offer a simple and stress-free process to help you get started. Get in touch with us now to find out more.",
  },
  {
    icon: FileText,
    title: "Documents",
    description:
      "Moving to a new place can be overwhelming, especially when it comes to getting all the necessary documents in order. That's where we come in — we offer a service to help you obtain the required paperwork and get started on your new journey.",
  },
  {
    icon: Sparkles,
    title: "Cleaning",
    description:
      "We offer top-notch cleaning services for our accommodation and other spaces. Our team of professionals is dedicated to providing you with a clean and comfortable environment. Contact us today to schedule your cleaning appointment.",
  },
  {
    icon: Wrench,
    title: "Handyman",
    description:
      "We have a team of highly qualified professionals who are dedicated to top-notch services to our clients. From fixing a leaky faucet to remodeling your entire home, we've got you covered.",
  },
];

export function ServiceCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="flex flex-col gap-4 p-6 bg-white border border-[#ddd5c8] rounded-2xl shadow-sm hover:shadow-md hover:border-[#0ABDAD] transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0ABDAD]/10">
              <Icon size={20} className="text-[#0ABDAD]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1410]">{title}</h3>
          </div>
          <p className="text-base text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>
      ))}
    </div>
  );
}
