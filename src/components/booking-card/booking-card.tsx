"use client";

import { ComponentProps, useState } from "react";
import { BookingCardActions } from "./booking-card-actions";
import { BookingCardHeader } from "./booking-card-header";
import Link from "next/link";
import { MobileActionBar } from "./mobile-action-bar";

export type LinkHref = ComponentProps<typeof Link>["href"];

interface BookingCardProps {
  applyHref: LinkHref;
  roomName: string;
  moveInDate: Date | string;
  isAvailable: boolean;
}

export function BookingCard({
  applyHref,
  roomName,
  moveInDate,
  isAvailable,
}: BookingCardProps) {
  return (
    <>
      <aside className="hidden sm:sticky sm:top-4 sm:ml-auto sm:block sm:w-100 sm:shrink-0 sm:self-start">
        <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-4 sm:max-h-[calc(100vh-2rem)] sm:overflow-y-auto">
          <BookingCardHeader
            title="Interested in this room?"
            moveIn={moveInDate}
            isAvailable={isAvailable}
          />
          <BookingCardActions
            applyHref={applyHref}
            roomName={roomName}
            isAvailable={isAvailable}
          />
        </div>
      </aside>

      <MobileActionBar
        applyHref={applyHref}
        roomName={roomName}
        isAvailable={isAvailable}
      />
    </>
  );
}
