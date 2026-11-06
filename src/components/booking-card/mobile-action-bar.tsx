"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { ContactForm } from "../contact/contact-form";
import { LinkHref } from "./booking-card";

type MobileActionBarProps = {
  applyHref: LinkHref;
  roomName: string;
  isAvailable: boolean;
};

const BTN =
  "flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

export function MobileActionBar({
  applyHref,
  roomName,
  isAvailable,
}: MobileActionBarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [hasOpened, setHasOpened] = useState(false);
  const titleId = useId();

  function openSheet() {
    setHasOpened(true);
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
  }

  function closeSheet() {
    dialogRef.current?.close();
  }

  return (
    <>
      {/* Barra fixa */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-gray-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        {isAvailable && (
          <Link
            href={applyHref}
            className={`${BTN} flex-2 bg-teal-700 text-white hover:bg-teal-800`}
          >
            Apply now
            <ArrowRight size={16} aria-hidden />
          </Link>
        )}

        <button
          type="button"
          aria-haspopup="dialog"
          onClick={openSheet}
          className={`${BTN} ${
            isAvailable
              ? "flex-2 border border-teal-700 text-teal-700 active:bg-teal-50"
              : "flex-1 bg-teal-700 text-white hover:bg-teal-800"
          }`}
        >
          <MessageCircle size={16} aria-hidden />
          Contact
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => {
          document.body.style.overflow = "";
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSheet();
        }}
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-0 backdrop:bg-black/40 open:animate-[sheet-in_250ms_ease-out] motion-reduce:animate-none lg:hidden"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2">
          <h2 id={titleId} className="text-base font-bold">
            Contact us
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {hasOpened && <ContactForm roomName={roomName} />}
        </div>
      </dialog>
    </>
  );
}
