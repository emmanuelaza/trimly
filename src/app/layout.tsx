import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Trimly | SaaS para Barberías Premium",
  description: "Gestión inteligente y recurrencia para tu barbería.",
};

import ToasterProvider from "@/components/providers/ToasterProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-background-primary text-text-primary selection:bg-accent selection:text-background-primary transition-colors duration-300">
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
