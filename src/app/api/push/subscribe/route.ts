import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole'

export async function POST(req: Request) {
  try {
    const { endpoint, keys, userId, barbershopId } = await req.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth || !userId || !barbershopId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        barbershop_id: barbershopId,
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
        notif_nueva_cita: true,
        notif_cancelacion: true,
      },
      { onConflict: 'user_id,endpoint' }
    )

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Push subscribe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
