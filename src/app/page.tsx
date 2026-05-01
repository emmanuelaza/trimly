import type { Metadata } from "next";
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: "Trimly — Digitaliza tu barbería hoy",
  description: "Agenda online, automatizaciones y reportes para barberías en Colombia, España y Estados Unidos. Empieza gratis en minutos.",
  openGraph: {
    title: "Trimly — Digitaliza tu barbería hoy",
    description: "La plataforma de gestión líder para barberías en Colombia, España y EE.UU.",
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return <LandingPage />;
}
