"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export async function getBarberDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get barber record
  const { data: barber, error: bError } = await supabase
    .from("barbers")
    .select(`
      *,
      barbershops(name),
      barber_payment_schemes(type, percentage, fixed_amount),
      barber_service_rates(service_id, fixed_amount)
    `)
    .eq("user_id", user.id)
    .single();

  if (bError || !barber) return null;

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
  const calculateEarnings = (apps: any[]) => {
    const scheme = barber.barber_payment_schemes?.[0];
    const rates = barber.barber_service_rates || [];

    if (scheme?.type === 'percentage') {
      const total = apps.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      return (total * (Number(scheme.percentage) || 0)) / 100;
    } else if (scheme?.type === 'fixed_per_service') {
      return apps.reduce((sum, a) => {
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

  const earningsToday = calculateEarnings(todayAppointments?.filter(a => a.status === 'completed') || []);
  const earningsMonth = calculateEarnings(monthAppointments || []);

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
