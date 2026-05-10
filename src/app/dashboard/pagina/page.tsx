import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getBarbershopId } from '@/lib/getBarbershopId';
import PaginaClient from './PaginaClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaginaPage() {
  const supabase = await createClient();
  const barbershopId = await getBarbershopId();

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('name, slug')
    .eq('id', barbershopId)
    .single();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-text-primary tracking-tight">Mi página pública</h1>
        <p className="text-text-tertiary">Personaliza y comparte tu link de reservas online.</p>
      </div>

      <PaginaClient barbershop={barbershop} />
    </div>
  );
}
