import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole'

export async function POST(req: Request) {
  const { subscription, barbershopId, userId } = await req.json()
  console.log('Subscribe called with:', { userId, barbershopId })

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      barbershop_id: barbershopId,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
      notif_nueva_cita: true,
      notif_cancelacion: true,
    },
    { onConflict: 'user_id,endpoint' }
  )

  console.log('Upsert result:', error || 'success')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
