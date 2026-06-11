import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

// Body / UI: Inter — high legibility for paragraphs, nav, controls.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Display / headings: Fraunces — warm serif that echoes the TW monogram.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Toby Wilde",
    template: "%s — Toby Wilde",
  },
  description:
    "PropTech entrepreneur, speaker, and founder of Oparo — redefining real estate through technology, data, and purpose.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
