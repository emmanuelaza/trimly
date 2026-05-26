import { NextResponse } from 'next/server'

const APP_ID = 'b2d99d08-461f-42cd-ab77-46cd1ce60963'

export async function POST(req: Request) {
  try {
    const { ownerUserId, barberUserId, title, body, url } = await req.json()

    const apiKey = process.env.ONESIGNAL_REST_API_KEY
    if (!apiKey) {
      console.warn('ONESIGNAL_REST_API_KEY not set — skipping push')
      return NextResponse.json({ success: false, reason: 'no_api_key' })
    }

    const targetIds: string[] = []
    if (ownerUserId) targetIds.push(ownerUserId)
    if (barberUserId && barberUserId !== ownerUserId) targetIds.push(barberUserId)
    if (targetIds.length === 0) {
      return NextResponse.json({ success: false, reason: 'no_targets' })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trimlyapp-phi.vercel.app'

    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        target_channel: 'push',
        headings: { en: title },
        contents: { en: body },
        include_aliases: { external_id: targetIds },
        channel_for_external_user_ids: 'push',
        url: `${appUrl}${url}`,
      }),
    })

    const data = await response.json()
    console.log('OneSignal response:', data)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('OneSignal error:', err)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
