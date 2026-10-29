import type { Metadata } from "next";
import "./globals.css";
import { RoomsProvider } from "@/provider/RoomsProvider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Go2Rent",
  description: "Room listings for furnished rentals",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased">
      <body
        className="min-h-full flex flex-col items-center"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
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
