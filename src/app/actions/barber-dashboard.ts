"use server";

import { createClient } from "@/lib/supabase/server";

export interface BarberAppt {
  id: string;
  scheduled_at: string;
  status: string;
  price_charged: number | null;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  notes: string | null;
}

export interface BarberDashData {
  barber: { id: string; name: string; barbershopName: string };
  esquema: { type: string; percentage: number | null; fixed_amount: number | null } | null;
  stats: {
    citasHoy: number;
    completadasHoy: number;
    gananciasHoy: number;
    proximasCitas: number;
    totalGeneradoMes: number;
    misGananciasMes: number;
  };
  citasHoy: BarberAppt[];
  proximasCitas: BarberAppt[];
  citasCompletadas: BarberAppt[];
}

export interface BarberGananciasData {
  citas: BarberAppt[];
  totalGenerado: number;
  misGanancias: number;
  pagoInfo: {
    status: string;
    payment_date: string | null;
    payment_method: string | null;
  } | null;
  esquema: { type: string; percentage: number | null; fixed_amount: number | null } | null;
}

function mapAppt(a: any): BarberAppt {
  return {
    id: a.id,
    scheduled_at: a.scheduled_at,
    status: a.status,
    price_charged: a.price_charged ?? null,
    clientName: (a.clients as any)?.name ?? "Cliente",
    clientPhone: (a.clients as any)?.phone ?? null,
    serviceName: (a.services as any)?.name ?? "Servicio",
    servicePrice: Number((a.services as any)?.price ?? 0),
    serviceDuration: Number((a.services as any)?.duration_minutes ?? 30),
    notes: a.notes ?? null,
  };
}

export async function getBarberDashboardDataByToken(
  barberId: string,
  token: string,
): Promise<BarberDashData | null> {
  const supabase = await createClient();

  const { data: tokenValid } = await supabase
    .from("barber_tokens")
    .select("id")
    .eq("barber_id", barberId)
    .eq("token", token)
    .eq("is_active", true)
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!tokenValid) return null;

  const { data: barber } = await supabase
    .from("barbers")
    .select("id, name, barbershops(name)")
    .eq("id", barberId)
    .maybeSingle();

  if (!barber) return null;

  const { data: esquema } = await supabase
    .from("barber_payment_schemes")
    .select("type, percentage, fixed_amount")
    .eq("barber_id", barberId)
    .maybeSingle();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
  const mesStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const en7dias = new Date(now);
  en7dias.setDate(en7dias.getDate() + 7);
  en7dias.setHours(23, 59, 59, 999);
  const mananaStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const [
    { data: citasHoyRaw },
    { data: proximasRaw },
    { data: completadasRaw },
    { data: citasMesRaw },
  ] = await Promise.all([
    // All of today (all statuses)
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, notes, price_charged, clients(name, phone), services(name, price, duration_minutes)")
      .eq("barber_id", barberId)
      .gte("scheduled_at", todayStart)
      .lte("scheduled_at", todayEnd)
      .order("scheduled_at", { ascending: true }),
    // Tomorrow → 7 days out, confirmed/pending only
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, notes, price_charged, clients(name, phone), services(name, price, duration_minutes)")
      .eq("barber_id", barberId)
      .in("status", ["confirmed", "pending"])
      .gte("scheduled_at", mananaStart)
      .lte("scheduled_at", en7dias.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(20),
    // Recent completed (for ganancias section in dashboard)
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, price_charged, clients(name, phone), services(name, price, duration_minutes)")
      .eq("barber_id", barberId)
      .eq("status", "completed")
      .gte("scheduled_at", mesStart)
      .order("scheduled_at", { ascending: false })
      .limit(30),
    // Month total for earnings calc
    supabase
      .from("appointments")
      .select("price_charged, services(price)")
      .eq("barber_id", barberId)
      .eq("status", "completed")
      .gte("scheduled_at", mesStart),
  ]);

  const citasHoyMapped = (citasHoyRaw ?? []).map(mapAppt);
  const completadasHoy = citasHoyMapped.filter((a) => a.status === "completed");
  const gananciasHoy = completadasHoy.reduce(
    (s, a) => s + (a.price_charged ?? a.servicePrice),
    0,
  );

  const totalGeneradoMes = (citasMesRaw ?? []).reduce((s: number, a: any) => {
    return s + Number(a.price_charged ?? (a.services as any)?.price ?? 0);
  }, 0);

  let misGananciasMes = 0;
  if (esquema?.type === "percentage") {
    misGananciasMes = totalGeneradoMes * ((Number(esquema.percentage) || 0) / 100);
  } else if (esquema?.type === "fixed_monthly") {
    misGananciasMes = Number(esquema.fixed_amount) || 0;
  } else {
    misGananciasMes = totalGeneradoMes;
  }

  return {
    barber: {
      id: barber.id,
      name: barber.name,
      barbershopName: (barber.barbershops as any)?.name ?? "",
    },
    esquema: esquema
      ? {
          type: esquema.type,
          percentage: esquema.percentage ? Number(esquema.percentage) : null,
          fixed_amount: esquema.fixed_amount ? Number(esquema.fixed_amount) : null,
        }
      : null,
    stats: {
      citasHoy: citasHoyMapped.length,
      completadasHoy: completadasHoy.length,
      gananciasHoy,
      proximasCitas: (proximasRaw ?? []).length,
      totalGeneradoMes,
      misGananciasMes,
    },
    citasHoy: citasHoyMapped,
    proximasCitas: (proximasRaw ?? []).map(mapAppt),
    citasCompletadas: (completadasRaw ?? []).map(mapAppt),
  };
}

export async function getBarberGanancias(
  barberId: string,
  token: string,
  periodStart: string,
  periodEnd: string,
): Promise<BarberGananciasData | null> {
  const supabase = await createClient();

  const { data: tokenValid } = await supabase
    .from("barber_tokens")
    .select("id")
    .eq("barber_id", barberId)
    .eq("token", token)
    .eq("is_active", true)
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!tokenValid) return null;

  const { data: esquema } = await supabase
    .from("barber_payment_schemes")
    .select("type, percentage, fixed_amount")
    .eq("barber_id", barberId)
    .maybeSingle();

  const [{ data: citasRaw }, { data: pagoInfo }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, price_charged, clients(name, phone), services(name, price, duration_minutes)")
      .eq("barber_id", barberId)
      .eq("status", "completed")
      .gte("scheduled_at", periodStart)
      .lte("scheduled_at", periodEnd)
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("nomina_payments")
      .select("status, payment_date, payment_method")
      .eq("barber_id", barberId)
      .gte("period_start", periodStart)
      .lte("period_end", periodEnd)
      .maybeSingle(),
  ]);

  const citas = (citasRaw ?? []).map(mapAppt);
  const totalGenerado = citas.reduce(
    (s, a) => s + (a.price_charged ?? a.servicePrice),
    0,
  );

  let misGanancias = 0;
  if (esquema?.type === "percentage") {
    misGanancias = totalGenerado * ((Number(esquema.percentage) || 0) / 100);
  } else if (esquema?.type === "fixed_monthly") {
    misGanancias = Number(esquema.fixed_amount) || 0;
  } else {
    misGanancias = totalGenerado;
  }

  return {
    citas,
    totalGenerado,
    misGanancias,
    pagoInfo: pagoInfo
      ? {
          status: pagoInfo.status,
          payment_date: (pagoInfo as any).payment_date ?? null,
          payment_method: (pagoInfo as any).payment_method ?? null,
        }
      : null,
    esquema: esquema
      ? {
          type: esquema.type,
          percentage: esquema.percentage ? Number(esquema.percentage) : null,
          fixed_amount: esquema.fixed_amount ? Number(esquema.fixed_amount) : null,
        }
      : null,
  };
}

export async function completeAppointment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: "completed" })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function markNoShow(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: "no_show" })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
