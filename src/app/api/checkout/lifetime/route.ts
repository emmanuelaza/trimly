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

    // 1. Activate Trial in DB
    const { error: dbError } = await supabase
      .from('barbershops')
      .update({ 
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', barbershopId);

    if (dbError) throw dbError;

    // 2. Schedule QStash Job (3 days = 259200 seconds)
    try {
      const { qstash } = await import('@/lib/qstash');
      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/lifetime-billing`,
        body: { barbershopId, userEmail: user.email },
        delay: 259200,
      });
    } catch (qstashError) {
      console.error('QStash Error:', qstashError);
      // Continue anyway, trial is active
    }

    return NextResponse.json({ success: true, message: 'Trial activated' });
  } catch (error: any) {
    console.error('Checkout Lifetime Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
