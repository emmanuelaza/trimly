"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";
import { getResend } from "@/lib/resend";
import { getBaseEmailTemplate } from "@/lib/emailTemplates";
import { getSupabaseAdmin } from "@/lib/supabase/serviceRole";

export async function getAppointments() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, notes, price_charged, client:clients(name, phone), barber:barbers(name), service:services(name, price)")
    .eq("barbershop_id", barbershopId)
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

export async function createAppointment(formData: FormData) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return { success: false, error: "No se encontró el ID de la barbería" };

    const supabase = await createClient();
    
    const client_id = formData.get("client_id") as string;
    const service_id = formData.get("service_id") as string;
    const barber_id = formData.get("barber_id") as string;
    const date = formData.get("fecha") as string;
    const time = formData.get("hora") as string;

    if (!client_id || !service_id || !date || !time) {
      return { success: false, error: "Faltan datos obligatorios" };
    }
    
    // Construct scheduled_at (Localization based on barbershop country)
    const { data: bShop } = await supabase.from("barbershops").select("config").eq("id", barbershopId).single();
    const timezone = bShop?.config?.timezone || "America/Bogota";
    
    // Get offset for this date/timezone (Force ±HH:mm format)
    const tempDate = new Date(`${date}T12:00:00`); 
    const offsetParts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' }).formatToParts(tempDate);
    let offset = offsetParts.find(p => p.type === 'timeZoneName')?.value.replace('GMT', '') || '-05:00';
    
    if (offset === "") offset = "+00:00";
    if (!offset.includes(":")) {
      const sign = offset.startsWith('-') ? '-' : '+';
      const hours = offset.replace(/[+-]/, "").padStart(2, '0');
      offset = `${sign}${hours}:00`;
    }

    const scheduled_at = `${date}T${time}:00${offset}`;

    // ─── Conflict Check ───
    if (barber_id) {
      const { data: conflict } = await supabase
        .from("appointments")
        .select("id")
        .eq("barber_id", barber_id)
        .eq("scheduled_at", scheduled_at)
        .neq("status", "cancelled")
        .maybeSingle();

      if (conflict) {
        return { success: false, error: "El barbero ya tiene una cita agendada a esa hora" };
      }
    }

    // Get service price
    const { data: svc } = await supabase
      .from("services")
      .select("price")
      .eq("id", service_id)
      .single();

    const price_charged = svc ? svc.price : 0;

    const { error, data: insertData } = await supabase.from("appointments").insert({
      barbershop_id: barbershopId,
      client_id,
      service_id,
      barber_id: barber_id || null,
      scheduled_at,
      status: "confirmed",
      price_charged
    }).select().single();

    if (error) {
       console.error('Supabase appointment insert error:', error.message);
       return { success: false, error: error.message };
    }

    // ─── Trigger Background Automations via QStash ───
    try {
      const { Client } = await import("@upstash/qstash");
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

      await qstash.publishJSON({
        url: `${appUrl}/api/jobs/confirmacion`,
        body: { citaId: insertData.id },
      });

      await qstash.publishJSON({
        url: `${appUrl}/api/jobs/post-visita`,
        body: { citaId: insertData.id },
        delay: 86400, // 24 horas
      });
    } catch(e) { 
      console.error('QStash trigger error:', e); 
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    return { success: true, data: insertData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAppointment(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    
    const { data: app, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .select("client_id")
      .single();

    if (error) return { success: false, error: error.message };

    if (status === 'completed' && app?.client_id) {
      await supabase
        .from("clients")
        .update({ last_visit: new Date().toISOString() })
        .eq("id", app.client_id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/ingresos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAppointmentById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("appointments")
      .select("*, client:clients(name, phone, email), service:services(name, price), barber:barbers(name)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return null;
  }
}

export async function updateAppointment(id: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return { success: false, error: "No barbershopId" };
    
    const client_id = formData.get("client_id") as string;
    const service_id = formData.get("service_id") as string;
    const barber_id = formData.get("barber_id") as string;
    const date = formData.get("fecha") as string;
    const time = formData.get("hora") as string;
    const notes = formData.get("notes") as string;
    const status = formData.get("status") as string;

    if (!client_id || !service_id || !date || !time) {
      return { success: false, error: "Faltan datos obligatorios" };
    }

    // Construct scheduled_at (Localization based on barbershop country)
    const { data: bShop } = await supabase.from("barbershops").select("config").eq("id", barbershopId).single();
    const timezone = bShop?.config?.timezone || "America/Bogota";
    
    // Get offset for this date/timezone (Force ±HH:mm format)
    const tempDate = new Date(`${date}T12:00:00`); 
    const offsetParts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' }).formatToParts(tempDate);
    let offset = offsetParts.find(p => p.type === 'timeZoneName')?.value.replace('GMT', '') || '-05:00';
    
    if (offset === "") offset = "+00:00";
    if (!offset.includes(":")) {
      const sign = offset.startsWith('-') ? '-' : '+';
      const hours = offset.replace(/[+-]/, "").padStart(2, '0');
      offset = `${sign}${hours}:00`;
    }

    const scheduled_at = `${date}T${time}:00${offset}`;

    // ─── Conflict Check ───
    if (barber_id) {
      const { data: conflict } = await supabase
        .from("appointments")
        .select("id")
        .eq("barber_id", barber_id)
        .eq("scheduled_at", scheduled_at)
        .neq("id", id) // Exclude current
        .neq("status", "cancelled")
        .maybeSingle();

      if (conflict) {
        return { success: false, error: "El barbero ya tiene una cita agendada a esa hora" };
      }
    }

    const { error } = await supabase.from("appointments").update({
      client_id,
      service_id,
      barber_id: barber_id || null,
      scheduled_at,
      notes: notes || null,
      status: status || "confirmed"
    }).eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
