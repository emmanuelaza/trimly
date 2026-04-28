import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mpPreApproval } from '@/lib/mercadopago';
import { getBarbershopId } from '@/app/actions/utils';
import { createSubscription } from '@/app/actions/subscriptions';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const barbershopId = await getBarbershopId();
    if (!barbershopId) return NextResponse.json({ error: 'No barbershop found' }, { status: 404 });

    const planId = process.env.MP_PLAN_ID_ANUAL;
    if (!planId) return NextResponse.json({ error: 'Plan ID not configured' }, { status: 500 });

    const checkoutUrl = `https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=${planId}`;
    
    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Checkout Anual Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
