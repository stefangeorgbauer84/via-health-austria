import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WohinMedizin.at — Wissen, wohin bei Gesundheitsfragen.",
  description:
    "WohinMedizin.at hilft dir, Beschwerden besser zu verstehen, passende Fachrichtungen zu erkennen und geeignete medizinische Anlaufstellen in Österreich zu finden.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
