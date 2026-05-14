import { NextResponse } from 'next/server'
import { sendPushToShop } from '@/lib/pushSend'

export async function POST(req: Request) {
  try {
    const { barbershopId, title, body, url } = await req.json()
    if (!barbershopId) return NextResponse.json({ error: 'Falta barbershopId' }, { status: 400 })

    const sent = await sendPushToShop(barbershopId, { title, body, url })
    return NextResponse.json({ ok: true, sent })
  } catch (err: any) {
    console.error('Push send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
