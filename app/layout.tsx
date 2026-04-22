import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookCut — Terminbuchung für Salons",
  description: "Online-Terminbuchung, SMS-Erinnerungen und Kundenverwaltung für deinen Salon. Ohne Vertrag, sofort einsatzbereit.",
  keywords: "Salon Terminbuchung, Friseur Software, Beauty Salon Austria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={plusJakartaSans.variable}>
      <body className="antialiased bg-sand-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
