import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole'
import webpush from 'web-push'

function initVapid() {
  const subject = process.env.VAPID_SUBJECT || ''
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  const privateKey = process.env.VAPID_PRIVATE_KEY || ''

  if (!publicKey || !privateKey) throw new Error('VAPID keys not configured')

  webpush.setVapidDetails(
    subject.startsWith('mailto:') ? subject : `mailto:${subject}`,
    publicKey,
    privateKey
  )
}

export async function POST(req: Request) {
  try {
    const { barbershopId, title, body, url } = await req.json()
    if (!barbershopId) return NextResponse.json({ error: 'Falta barbershopId' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .eq('barbershop_id', barbershopId)
      .eq('notif_nueva_cita', true)

    if (subsError) {
      console.error('[push/send] Error reading subscriptions:', subsError)
      return NextResponse.json({ error: subsError.message }, { status: 500 })
    }

    if (!subs?.length) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    initVapid()

    const payload = JSON.stringify({
      title: title || '¡Nueva cita!',
      body: body || 'Tienes una nueva reserva',
      url: url || '/dashboard/agenda',
    })

    let sent = 0
    const stale: string[] = []

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
            payload
          )
          sent++
        } catch (err: any) {
          console.error('[push/send] Failed:', err?.statusCode, err?.message)
          if (err.statusCode === 410 || err.statusCode === 404) stale.push(sub.endpoint)
        }
      })
    )

    if (stale.length) {
      await supabase.from('push_subscriptions').delete().in('endpoint', stale)
    }

    return NextResponse.json({ ok: true, sent })
  } catch (err: any) {
    console.error('[push/send] Unhandled error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
