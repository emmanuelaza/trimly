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
    
    // Construct scheduled_at
    const scheduled_at = new Date(`${date}T${time}:00`).toISOString();

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

    console.log('APPOINTMENT INSERT result:', insertData);
    if (error) {
       console.error('Supabase appointment insert error:', error.message, error.details, error.hint);
       return { success: false, error: error.message };
    }

    // ─── Trigger Background Automations via QStash ───
    try {
      const { Client } = await import("@upstash/qstash");
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

      // 1. Confirmación Inmediata
      await qstash.publishJSON({
        url: `${appUrl}/api/jobs/confirmacion`,
        body: { citaId: insertData.id },
      });

      // 2. Post-Visita (24h después)
      await qstash.publishJSON({
        url: `${appUrl}/api/jobs/post-visita`,
        body: { citaId: insertData.id },
        delay: 86400, // 24 horas
      });
    } catch(e) { 
      console.error('QStash trigger error:', e); 
      // No fallamos la acción si QStash falla, pero lo logueamos
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    return { success: true, data };
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
    
    // 1. Update appointment
    const { data: app, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .select("client_id")
      .single();

    if (error) return { success: false, error: error.message };

    // 2. If completed, update client's last_visit
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

export async function getReportStats() {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) {
      console.warn("No barbershopId found for current user in getReportStats");
      return null;
    }

    const supabase = await createClient();
    const now = new Date();
    
    // Ranges
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    // 1. Fetch appointments for this month (all statuses)
    const { data: citas, error: err1 } = await supabase
      .from("appointments")
      .select(`
        price_charged, 
        status, 
        scheduled_at,
        service_id,
        barber_id,
        service:services(name),
        barber:barbers(name)
      `)
      .eq("barbershop_id", barbershopId)
      .gte("scheduled_at", startOfMonth);

    if (err1) {
      console.error("Report Error - Fetch Citas:", err1);
    }

    // 2. Income previous month
    const { data: prevMonthCitas, error: err2 } = await supabase
      .from("appointments")
      .select("price_charged")
      .eq("barbershop_id", barbershopId)
      .eq("status", "completed")
      .gte("scheduled_at", startOfPrevMonth)
      .lte("scheduled_at", endOfPrevMonth);

    if (err2) {
      console.error("Report Error - Fetch Prev Income:", err2);
    }

    // 3. New clients current month
    const { data: nuevosClientes, error: err3 } = await supabase
      .from("clients")
      .select("created_at")
      .eq("barbershop_id", barbershopId)
      .gte("created_at", startOfMonth);

    if (err3) {
      console.error("Report Error - Fetch New Clients:", err3);
    }

    // Default object for empty state
    const defaultStats = {
      ingresos: 0,
      ingPrev: 0,
      citas: 0,
      ticket: 0,
      nuevos: 0,
      noShowRate: 0,
      servicios: [],
      barberos: [],
      clientesSemanales: []
    };

    if (!citas && !nuevosClientes) {
       return defaultStats;
    }

    // Aggregations
    const completed = citas?.filter(c => c.status === 'completed') || [];
    const noShows = citas?.filter(c => c.status === 'no_show') || [];
    
    const currentIngresos = completed.reduce((acc, c) => acc + (Number(c.price_charged) || 0), 0);
    const prevIngresos = prevMonthCitas?.reduce((acc, c) => acc + (Number(c.price_charged) || 0), 0) || 0;
    
    const totalCitas = completed.length;
    const totalIntento = citas?.length || 0;
    const noShowRate = totalIntento > 0 ? (noShows.length / totalIntento) * 100 : 0;
    const avgTicket = totalCitas > 0 ? currentIngresos / totalCitas : 0;

    // Services distribution
    const serviceMap: Record<string, { n: string, c: number, t: number }> = {};
    completed.forEach((c: any) => {
      const sId = c.service_id || 'unknown';
      if (!serviceMap[sId]) serviceMap[sId] = { n: c.service?.name || "General", c: 0, t: 0 };
      serviceMap[sId].c++;
      serviceMap[sId].t += Number(c.price_charged) || 0;
    });
    const serviciosPopular = Object.values(serviceMap).sort((a, b) => b.c - a.c).slice(0, 5);

    // Barbers distribution
    const barberMap: Record<string, { n: string, c: number }> = {};
    completed.forEach((c: any) => {
      const bId = c.barber_id || 'unassigned';
      if (!barberMap[bId]) barberMap[bId] = { n: c.barber?.name || "Sin asignar", c: 0 };
      barberMap[bId].c++;
    });
    const citasPorBarbero = Object.values(barberMap).sort((a, b) => b.c - a.c);

    // Weekly clients
    const weeklyClients: Record<string, number> = {};
    nuevosClientes?.forEach(c => {
      const d = new Date(c.created_at);
      const day = d.getDate();
      const week = Math.ceil(day / 7);
      const key = `Semana ${week}`;
      weeklyClients[key] = (weeklyClients[key] || 0) + 1;
    });

    return {
      ingresos: currentIngresos,
      ingPrev: prevIngresos,
      citas: totalCitas,
      ticket: avgTicket,
      nuevos: nuevosClientes?.length || 0,
      noShowRate,
      servicios: serviciosPopular,
      barberos: citasPorBarbero,
      clientesSemanales: Object.entries(weeklyClients).map(([label, value]) => ({ label, value }))
    };
  } catch (error) {
    console.error("Critical error in getReportStats:", error);
    return null;
  }
}
