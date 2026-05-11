import type { Metadata } from "next";
import { Syne, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geist = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
    <html lang="es" className={`${syne.variable} ${geist.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background-primary text-text-primary selection:bg-accent/20 selection:text-primary-light transition-colors duration-300">
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
