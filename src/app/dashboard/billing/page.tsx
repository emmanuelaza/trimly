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

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('barbershop_id', barbershopId)
    .eq('status', 'active')
    .maybeSingle();

  return <BillingClient barbershop={barbershop} currentPlanId={subscription?.plan_id} />;
}
