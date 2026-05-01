import type { Metadata } from "next";
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: "Trimly — Digitaliza tu barbería hoy",
  description: "Agenda online, automatizaciones y reportes para barberías en Colombia, España y Estados Unidos. Empieza gratis en minutos.",
  metadataBase: new URL('https://trimly.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Trimly — Digitaliza tu barbería hoy",
    description: "La plataforma de gestión líder para barberías en Colombia, España y EE.UU.",
    url: 'https://trimly.co',
    siteName: 'Trimly',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trimly — Digitaliza tu barbería hoy',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Trimly — Digitaliza tu barbería hoy",
    description: "Agenda online, automatizaciones y reportes para barberías en Colombia, España y Estados Unidos. Empieza gratis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "Trimly",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": "Plataforma de gestión para barberías colombianas. Agenda online, automatizaciones y reportes.",
                "offers": [
                  {
                    "@type": "Offer",
                    "name": "Plan Básico",
                    "price": "29900",
                    "priceCurrency": "COP",
                    "billingIncrement": "month"
                  },
                  {
                    "@type": "Offer",
                    "name": "Plan Filo Pro",
                    "price": "79900",
                    "priceCurrency": "COP",
                    "billingIncrement": "month"
                  }
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "reviewCount": "50"
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "¿Necesito saber de tecnología para usar Trimly?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Para nada. Si sabes usar WhatsApp y Instagram, te sobra. La configuración inicial toma menos de 5 minutos."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "¿Puedo cancelar cuando quiera?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Sí, sin contratos ni permanencia. Cancelas desde tu cuenta en cualquier momento."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />
      <LandingPage />
    </>
  );
}
