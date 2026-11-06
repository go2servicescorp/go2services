import type { Metadata } from "next";
import "./globals.css";
import { RoomsProvider } from "@/provider/RoomsProvider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Go2Rent",
  description: "Room listings for furnished rentals",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="h-full antialiased">
      <body
        className="min-h-full flex flex-col items-center"
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          <RoomsProvider>
            <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1">
              <Header />
              {children}
              <Footer />
            </div>
          </RoomsProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
