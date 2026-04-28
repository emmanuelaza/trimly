import React from 'react';
import { notFound } from 'next/navigation';
import { getBarbershopBySlug, getServicesByBarbershop, getBarbersByBarbershop } from '@/app/actions/booking';
import BookingClient from './BookingClient';

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const barbershop = await getBarbershopBySlug(slug);
  
  if (!barbershop) {
    notFound();
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
}
