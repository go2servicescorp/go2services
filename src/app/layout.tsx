import type { Metadata } from "next";
import "./globals.css";
import { RoomsProvider } from "@/provider/RoomsProvider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Go2Rent",
  description: "Room listings for furnished rentals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col items-center"
        suppressHydrationWarning
      >
        <RoomsProvider>
          <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1">
            <Header />
            {children}
            <Footer />
          </div>
        </RoomsProvider>
      </body>
    </html>
  );
}
