import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendConfirmationEmail } from '@/lib/emails';
import { sendPushToShop } from '@/lib/push';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';

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
      priceCharged,
      referralCode,
      referralClienteId,
      referralValor,
      referralTipo,
    } = body;
    
    console.log('Processed fields:', { barbershopId, barberId, serviceId, scheduledAt, clientName, clientPhone });

    if (!barbershopId || !serviceId || !scheduledAt || !clientName || !clientPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

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
      console.log('Client resolved:', clientId);
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
    const descuento = referralCode && referralValor
      ? (referralTipo === 'porcentaje'
          ? Math.round((priceCharged * referralValor) / 100)
          : referralValor)
      : 0;

    const { data: appointment, error: appErr } = await supabase
      .from("appointments")
      .insert({
        barbershop_id: barbershopId,
        client_id: clientId,
        service_id: serviceId,
        barber_id: barberId,
        scheduled_at: scheduledAt,
        status: "confirmed",
        price_charged: priceCharged,
        referral_code_usado: referralCode || null,
        descuento_referido: descuento,
      })
      .select()
      .single();

    if (appErr) {
      console.error('Supabase appointment insert error:', appErr);
      if (appErr.code === '23505') {
        return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
      }
      return NextResponse.json({ error: appErr.message }, { status: 400 });
    }

    console.log('Appointment created successfully:', appointment.id);

    // 3b. Push notification to shop (gated by push_nueva_cita automation, default ON)
    try {
      const { data: pushAuto } = await getSupabaseAdmin()
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', barbershopId)
        .eq('type', 'push_nueva_cita')
        .maybeSingle()
      const pushEnabled = pushAuto == null ? true : pushAuto.is_active
      if (pushEnabled) {
        const [{ data: svc }, { data: brb }] = await Promise.all([
          supabase.from('services').select('name').eq('id', serviceId).maybeSingle(),
          barberId
            ? supabase.from('barbers').select('name').eq('id', barberId).maybeSingle()
            : Promise.resolve({ data: null }),
        ])
        const fecha = new Date(scheduledAt).toLocaleDateString('es-CO', {
          weekday: 'short', day: 'numeric', month: 'short',
        })
        const hora = new Date(scheduledAt).toLocaleTimeString('es-CO', {
          hour: '2-digit', minute: '2-digit',
        })
        await sendPushToShop({
          barbershopId,
          title: '📅 Nueva cita agendada',
          body: `${clientName} agendó ${svc?.name ?? 'un servicio'} el ${fecha} a las ${hora}${brb?.name ? ` con ${brb.name}` : ''}`,
          url: '/dashboard/agenda',
          tag: 'nueva_cita',
        })
      }
    } catch (pushErr) {
      console.error('Push notification error:', pushErr)
    }

    // 3c. Register referral use and credit the referrer
    if (referralCode && referralClienteId && referralValor) {
      try {
        const creditAmount = referralTipo === 'porcentaje'
          ? Math.round((priceCharged * referralValor) / 100)
          : referralValor;

        await supabase.from('referral_uses').insert({
          barbershop_id: barbershopId,
          referral_code: referralCode.toUpperCase(),
          cliente_que_refirio: referralClienteId,
          cliente_nuevo: clientId,
          credito_otorgado: creditAmount,
          estado: 'pendiente',
        });

        const { data: referidor } = await supabase
          .from('clients')
          .select('credito_acumulado')
          .eq('id', referralClienteId)
          .maybeSingle();
        const newCredit = (Number(referidor?.credito_acumulado) || 0) + creditAmount;
        await supabase.from('clients').update({ credito_acumulado: newCredit }).eq('id', referralClienteId);
      } catch (refErr) {
        console.error('Referral registration error:', refErr);
      }
    }

    // 4. Send Confirmation Email Directly
    if (clientEmail) {
      try {
        // Fetch details for the email
        const [{ data: shop }, { data: service }, { data: barber }] = await Promise.all([
          supabase.from('barbershops').select('name, whatsapp').eq('id', barbershopId).single(),
          supabase.from('services').select('name').eq('id', serviceId).single(),
          barberId 
            ? supabase.from('barbers').select('name').eq('id', barberId).single() 
            : Promise.resolve({ data: { name: 'Cualquier barbero' } })
        ]);

        console.log('Sending direct confirmation email...');
        await sendConfirmationEmail({
          to: clientEmail,
          clientName,
          barbershopName: shop?.name || 'La Barbería',
          serviceName: service?.name || 'Servicio',
          barberName: barber?.name || 'Cualquier barbero',
          date: scheduledAt,
          phone: shop?.whatsapp || ''
        });
        console.log('Direct email sent successfully');
      } catch (emailErr) {
        console.error('Error sending direct confirmation email:', emailErr);
        // We don't throw here to avoid failing the whole booking if only the email fails
      }
    }

    // 5. Trigger remaining Automations via QStash (only post-visit)
    try {
      const { Client } = await import("@upstash/qstash");
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
      
      const appointmentTime = new Date(scheduledAt).getTime();
      const now = Date.now();
      const delayMs = (appointmentTime - now) + (24 * 60 * 60 * 1000);
      const delaySeconds = Math.floor(delayMs / 1000);

      if (delaySeconds > 0) {
        await qstash.publishJSON({ 
          url: `${appUrl}/api/jobs/post-visita`, 
          body: { citaId: appointment.id },
          delay: delaySeconds 
        });
      }
    } catch (e) {
      console.error("QStash automation error:", e);
    }

    return NextResponse.json(appointment, { status: 200 });

  } catch (error: any) {
    console.error('General confirmation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
