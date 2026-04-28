"use server";

import { createClient } from "@/lib/supabase/server";
import { getBarbershopId } from "./utils";

export async function exportReportData(dateFrom: string, dateTo: string) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) throw new Error("No se encontró el ID de la barbería");

    const supabase = await createClient();

    // 1. Fetch Appointments with relations
    const { data: appointments, error: appError } = await supabase
      .from("appointments")
      .select(`
        scheduled_at,
        status,
        price_charged,
        client:clients(id, name, phone, email),
        service:services(name, price),
        barber:barbers(name)
      `)
      .eq("barbershop_id", barbershopId)
      .gte("scheduled_at", dateFrom)
      .lte("scheduled_at", dateTo)
      .order("scheduled_at", { ascending: true });

    if (appError) throw appError;

    // 2. Fetch all clients to calculate stats
    // We fetch all to get overall stats as requested in Hoja 3
    const { data: clients, error: clientError } = await supabase
      .from("clients")
      .select(`
        id,
        name,
        phone,
        email,
        last_visit,
        created_at
      `)
      .eq("barbershop_id", barbershopId);

    if (clientError) throw clientError;

    // 3. Fetch all completed appointments for these clients to calculate total visits/spent
    const clientIds = clients.map(c => c.id);
    const { data: allAppointments, error: allAppError } = await supabase
      .from("appointments")
      .select("client_id, price_charged, status")
      .in("client_id", clientIds)
      .eq("status", "completed");

    if (allAppError) throw allAppError;

    // Map stats to clients
    const clientsWithStats = clients.map(client => {
      const clientApps = allAppointments.filter(a => a.client_id === client.id);
      return {
        ...client,
        totalVisits: clientApps.length,
        totalSpent: clientApps.reduce((acc, curr) => acc + (Number(curr.price_charged) || 0), 0)
      };
    }).filter(c => {
        // Only include clients who had a cita in the selected period
        return appointments.some(a => (a as any).client?.id === c.id);
    });

    return {
      appointments: appointments || [],
      clients: clientsWithStats,
      period: { from: dateFrom, to: dateTo }
    };
  } catch (error: any) {
    console.error("Error in exportReportData:", error);
    throw error;
  }
}
