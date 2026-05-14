'server-only'

import webpush from 'web-push'
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT?.startsWith('mailto:')
    ? process.env.VAPID_SUBJECT!
    : `mailto:${process.env.VAPID_SUBJECT}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushToShop(
  barbershopId: string,
  payload: { title: string; body: string; url?: string }
): Promise<number> {
  const supabase = getSupabaseAdmin()

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth')
    .eq('barbershop_id', barbershopId)
    .eq('notif_nueva_cita', true)

  if (!subs?.length) return 0

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/dashboard/agenda',
  })

  let sent = 0
  const stale: string[] = []

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          message
        )
        sent++
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) stale.push(sub.endpoint)
      }
    })
  )

  if (stale.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', stale)
  }

  return sent
}
