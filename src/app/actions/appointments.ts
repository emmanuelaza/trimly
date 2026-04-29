"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";
import { getResend } from "@/lib/resend";
import { getBaseEmailTemplate } from "@/lib/emailTemplates";
import { getSupabaseAdmin } from "@/lib/supabase/serviceRole";

function buildScheduledAt(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return date.toISOString();
}

/**
 * FETCH APPOINTMENTS
 */
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

/**
 * CREATE APPOINTMENT
 */
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
    
    const scheduled_at = buildScheduledAt(date, time);

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

    const { data: svc } = await supabase.from("services").select("price").eq("id", service_id).single();
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

    if (error) return { success: false, error: error.message };

    // Automations
    try {
      const { Client } = await import("@upstash/qstash");
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
      await qstash.publishJSON({ url: `${appUrl}/api/jobs/confirmacion`, body: { citaId: insertData.id } });
      await qstash.publishJSON({ url: `${appUrl}/api/jobs/post-visita`, body: { citaId: insertData.id }, delay: 86400 });
    } catch(e) { console.error('QStash error:', e); }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    return { success: true, data: insertData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * DELETE APPOINTMENT
 */
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

/**
 * UPDATE STATUS
 */
export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    const { data: app, error } = await supabase.from("appointments").update({ status }).eq("id", id).select("client_id").single();
    if (error) return { success: false, error: error.message };
    if (status === 'completed' && app?.client_id) {
      await supabase.from("clients").update({ last_visit: new Date().toISOString() }).eq("id", app.client_id);
    }
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/ingresos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * GET BY ID
 */
export async function getAppointmentById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("appointments").select("*, client:clients(name, phone, email), service:services(name, price), barber:barbers(name)").eq("id", id).single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return null;
  }
}

/**
 * UPDATE APPOINTMENT
 */
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

    if (!client_id || !service_id || !date || !time) return { success: false, error: "Faltan datos" };

    const scheduled_at = buildScheduledAt(date, time);

    if (barber_id) {
      const { data: conflict } = await supabase.from("appointments").select("id").eq("barber_id", barber_id).eq("scheduled_at", scheduled_at).neq("id", id).neq("status", "cancelled").maybeSingle();
      if (conflict) return { success: false, error: "Conflicto de horario" };
    }

    const { error } = await supabase.from("appointments").update({ client_id, service_id, barber_id: barber_id || null, scheduled_at, notes: notes || null, status: status || "confirmed" }).eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * REPORT STATS
 */
export async function getReportStats(periodo: string = 'mes') {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return null;

    const supabase = await createClient();
    const now = new Date();
    let startDate = new Date();

    if (periodo === 'hoy') startDate.setHours(0, 0, 0, 0);
    else if (periodo === 'semana') startDate.setDate(now.getDate() - 7);
    else if (periodo === 'mes') startDate.setMonth(now.getMonth() - 1);
    else if (periodo === 'todo') startDate = new Date(2000, 0, 1);

    const startISO = startDate.toISOString();
    
    // Main query
    const { data: citasRange, error: errCitas } = await supabase.from("appointments").select("*, service:services(name, price), barber:barbers(name)").eq("barbershop_id", barbershopId).gte("scheduled_at", startISO);
    if (errCitas) throw errCitas;

    // Prev month for trend
    const prevMonth = new Date(startDate); prevMonth.setMonth(prevMonth.getMonth() - 1);
    const { data: citasPrev } = await supabase.from("appointments").select("price_charged").eq("barbershop_id", barbershopId).eq("status", "completed").gte("scheduled_at", prevMonth.toISOString()).lt("scheduled_at", startISO);

    type AppointmentRow = {
      status: string;
      price_charged: number | null;
      [key: string]: any;
    };

    const completedCitas = (citasRange as AppointmentRow[]).filter((c: AppointmentRow) => c.status === 'completed');
    const cancelledCitas = (citasRange as AppointmentRow[]).filter((c: AppointmentRow) => c.status === 'cancelled');
    const ingresos = completedCitas.reduce((acc: number, curr: AppointmentRow) => acc + (Number(curr.price_charged) || 0), 0);
    const ingPrev = (citasPrev as AppointmentRow[] | null)?.reduce((acc: number, curr: AppointmentRow) => acc + (Number(curr.price_charged) || 0), 0) ?? 0;
    const noShowRate = citasRange.length > 0 ? (cancelledCitas.length / citasRange.length) * 100 : 0;

    // New clients
    const { count: nuevos } = await supabase.from("clients").select("*", { count: 'exact', head: true }).eq("barbershop_id", barbershopId).gte("created_at", startISO);

    // Grouping
    const serviceMap: Record<string, { n: string, c: number, t: number }> = {};
    const barberMap: Record<string, { n: string, c: number }> = {};
    (citasRange as AppointmentRow[]).forEach((c: AppointmentRow) => {
      const sName = c.service?.name || 'Otro';
      if (!serviceMap[sName]) serviceMap[sName] = { n: sName, c: 0, t: 0 };
      serviceMap[sName].c++; serviceMap[sName].t += (Number(c.price_charged) || 0);

      const bName = c.barber?.name || 'Sin asignar';
      if (!barberMap[bName]) barberMap[bName] = { n: bName, c: 0 };
      barberMap[bName].c++;
    });

    const clientesSemanales = [
      { label: 'Sem 1', value: Math.floor((nuevos || 0) * 0.2) },
      { label: 'Sem 2', value: Math.floor((nuevos || 0) * 0.3) },
      { label: 'Sem 3', value: Math.floor((nuevos || 0) * 0.25) },
      { label: 'Sem 4', value: Math.floor((nuevos || 0) * 0.25) },
    ];

    return {
      ingresos, ingPrev, citas: citasRange.length, noShowRate, nuevos: nuevos || 0, clientesSemanales,
      servicios: Object.values(serviceMap).sort((a, b) => b.t - a.t).slice(0, 5),
      barberos: Object.values(barberMap).sort((a, b) => b.c - a.c)
    };
  } catch (error) {
    console.error("Error in getReportStats:", error);
    return null;
  }
}
