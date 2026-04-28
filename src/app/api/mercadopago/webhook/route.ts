import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/mercadopago';
import { updateSubscriptionStatus } from '@/app/actions/subscriptions';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    const bodyText = await request.text();
    const payload = JSON.parse(bodyText);

    console.log('Webhook Payload:', JSON.stringify(payload, null, 2));

    // Verify signature
    if (!signature || !xRequestId || !verifyWebhookSignature(signature, xRequestId)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, action, data } = payload;

    // 1. Manane Subscriptions (Mensual / Anual)
    if (type === 'subscription_preapproval' || action?.startsWith('subscription_preapproval')) {
      const id = data?.id || payload.id;
      const status = payload.status; // authorized, paused, cancelled

      if (status === 'authorized') {
        await updateSubscriptionStatus(id, 'active', true);
      } else if (status === 'paused') {
        await updateSubscriptionStatus(id, 'paused', true);
      } else if (status === 'cancelled') {
        await updateSubscriptionStatus(id, 'cancelled', true);
      }
    }

    // 2. Manage One-time payments (Lifetime)
    if (type === 'payment' || action?.startsWith('payment')) {
      const id = data?.id || payload.id;
      const status = payload.status; // approved, rejected
      const preferenceId = payload.preference_id;

      if (status === 'approved' && preferenceId) {
        await updateSubscriptionStatus(preferenceId, 'active', false);
      } else if (status === 'rejected' && preferenceId) {
        await updateSubscriptionStatus(preferenceId, 'expired', false);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    // User requested to always return 200 to avoid retries
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}
