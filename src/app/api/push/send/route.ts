import { NextResponse } from 'next/server'
import { sendPushToShop } from '@/lib/push'

export async function POST(req: Request) {
  const { barbershopId, title, body, url, tag } = await req.json()

  if (!barbershopId || !title) {
    return NextResponse.json({ error: 'barbershopId and title are required' }, { status: 400 })
  }

  const sent = await sendPushToShop({ barbershopId, title, body, url, tag })
  return NextResponse.json({ sent })
}
