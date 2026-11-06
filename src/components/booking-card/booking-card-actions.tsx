"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react";
import { ContactForm } from "../contact/contact-form"; // adjust the path to where your ContactForm lives
import { LinkHref } from "./booking-card";

type BookingCardActionsProps = {
  applyHref: LinkHref;
  roomName: string;
  defaultOpen?: boolean;
  isAvailable: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function BookingCardActions({
  applyHref,
  roomName,
  defaultOpen = false,
  isAvailable,
  onOpenChange,
}: BookingCardActionsProps) {
  const [open, setOpen] = useState(defaultOpen);
  // mounts the form (and the Turnstile widget) only after the first opening,
  // then keeps it mounted so what the person typed is not lost when collapsing
  const [hasOpened, setHasOpened] = useState(defaultOpen);

  const id = useId();
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;

  const BTN =
    "flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]";

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-2">
        {/* Primary action */}
        {isAvailable ? (
          <Link
            href={applyHref}
            className={`${BTN} bg-[#0F766E] font-semibold text-white hover:bg-[#0D5F59]`}
          >
            Apply now
            <ArrowRight size={16} aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className={`${BTN} cursor-not-allowed bg-gray-100 font-semibold text-gray-400`}
          >
            Apply now
            <ArrowRight size={16} aria-hidden />
          </button>
        )}

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
          className={`${BTN} cursor-pointer font-medium text-[#0F766E] ${
            open
              ? "border-2 border-[#0F766E] bg-[#F0FDFA]"
              : "border border-[#0F766E] hover:bg-[#F0FDFA]"
          }`}
        >
          <MessageCircle size={16} aria-hidden />
          Contact
          <ChevronDown
            size={16}
            aria-hidden
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Accordion panel (sem gap no pai: o espaço vem do pt-4 interno) */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="-mx-1 overflow-hidden px-1">
          <div className="pt-4">
            {hasOpened && <ContactForm roomName={roomName} />}
          </div>
        </div>
      </div>
    </div>
  );
}
