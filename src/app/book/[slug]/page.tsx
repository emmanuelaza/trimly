import React from 'react';
import { notFound } from 'next/navigation';
import { getBarbershopBySlug, getServicesByBarbershop, getBarbersByBarbershop } from '@/app/actions/booking';
import BookingClient from './BookingClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    const barbershop = await getBarbershopBySlug(slug);
    
    if (!barbershop) {
      notFound();
    }

    const isFiloPro = barbershop.subscription_status === 'trialing' || barbershop.plan === 'pro';

    if (!isFiloPro) {
      return (
        <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-2xl font-black text-text-primary mb-3">Reservas en Línea no Disponibles</h1>
          <p className="text-text-tertiary mb-8 max-w-sm">
            Esta barbería actualmente no tiene habilitada la función de reservas en línea.
          </p>
          <a href="/login" className="text-xs font-bold text-accent uppercase tracking-widest hover:underline">
            ¿Eres el dueño? Activa Filo Pro
          </a>
        </div>
      );
    }

    const services = await getServicesByBarbershop(barbershop.id);
    const barbers = await getBarbersByBarbershop(barbershop.id);

    return (
      <div className="min-h-screen bg-background-primary">
        <BookingClient 
          barbershop={barbershop} 
          services={services} 
          barbers={barbers} 
        />
      </div>
    );
  } catch (error) {
    console.error("Error in BookingPage:", error);
    notFound();
  }
}
