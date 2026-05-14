import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT?.startsWith('mailto:')
    ? process.env.VAPID_SUBJECT!
    : `mailto:${process.env.VAPID_SUBJECT}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  try {
    const { barbershopId, title, body, url } = await req.json()
    if (!barbershopId) return NextResponse.json({ error: 'Falta barbershopId' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .eq('barbershop_id', barbershopId)
      .eq('notif_nueva_cita', true)

    if (!subs?.length) return NextResponse.json({ sent: 0 })

    const payload = JSON.stringify({
      title: title || '¡Nueva cita!',
      body: body || 'Tienes una nueva reserva',
      url: url || '/dashboard/agenda',
    })

    let sent = 0
    const staleEndpoints: string[] = []

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
            },
            payload
          )
          sent++
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            staleEndpoints.push(sub.endpoint)
          }
        }
      })
    )

    // Remove expired subscriptions
    if (staleEndpoints.length) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpoints)
    }

    return NextResponse.json({ ok: true, sent })
  } catch (err: any) {
    console.error('Push send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
