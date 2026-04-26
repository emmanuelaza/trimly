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

    const planId = process.env.MP_PLAN_ID_MENSUAL;
    if (!planId) return NextResponse.json({ error: 'Plan ID not configured' }, { status: 500 });

    const result = await mpPreApproval.create({
      body: {
        preapproval_plan_id: planId,
        payer_email: user.email,
        back_url: `https://trimlyapp-phi.vercel.app/dashboard/billing?status=success`,
        status: 'pending',
        external_reference: barbershopId,
        reason: 'Trimly Plan Mensual'
      }
    });

    if (result.init_point) {
      // Create pending record in DB
      await createSubscription('mensual', result.id);
      return NextResponse.json({ init_point: result.init_point });
    }

    throw new Error('Failed to create preapproval');
  } catch (error: any) {
    console.error('Checkout Mensual Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
