import { notFound } from "next/navigation";
import { ApplicationForm } from "./application-form";

// Next.js 15+: searchParams is a Promise.
// (On Next 14, change the type to Record<...> and remove the `await`.)
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Takes the first value, trims spaces, and returns "" if nothing was sent
const firstValue = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const room = firstValue(params.room);
  if (!room) notFound(); // or redirect to the rooms list

  return (
    <ApplicationForm
      key={room}
      room={room}
      street={firstValue(params.street)}
      monthlyRent={firstValue(params.monthlyRent)}
      deposit={firstValue(params.deposit)}
    />
  );
}
