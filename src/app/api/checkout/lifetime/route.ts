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
        items: [
          {
            id: 'lifetime',
            title: 'Trimly Plan Lifetime - Pago Único',
            quantity: 1,
            unit_price: 599000,
            currency_id: 'COP'
          }
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=failed`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=pending`,
        },
        auto_return: 'approved',
        external_reference: barbershopId,
      }
    });

    if (result.init_point) {
      return NextResponse.json({ url: result.init_point });
    }

    throw new Error('No se pudo generar el punto de inicio de pago');
  } catch (error: any) {
    console.error('Checkout Lifetime Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
