import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Home, Users, Briefcase, Mail } from "lucide-react";

const navItems = [
  { label: "Home", href: "/pages/home", icon: Home },
  { label: "About Us", href: "/pages/about", icon: Users },
  { label: "Services", href: "/pages/services", icon: Briefcase },
  { label: "Contact", href: "/pages/contact", icon: Mail },
];

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open navigation menu"
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors"
      >
        <Menu size={20} color="#000000" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-white border border-[#ddd5c8] rounded-2xl shadow-lg overflow-hidden z-50"
        >
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a1410] hover:bg-[#d7fdf5] transition-colors"
            >
              <Icon size={15} className="text-[#0ABDAD] flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
