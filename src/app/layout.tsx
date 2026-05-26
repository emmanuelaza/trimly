import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    <html lang="es" className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "b2d99d08-461f-42cd-ab77-46cd1ce60963",
                  notifyButton: { enable: false },
                  promptOptions: {
                    slidedown: {
                      prompts: [{
                        type: "push",
                        autoPrompt: false,
                      }]
                    }
                  }
                });
              });
            `
          }}
        />
      </head>
      <body className="bg-background-primary text-text-primary selection:bg-accent/15 transition-colors duration-300">
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
