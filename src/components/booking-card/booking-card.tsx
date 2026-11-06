"use client";

import { ComponentProps, useState } from "react";
import { BookingCardActions } from "./booking-card-actions";
import { BookingCardHeader } from "./booking-card-header";
import Link from "next/link";

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
    <aside className="w-full lg:sticky lg:top-4 lg:ml-auto lg:mt-14 lg:w-100 lg:shrink-0 lg:self-start">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
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
  );
}
