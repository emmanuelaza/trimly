import React from 'react';
import BillingClient from './BillingClient';
import { createClient } from '@/lib/supabase/server';
import { getBarbershopId } from '@/app/actions/utils';

export default async function BillingPage() {
  const supabase = await createClient();
  const barbershopId = await getBarbershopId();
  
  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('*')
    .eq('id', barbershopId)
    .single();

  return <BillingClient barbershop={barbershop} />;
}
