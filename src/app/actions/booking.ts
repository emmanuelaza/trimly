"use server";

import { getSupabaseAdmin } from "@/lib/supabase/serviceRole";
import { revalidatePath } from "next/cache";

/**
 * Fetch barbershop by slug
 */
export async function getBarbershopBySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("barbershops")
    .select("id, name, city, whatsapp, opening_hours")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching barbershop by slug:", error);
    return null;
  }
  return data;
}

/**
 * Fetch services for a barbershop
 */
export async function getServicesByBarbershop(barbershopId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
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
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
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
  const supabase = getSupabaseAdmin();
  
  let query = supabase
    .from("appointments")
    .select("scheduled_at, duration_minutes:services(duration_minutes)")
    .eq("barbershop_id", barbershopId)
    .gte("scheduled_at", `${date}T00:00:00`)
    .lte("scheduled_at", `${date}T23:59:59`)
    .neq("status", "cancelled");

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
    const supabase = getSupabaseAdmin();

    // 1. Find or create client
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("barbershop_id", data.barbershopId)
      .eq("phone", data.clientPhone)
      .maybeSingle();

    let clientId;
    if (existingClient) {
      clientId = existingClient.id;
      await supabase
        .from("clients")
        .update({ last_visit: new Date().toISOString(), email: data.clientEmail || null })
        .eq("id", clientId);
    } else {
      const { data: newClient, error: clientErr } = await supabase
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

    // 2. Create Appointment
    const { data: appointment, error: appErr } = await supabase
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

    // 3. Trigger Automations via QStash
    try {
      const { Client } = await import("@upstash/qstash");
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
      
      // Confirmation Email
      await qstash.publishJSON({ 
        url: `${appUrl}/api/jobs/confirmacion`, 
        body: { citaId: appointment.id } 
      });

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
