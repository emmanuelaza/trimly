import { NextResponse } from 'next/server';

export async function POST() {
  const planId = process.env.MP_PLAN_ID_ANUAL;
  if (!planId) {
    return NextResponse.json({ error: 'Plan ID not configured' }, { status: 500 });
  }

  return NextResponse.json({ 
    init_point: `https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=${planId}` 
  });
}
