import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mpPreference } from '@/lib/mercadopago';
import { getBarbershopId } from '@/app/actions/utils';
import { createSubscription } from '@/app/actions/subscriptions';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const barbershopId = await getBarbershopId();
    if (!barbershopId) return NextResponse.json({ error: 'No barbershop found' }, { status: 404 });

    const result = await mpPreference.create({
      body: {
        items: [{
          id: 'lifetime',
          title: 'Trimly Lifetime',
          quantity: 1,
          unit_price: 599000,
          currency_id: 'COP'
        }],
        payer: { email: user.email },
        back_urls: {
          success: `https://trimlyapp-phi.vercel.app/dashboard/billing?status=success`,
          failure: `https://trimlyapp-phi.vercel.app/dashboard/billing?status=failed`,
          pending: `https://trimlyapp-phi.vercel.app/dashboard/billing?status=pending`
        },
        auto_return: 'approved',
        external_reference: barbershopId
      }
    });

    if (result.init_point) {
      await createSubscription('lifetime', undefined, result.id);
      return NextResponse.json({ init_point: result.init_point });
    }

    throw new Error('Failed to create preference');
  } catch (error: any) {
    console.error('Checkout Lifetime Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
