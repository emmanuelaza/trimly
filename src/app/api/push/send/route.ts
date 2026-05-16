import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';

export const dynamic = 'force-dynamic';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = Buffer.from(base64, 'base64');
  return rawData;
}

async function sendTo(
  webpush: any,
  subs: { endpoint: string; keys_p256dh: string; keys_auth: string }[],
  payload: string,
  supabase: ReturnType<typeof getSupabaseAdmin>,
) {
  let sent = 0;
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          payload,
        );
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      }
    }),
  );
  return sent;
}

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const webpush = require('web-push');
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );

    const { barbershopId, barberId, title, body, tag } = await req.json();

    const supabase = getSupabaseAdmin();

    // Owner subscriptions: tied to the barbershop, excluding the barber's own sub
    const ownerQuery = supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .eq('barbershop_id', barbershopId)
      .eq('notif_nueva_cita', true);
    if (barberId) ownerQuery.neq('user_id', barberId);

    const { data: ownerSubs } = await ownerQuery;

    // Barber subscriptions: keyed by barberId as user_id
    let barberSubs: { endpoint: string; keys_p256dh: string; keys_auth: string }[] = [];
    if (barberId) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('endpoint, keys_p256dh, keys_auth')
        .eq('user_id', barberId)
        .eq('notif_nueva_cita', true);
      barberSubs = data || [];
    }

    if (!ownerSubs?.length && !barberSubs.length) {
      return NextResponse.json({ sent: 0 });
    }

    const [ownerSent, barberSent] = await Promise.all([
      sendTo(
        webpush,
        ownerSubs || [],
        JSON.stringify({ title, body, url: '/dashboard/agenda', tag }),
        supabase,
      ),
      sendTo(
        webpush,
        barberSubs,
        JSON.stringify({ title, body, url: '/barber/dashboard', tag }),
        supabase,
      ),
    ]);

    return NextResponse.json({ sent: ownerSent + barberSent });
  } catch (err: any) {
    console.error('Push send error:', err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
