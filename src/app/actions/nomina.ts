"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

interface Barber {
  id: string;
  name: string;
  avatar_url?: string;
  barber_payment_schemes?: any[];
  barber_service_rates?: any[];
}

interface NominaAppointment {
  id: string;
  barber_id: string;
  service_id: string;
  price: number | string;
  status: string;
  date: string;
}

export async function getBarberPaymentScheme(barberId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("barber_payment_schemes")
    .select("*")
    .eq("barber_id", barberId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching payment scheme:", error);
    return null;
  }
  return data;
}

export async function updateBarberPaymentScheme(barberId: string, type: string, percentage?: number, fixedAmount?: number) {
  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("barber_payment_schemes")
      .select("id")
      .eq("barber_id", barberId)
      .maybeSingle();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from("barber_payment_schemes")
        .update({
          type,
          percentage: type === 'percentage' ? percentage : null,
          fixed_amount: type === 'fixed_monthly' ? fixedAmount : null,
          updated_at: new Date().toISOString()
        })
        .eq("barber_id", barberId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("barber_payment_schemes")
        .insert({
          barber_id: barberId,
          type,
          percentage: type === 'percentage' ? percentage : null,
          fixed_amount: type === 'fixed_monthly' ? fixedAmount : null
        });
      error = insertError;
    }

    if (error) throw error;
    
    revalidatePath("/dashboard/barberos");
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
      .select(`
        id, name, avatar_url,
        barber_payment_schemes(type, percentage, fixed_amount),
        barber_service_rates(service_id, fixed_amount)
      `)
      .eq("barbershop_id", barbershopId);

    if (bError) throw bError;

    // Get all completed appointments in the period
    const { data: appointments, error: aError } = await supabase
      .from("appointments")
      .select("id, barber_id, service_id, price, status, date")
      .eq("barbershop_id", barbershopId)
      .eq("status", "completed")
      .gte("date", period.start)
      .lte("date", period.end);

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
      const scheme = barber.barber_payment_schemes?.[0];
      const serviceRates = barber.barber_service_rates || [];

      let amountGenerated = 0;
      let amountBarber = 0;

      if (scheme?.type === 'percentage') {
        amountGenerated = barberAppointments.reduce((sum: number, a: NominaAppointment) => sum + (Number(a.price) || 0), 0);
        amountBarber = (amountGenerated * (Number(scheme.percentage) || 0)) / 100;
      } else if (scheme?.type === 'fixed_monthly') {
        amountGenerated = barberAppointments.reduce((sum: number, a: NominaAppointment) => sum + (Number(a.price) || 0), 0);
        amountBarber = Number(scheme.fixed_amount) || 0; // Should probably be pro-rated if period is not a month, but user didn't specify. I'll stick to full amount for now.
      } else if (scheme?.type === 'fixed_per_service') {
        amountGenerated = barberAppointments.reduce((sum: number, a: NominaAppointment) => sum + (Number(a.price) || 0), 0);
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
        scheme: scheme?.type || 'not_configured',
        percentage: scheme?.percentage,
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
  barberId: string, 
  periodStart: string, 
  periodEnd: string, 
  amountGenerated: number, 
  amountBarber: number, 
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
      paid_by: user?.id
    });

    if (error) throw error;
    
    revalidatePath("/dashboard/nomina");
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
      .select(`
        *,
        barber:barbers(name, avatar_url),
        payer:auth_users_public(full_name)
      `)
      .eq("barbershop_id", barbershopId)
      .order("payment_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error in getPaymentHistory:", error);
    return [];
  }
}
