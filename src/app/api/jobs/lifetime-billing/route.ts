import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/serviceRole'; // Need service role to bypass RLS if needed

export async function POST(req: Request) {
  try {
    const { barbershopId, userEmail } = await req.json();

    if (!barbershopId) {
      return NextResponse.json({ error: 'Missing barbershopId' }, { status: 400 });
    }

    const supabase = createClient();

    // Check if they already have an active subscription (maybe they paid before the 3 days)
    const { data: barbershop } = await supabase
      .from('barbershops')
      .select('subscription_status')
      .eq('id', barbershopId)
      .single();

    if (barbershop?.subscription_status === 'active') {
      return NextResponse.json({ message: 'User already active, no action needed' });
    }

    // Expire the trial
    await supabase
      .from('barbershops')
      .update({ subscription_status: 'expired' })
      .eq('id', barbershopId);

    // Here we could send an email via Resend to userEmail with the payment link
    console.log(`Trial expired for ${barbershopId}. User ${userEmail} should be billed for Lifetime.`);

    return NextResponse.json({ message: 'Trial expired successfully' });
  } catch (error: any) {
    console.error('Lifetime Billing Job Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
