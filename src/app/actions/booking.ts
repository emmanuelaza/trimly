"use server";

import { revalidatePath } from "next/cache";
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Fetch barbershop by slug
 */
export async function getBarbershopBySlug(slug: string) {
  const { data, error } = await getSupabase()
    .from("barbershops")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching barbershop by slug:", error);
    return null;
  }
  return data;
}

/**
 * Fetch barbershop plan to verify access
 */
export async function getBarbershopPlan(barbershopId: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const adminAuthClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: bShop } = await adminAuthClient
    .from('barbershops')
    .select('*')
    .eq('id', barbershopId)
    .maybeSingle();

  const isTrial = bShop?.subscription_status === 'trialing';

  const { data: sub } = await adminAuthClient
    .from('subscriptions')
    .select('plan_type')
    .eq('barbershop_id', barbershopId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return isTrial || bShop?.plan === 'pro' || sub?.plan_type === 'pro' || sub?.plan_type === 'filo_pro' || sub?.plan_type === 'anual' || sub?.plan_type === 'lifetime';
}

/**
 * Fetch services for a barbershop
 */
export async function getServicesByBarbershop(barbershopId: string) {
  const { data, error } = await getSupabase()
    .from("services")
    .select("*")
    .eq("barbershop_id", barbershopId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data || [];
}

/**
 * Fetch barbers for a barbershop
 */
export async function getBarbersByBarbershop(barbershopId: string) {
  const { data, error } = await getSupabase()
    .from("barbers")
    .select("*")
    .eq("barbershop_id", barbershopId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data || [];
}

/**
 * Fetch occupied slots for a barber on a specific date
 */
export async function getOccupiedSlots(barbershopId: string, barberId: string | null, date: string) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  let query = getSupabase()
    .from("appointments")
    .select("scheduled_at, duration_minutes, status")
    .eq("barbershop_id", barbershopId)
    .gte("scheduled_at", dateStart.toISOString())
    .lte("scheduled_at", dateEnd.toISOString())
    .in('status', ['confirmed', 'pending']);

  if (barberId) {
    query = query.eq("barber_id", barberId);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

/**
 * Create a public appointment
 */
export async function confirmBooking(data: {
  barbershopId: string;
  serviceId: string;
  barberId: string | null;
  scheduledAt: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  priceCharged: number;
}) {
  try {
    // 1. Find or create client
    const { data: existingClient } = await getSupabase()
      .from("clients")
      .select("id")
      .eq("barbershop_id", data.barbershopId)
      .eq("phone", data.clientPhone)
      .maybeSingle();

    let clientId;
    if (existingClient) {
      clientId = existingClient.id;
      await getSupabase()
        .from("clients")
        .update({ last_visit: new Date().toISOString(), email: data.clientEmail || null })
        .eq("id", clientId);
    } else {
      const { data: newClient, error: clientErr } = await getSupabase()
        .from("clients")
        .insert({
          barbershop_id: data.barbershopId,
          name: data.clientName,
          phone: data.clientPhone,
          email: data.clientEmail || null,
          last_visit: new Date().toISOString()
        })
        .select("id")
        .single();
      
      if (clientErr) throw clientErr;
      clientId = newClient.id;
    }

    // 2. Conflict check
    const { data: conflict } = await getSupabase()
      .from('appointments')
      .select('id')
      .eq('barber_id', data.barberId)
      .eq('scheduled_at', data.scheduledAt)
      .in('status', ['confirmed', 'pending'])
      .maybeSingle();

    if (conflict) {
      return { success: false, error: 'slot_taken' };
    }

    // 3. Create Appointment
    const { data: appointment, error: appErr } = await getSupabase()
      .from("appointments")
      .insert({
        barbershop_id: data.barbershopId,
        client_id: clientId,
        service_id: data.serviceId,
        barber_id: data.barberId,
        scheduled_at: data.scheduledAt,
        status: "confirmed",
        price_charged: data.priceCharged
      })
      .select()
      .single();

    if (appErr) throw appErr;

    // 4. Send Confirmation Email Directly
    if (data.clientEmail) {
      try {
        const supabase = getSupabase();
        const [{ data: shop }, { data: service }, { data: barber }] = await Promise.all([
          supabase.from('barbershops').select('name, whatsapp').eq('id', data.barbershopId).single(),
          supabase.from('services').select('name').eq('id', data.serviceId).single(),
          data.barberId 
            ? supabase.from('barbers').select('name').eq('id', data.barberId).single() 
            : Promise.resolve({ data: { name: 'Cualquier barbero' } })
        ]);

        await (await import('@/lib/emails')).sendConfirmationEmail({
          to: data.clientEmail,
          clientName: data.clientName,
          barbershopName: shop?.name || 'La Barbería',
          serviceName: service?.name || 'Servicio',
          barberName: barber?.name || 'Cualquier barbero',
          date: data.scheduledAt,
          phone: shop?.whatsapp || ''
        });
      } catch (emailErr) {
        console.error('Error sending direct confirmation email (Action):', emailErr);
      }
    }

    // 5. Trigger remaining Automations via QStash
    try {
      const { Client } = await import("@upstash/qstash");
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
      
      // Post-visit Follow-up (24h delay)
      await qstash.publishJSON({ 
        url: `${appUrl}/api/jobs/post-visita`, 
        body: { citaId: appointment.id },
        delay: 86400 
      });
    } catch (e) {
      console.error("QStash automation error:", e);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    
    return { success: true, appointmentId: appointment.id };
  } catch (error: any) {
    console.error("Booking confirmation error:", error);
    return { success: false, error: error.message };
  }
}
