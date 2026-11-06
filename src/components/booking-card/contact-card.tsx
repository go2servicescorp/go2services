"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react";
import { ContactForm } from "../contact/contact-form"; // adjust the path to where your ContactForm lives

type ContactCardProps = {
  applyHref: string;
  roomName: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ContactCard({
  applyHref,
  roomName,
  defaultOpen = false,
  onOpenChange,
}: ContactCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  // mounts the form (and the Turnstile widget) only after the first opening,
  // then keeps it mounted so what the person typed is not lost when collapsing
  const [hasOpened, setHasOpened] = useState(defaultOpen);

  const id = useId();
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Primary action */}
      <Link
        href={applyHref}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0ABDAD] px-5 py-4 text-lg font-bold text-white transition-colors hover:bg-[#079b8d]"
      >
        Apply now
        <ArrowRight size={20} />
      </Link>

      {/* Accordion trigger */}
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          const next = !open;
          setOpen(next);
          setHasOpened(true);
          onOpenChange?.(next);
        }}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-[3px] border-[#0ABDAD] bg-[#f7fffd] px-5 py-3 text-lg font-bold text-[#0ABDAD] transition-colors hover:bg-[#e8faf8]"
      >
        <MessageCircle size={20} />
        Contact
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion panel: grid-rows 0fr -> 1fr animates the height */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        {/* -mx-1/px-1: keeps the focus rings of the inputs from being clipped */}
        <div className="-mx-1 overflow-hidden px-1">
          <div className="pt-4">
            {hasOpened && <ContactForm roomName={roomName} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Usage:

<ContactCard applyHref="/apply" roomName="Room 3" />

*/
