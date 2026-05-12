"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

interface Barber {
  id: string;
  name: string;
  avatar_url?: string;
}

interface NominaAppointment {
  id: string;
  barber_id: string;
  service_id: string;
  price_charged: number | string;
  status: string;
  scheduled_at: string;
}

export async function getBarberPaymentScheme(barberId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("barber_payment_schemes")
    .select("barbero_id, tipo, porcentaje, monto_fijo")
    .eq("barbero_id", barberId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching payment scheme:", error);
    return null;
  }
  return data;
}

export async function updateBarberPaymentScheme(barberId: string, tipo: string, porcentaje?: number, montoFijo?: number) {
  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("barber_payment_schemes")
      .select("id")
      .eq("barbero_id", barberId)
      .maybeSingle();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from("barber_payment_schemes")
        .update({
          tipo,
          porcentaje: tipo === 'porcentaje' ? porcentaje : null,
          monto_fijo: tipo === 'fijo_mensual' ? montoFijo : null,
        })
        .eq("barbero_id", barberId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("barber_payment_schemes")
        .insert({
          barbero_id: barberId,
          tipo,
          porcentaje: tipo === 'porcentaje' ? porcentaje : null,
          monto_fijo: tipo === 'fijo_mensual' ? montoFijo : null,
        });
      error = insertError;
    }

    if (error) throw error;

    revalidatePath("/dashboard/equipo");
    revalidatePath("/dashboard/nomina");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBarberServiceRates(barberId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("barber_service_rates")
    .select("*")
    .eq("barber_id", barberId);

  if (error) {
    console.error("Error fetching service rates:", error);
    return [];
  }
  return data || [];
}

export async function updateBarberServiceRate(barberId: string, serviceId: string, fixedAmount: number) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("barber_service_rates")
      .upsert({
        barber_id: barberId,
        service_id: serviceId,
        fixed_amount: fixedAmount,
        created_at: new Date().toISOString()
      }, { onConflict: 'barber_id,service_id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPayrollData(period: { start: string, end: string }) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return [];

    const supabase = await createClient();
    
    // Get all barbers
    const { data: barbers, error: bError } = await supabase
      .from("barbers")
      .select("id, name, avatar_url")
      .eq("barbershop_id", barbershopId);

    if (bError) throw bError;

    const barberIds = (barbers ?? []).map((b: Barber) => b.id);

    // Get payment schemes (separate query — FK column is barbero_id)
    const { data: schemes } = await supabase
      .from("barber_payment_schemes")
      .select("barbero_id, tipo, porcentaje, monto_fijo")
      .in("barbero_id", barberIds);

    // Get per-service rates
    const { data: allServiceRates } = await supabase
      .from("barber_service_rates")
      .select("barber_id, service_id, fixed_amount")
      .in("barber_id", barberIds);

    // Get all completed appointments in the period
    const { data: appointments, error: aError } = await supabase
      .from("appointments")
      .select("id, barber_id, service_id, price_charged, status, scheduled_at")
      .eq("barbershop_id", barbershopId)
      .eq("status", "completed")
      .gte("scheduled_at", period.start)
      .lte("scheduled_at", period.end + "T23:59:59");

    if (aError) throw aError;

    // Get existing payments in this period
    const { data: payments, error: pError } = await supabase
      .from("nomina_payments")
      .select("*")
      .eq("barbershop_id", barbershopId)
      .gte("period_start", period.start)
      .lte("period_end", period.end);

    if (pError) throw pError;

    // Calculate liquidation for each barber
    const liquidation = (barbers as Barber[]).map((barber: Barber) => {
      const barberAppointments = (appointments as NominaAppointment[])?.filter((a: NominaAppointment) => a.barber_id === barber.id) || [];
      const scheme = (schemes ?? []).find((s: any) => s.barbero_id === barber.id);
      const serviceRates = (allServiceRates ?? []).filter((r: any) => r.barber_id === barber.id);

      let amountGenerated = 0;
      let amountBarber = 0;

      amountGenerated = barberAppointments.reduce((sum: number, a: NominaAppointment) => sum + (Number(a.price_charged) || 0), 0);

      if (scheme?.tipo === 'porcentaje') {
        amountBarber = (amountGenerated * (Number(scheme.porcentaje) || 0)) / 100;
      } else if (scheme?.tipo === 'fijo_mensual') {
        amountBarber = Number(scheme.monto_fijo) || 0;
      } else if (scheme?.tipo === 'fijo_por_servicio') {
        amountBarber = barberAppointments.reduce((sum: number, a: NominaAppointment) => {
          const rate = serviceRates.find((r: any) => r.service_id === a.service_id);
          return sum + (Number(rate?.fixed_amount) || 0);
        }, 0);
      }

      const payment = payments?.find((p: any) => p.barber_id === barber.id);

      return {
        barber,
        appointmentsCount: barberAppointments.length,
        amountGenerated,
        amountBarber,
        scheme: scheme?.tipo || 'not_configured',
        percentage: scheme?.porcentaje,
        status: payment?.status || 'pending',
        paymentId: payment?.id
      };
    });

    return liquidation;
  } catch (error: any) {
    console.error("Error in getPayrollData:", error);
    return [];
  }
}

export async function markAsPaid(data: {
  barberId: string
  barberName: string
  periodStart: string
  periodEnd: string
  amountGenerated: number
  amountBarber: number
  metodoPago: 'efectivo' | 'nequi' | 'daviplata' | 'transferencia' | 'otro'
  note?: string
}) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return { success: false, error: "No barbershop ID" };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("nomina_payments").insert({
      barbershop_id: barbershopId,
      barber_id: data.barberId,
      period_start: data.periodStart,
      period_end: data.periodEnd,
      amount_generated: data.amountGenerated,
      amount_barber: data.amountBarber,
      status: 'paid',
      payment_date: new Date().toISOString(),
      payment_note: data.note,
      paid_by: user?.id,
      payment_method: data.metodoPago,
    });

    if (error) throw error;

    // Auto-create expense record for this payroll payment
    const { error: expError } = await supabase.from('expenses').insert({
      barbershop_id: barbershopId,
      categoria: 'nomina',
      descripcion: `Nómina ${data.barberName} — ${data.periodStart} al ${data.periodEnd}`,
      monto: data.amountBarber,
      fecha: new Date().toISOString().split('T')[0],
      es_recurrente: false,
    });
    if (expError) console.error(expError);

    revalidatePath("/dashboard/nomina");
    revalidatePath("/dashboard/reportes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPaymentHistory() {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("nomina_payments")
      .select("*, barber:barbers(name, avatar_url)")
      .eq("barbershop_id", barbershopId)
      .order("payment_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error in getPaymentHistory:", error);
    return [];
  }
}
