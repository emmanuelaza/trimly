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
  esquema: { tipo: string; porcentaje: number | null; monto_fijo: number | null } | null;
  stats: {
    citasHoy: number;
    proximasCitas: number;
    totalGeneradoMes: number;
    misGananciasMes: number;
  };
  proximasCitas: BarberAppt[];
  citasCompletadas: BarberAppt[];
}

export async function getBarberDashboardDataByToken(
  barberId: string,
  token: string,
): Promise<BarberDashData | null> {
  const supabase = await createClient();

  // Validate token
  const { data: tokenValid } = await supabase
    .from("barber_tokens")
    .select("id")
    .eq("barber_id", barberId)
    .eq("token", token)
    .eq("is_active", true)
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!tokenValid) return null;

  // Barber info
  const { data: barber } = await supabase
    .from("barbers")
    .select("id, name, barbershops(name)")
    .eq("id", barberId)
    .maybeSingle();

  if (!barber) return null;

  // Payment scheme (Spanish column names)
  const { data: esquema } = await supabase
    .from("barber_payment_schemes")
    .select("tipo, porcentaje, monto_fijo")
    .eq("barbero_id", barberId)
    .maybeSingle();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
  const mesStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Future appointments (upcoming)
  const { data: futuras } = await supabase
    .from("appointments")
    .select(
      "id, scheduled_at, status, notes, price_charged, clients(name, phone), services(name, price, duration_minutes)",
    )
    .eq("barber_id", barberId)
    .in("status", ["confirmed", "pending"])
    .gte("scheduled_at", now.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(30);

  // Completed appointments (recent history)
  const { data: completadas } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, price_charged, clients(name, phone), services(name, price, duration_minutes)")
    .eq("barber_id", barberId)
    .eq("status", "completed")
    .order("scheduled_at", { ascending: false })
    .limit(20);

  // Month earnings
  const { data: citasMes } = await supabase
    .from("appointments")
    .select("price_charged, services(price)")
    .eq("barber_id", barberId)
    .eq("status", "completed")
    .gte("scheduled_at", mesStart);

  const mapAppt = (a: any): BarberAppt => ({
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
  });

  const totalGeneradoMes = (citasMes ?? []).reduce((s: number, a: any) => {
    return s + Number(a.price_charged ?? (a.services as any)?.price ?? 0);
  }, 0);

  let misGananciasMes = 0;
  if (esquema?.tipo === "porcentaje") {
    misGananciasMes = totalGeneradoMes * (Number(esquema.porcentaje) || 0) / 100;
  } else if (esquema?.tipo === "fijo_mensual") {
    misGananciasMes = Number(esquema.monto_fijo) || 0;
  } else {
    misGananciasMes = totalGeneradoMes;
  }

  const todayAppts = (futuras ?? []).filter(
    (a: { scheduled_at: string }) => a.scheduled_at >= todayStart && a.scheduled_at <= todayEnd,
  );

  return {
    barber: {
      id: barber.id,
      name: barber.name,
      barbershopName: (barber.barbershops as any)?.name ?? "",
    },
    esquema: esquema
      ? {
          tipo: esquema.tipo,
          porcentaje: esquema.porcentaje ? Number(esquema.porcentaje) : null,
          monto_fijo: esquema.monto_fijo ? Number(esquema.monto_fijo) : null,
        }
      : null,
    stats: {
      citasHoy: todayAppts.length,
      proximasCitas: (futuras ?? []).length,
      totalGeneradoMes,
      misGananciasMes,
    },
    proximasCitas: (futuras ?? []).map(mapAppt),
    citasCompletadas: (completadas ?? []).map(mapAppt),
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
