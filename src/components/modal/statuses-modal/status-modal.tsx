"use client";

import { useEffect, useRef } from "react";
import "./status-modal.css";

type StatusModalProps = {
  status: "idle" | "enviando" | "ok" | "erro";
  errorMessage?: string;
  onClose: () => void;
};

export function StatusModal({ status, errorMessage, onClose }: StatusModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = status !== "idle";
  const sending = status === "enviando";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // lock the page scroll while the modal is open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        // ESC: never close while sending
        e.preventDefault();
        if (!sending) onClose();
      }}
      onClick={(e) => {
        // backdrop click: never close while sending
        if (e.target === e.currentTarget && !sending) onClose();
      }}
      aria-busy={sending}
      className="status-dialog m-auto w-[90%] max-w-sm rounded-xl bg-white p-0 text-gray-900 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      {/* key: remounts the content on each status, so the animations replay */}
      <div
        key={status}
        role={status === "erro" ? "alert" : "status"}
        aria-live="polite"
        className="flex flex-col items-center gap-4 px-8 py-10 text-center"
      >
        {sending && (
          <>
            <div
              className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-[#0ABDAD] motion-reduce:animate-pulse"
              aria-hidden="true"
            />
            <div className="status-text flex flex-col gap-1">
              <p className="text-lg font-semibold">Sending...</p>
              <p className="text-sm text-gray-500">
                Please keep this page open while we send your application.
              </p>
            </div>
          </>
        )}

        {status === "ok" && (
          <>
            <svg
              viewBox="0 0 52 52"
              className="h-16 w-16"
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle
                className="status-check-circle"
                cx="26"
                cy="26"
                r="25"
                stroke="#0ABDAD"
              />
              <path
                className="status-check-mark"
                d="M15 27l8 8 15-16"
                stroke="#0ABDAD"
              />
            </svg>
            <div className="status-text flex flex-col gap-1">
              <p className="text-lg font-semibold">
                Application sent successfully!
              </p>
              <p className="text-sm text-gray-500">
                We will contact you soon.
              </p>
            </div>
          </>
        )}

        {status === "erro" && (
          <>
            <svg
              viewBox="0 0 52 52"
              className="status-icon-pop h-16 w-16"
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="26" cy="26" r="25" stroke="#dc2626" />
              <path d="M26 15v14M26 36v1" stroke="#dc2626" />
            </svg>
            <div className="status-text flex flex-col gap-1">
              <p className="text-lg font-semibold">Something went wrong</p>
              <p className="text-sm text-gray-500">
                {errorMessage || "Something went wrong. Please try again."}
              </p>
            </div>
          </>
        )}

        {!sending && (
          <button
            type="button"
            onClick={onClose}
            className="status-text mt-2 cursor-pointer rounded-md bg-[#0ABDAD] px-5 py-2 text-sm font-medium text-white hover:bg-[#0a8c7f]"
          >
            {status === "ok" ? "Close" : "Try again"}
          </button>
        )}
      </div>
    </dialog>
  );
}
