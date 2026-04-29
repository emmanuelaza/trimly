import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Booking request:', body);

    const { 
      barbershopId, 
      barberId, 
      serviceId, 
      scheduledAt, 
      clientName, 
      clientPhone, 
      clientEmail,
      priceCharged
    } = body;

    if (!barbershopId || !serviceId || !scheduledAt || !clientName || !clientPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createPublicClient();

    // 1. Find or create client
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("barbershop_id", barbershopId)
      .eq("phone", clientPhone)
      .maybeSingle();

    let clientId;
    if (existingClient) {
      clientId = existingClient.id;
      await supabase
        .from("clients")
        .update({ last_visit: new Date().toISOString(), email: clientEmail || null })
        .eq("id", clientId);
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from("clients")
        .insert({
          barbershop_id: barbershopId,
          name: clientName,
          phone: clientPhone,
          email: clientEmail || null,
          last_visit: new Date().toISOString()
        })
        .select("id")
        .single();
      
      if (clientErr) {
        console.error('Supabase client insert error:', clientErr);
        throw clientErr;
      }
      clientId = newClient.id;
    }

    // 2. Conflict check
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('barber_id', barberId)
      .eq('scheduled_at', scheduledAt)
      .in('status', ['confirmed', 'pending'])
      .maybeSingle();

    if (conflict) {
      console.log('Conflict detected for slot:', scheduledAt);
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
    }

    // 3. Create Appointment
    const { data: appointment, error: appErr } = await supabase
      .from("appointments")
      .insert({
        barbershop_id: barbershopId,
        client_id: clientId,
        service_id: serviceId,
        barber_id: barberId,
        scheduled_at: scheduledAt,
        status: "confirmed",
        price_charged: priceCharged
      })
      .select()
      .single();

    if (appErr) {
      console.error('Supabase appointment insert error:', appErr);
      return NextResponse.json({ error: appErr.message }, { status: 400 });
    }

    // 4. Trigger Automations via QStash
    try {
      const { Client } = await import("@upstash/qstash");
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
      
      await qstash.publishJSON({ 
        url: `${appUrl}/api/jobs/confirmacion`, 
        body: { citaId: appointment.id } 
      });

      await qstash.publishJSON({ 
        url: `${appUrl}/api/jobs/post-visita`, 
        body: { citaId: appointment.id },
        delay: 86400 
      });
    } catch (e) {
      console.error("QStash automation error:", e);
    }

    return NextResponse.json(appointment, { status: 200 });

  } catch (error: any) {
    console.error('General confirmation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
