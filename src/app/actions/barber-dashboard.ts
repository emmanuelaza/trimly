"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

interface Appointment {
  id: string;
  status: string;
  price: number | string;
  service_id: string;
  date: string;
  [key: string]: any;
}

export async function getBarberDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get barber record - Try by user_id first
  let { data: barber, error: bError } = await supabase
    .from("barbers")
    .select(`
      *,
      barbershops(name),
      barber_payment_schemes(type, percentage, fixed_amount),
      barber_service_rates(service_id, fixed_amount)
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  // FALLBACK: If not found by user_id, try by email (self-healing)
  if (!barber && !bError) {
    console.log("Barber not found by user_id, trying email fallback for:", user.email);
    const { data: barberByEmail } = await supabase
      .from("barbers")
      .select(`
        *,
        barbershops(name),
        barber_payment_schemes(type, percentage, fixed_amount),
        barber_service_rates(service_id, fixed_amount)
      `)
      .eq("email", user.email)
      .maybeSingle();

    if (barberByEmail) {
      console.log("Found barber by email, linking user_id...");
      // Auto-link for future visits
      await supabase
        .from("barbers")
        .update({ user_id: user.id, invitation_status: 'accepted' })
        .eq("id", barberByEmail.id);
      
      barber = barberByEmail;
    }
  }

  if (bError || !barber) {
    console.error("Barber record still not found after fallback. User ID:", user.id, "Email:", user.email);
    return null;
  }

  const today = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();
  const monthStart = startOfMonth(new Date()).toISOString();
  const monthEnd = endOfMonth(new Date()).toISOString();

  // Get appointments
  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("barber_id", barber.id)
    .gte("date", today)
    .lte("date", todayEnd)
    .order("date", { ascending: true });

  const { data: monthAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("barber_id", barber.id)
    .eq("status", "completed")
    .gte("date", monthStart)
    .lte("date", monthEnd);

  // Calculate earnings
  const calculateEarnings = (apps: Appointment[]) => {
    const scheme = barber.barber_payment_schemes?.[0];
    const rates = barber.barber_service_rates || [];

    if (scheme?.type === 'percentage') {
      const total = apps.reduce((sum: number, a: Appointment) => sum + (Number(a.price) || 0), 0);
      return (total * (Number(scheme.percentage) || 0)) / 100;
    } else if (scheme?.type === 'fixed_per_service') {
      return apps.reduce((sum: number, a: Appointment) => {
        const rate = rates.find((r: any) => r.service_id === a.service_id);
        return sum + (Number(rate?.fixed_amount) || 0);
      }, 0);
    } else if (scheme?.type === 'fixed_monthly') {
      // For dashboard "Today/Month" we probably want to show a portion or the whole thing?
      // Usually "earnings" in dashboard means variable. But user didn't specify.
      // I'll return the monthly fixed for the month view.
      return Number(scheme.fixed_amount) || 0;
    }
    return 0;
  };

  const earningsToday = calculateEarnings((todayAppointments as Appointment[])?.filter((a: Appointment) => a.status === 'completed') || []);
  const earningsMonth = calculateEarnings((monthAppointments as Appointment[]) || []);

  return {
    barber,
    stats: {
      appointmentsToday: todayAppointments?.length || 0,
      earningsToday,
      earningsMonth
    },
    todayAppointments: todayAppointments || []
  };
}

export async function completeAppointment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: 'completed' })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
