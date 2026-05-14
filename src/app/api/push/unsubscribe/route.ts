import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole'

export async function POST(req: Request) {
  try {
    const { endpoint, userId, barbershopId } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'Falta endpoint' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .eq('user_id', userId)
      .eq('barbershop_id', barbershopId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
