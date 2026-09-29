import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "THE.HUMAN.CHOICE – Count & Rank",
  description: "Die öffentliche Push-up-Rangliste für Männer: zählen, speichern und fair vergleichen.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><head><meta name="theme-color" content="#17272d" /><link rel="stylesheet" href="/shared-menu.css?v=202" /><link rel="preload" as="image" href="/clock-earth-moon-gold-v2.png" /></head><body>{children}<Script src="/shared-menu.js?v=202" strategy="afterInteractive" /><Script src="/voice-number-input.js" strategy="afterInteractive" /></body></html>;
}
