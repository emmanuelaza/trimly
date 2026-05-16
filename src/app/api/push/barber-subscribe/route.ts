import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { barberId, barbershopId, token, endpoint, keys_p256dh, keys_auth } = await req.json();

    if (!barberId || !token || !endpoint || !keys_p256dh || !keys_auth) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Validate the barber token before saving the subscription
    const { data: tokenValid } = await supabase
      .from('barber_tokens')
      .select('id')
      .eq('barber_id', barberId)
      .eq('token', token)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!tokenValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await supabase.from('push_subscriptions').upsert(
      {
        user_id: barberId,
        barbershop_id: barbershopId,
        endpoint,
        keys_p256dh,
        keys_auth,
        notif_nueva_cita: true,
      },
      { onConflict: 'user_id,endpoint' },
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Barber subscribe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
