import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const vapidSubject = process.env.VAPID_SUBJECT ?? ''
webpush.setVapidDetails(
  vapidSubject.startsWith('mailto:') || vapidSubject.startsWith('https://') ? vapidSubject : `mailto:${vapidSubject}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export interface PushPayload {
  barbershopId: string
  title: string
  body: string
  url?: string
  tag?: string
}

export async function sendPushToShop(payload: PushPayload): Promise<number> {
  const supabase = getSupabase()

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth')
    .eq('barbershop_id', payload.barbershopId)
    .eq('notif_nueva_cita', true)

  if (!subs?.length) return 0

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/dashboard',
    tag: payload.tag || 'trimly',
  })

  let sent = 0
  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          message
        )
        sent++
      } catch (err: any) {
        if (err.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
      }
    })
  )

  await supabase.from('notification_log').insert({
    barbershop_id: payload.barbershopId,
    tipo: payload.tag || 'general',
    titulo: payload.title,
    cuerpo: payload.body,
    enviada: sent > 0,
  })

  return sent
}
