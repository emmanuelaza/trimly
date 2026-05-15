"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/serviceRole";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";
import { slugify } from "@/lib/utils";

export async function getBarbershop() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("barbershops")
    .select("*")
    .eq("id", barbershopId)
    .single();

  if (error) {
    console.error("Error fetching barbershop:", error);
    return null;
  }
  return data;
}

export async function updateBarbershop(formData: FormData) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return { success: false, error: "No se encontró el ID de la barbería" };

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const country = formData.get("country") as string;
    const currency = formData.get("currency") as string;

    const COUNTRY_TIMEZONES: Record<string, string> = {
      "Colombia": "America/Bogota",
      "España": "Europe/Madrid",
      "México": "America/Mexico_City",
      "Argentina": "America/Buenos_Aires",
      "Chile": "America/Santiago",
      "Estados Unidos": "America/New_York",
      "Perú": "America/Lima",
      "Ecuador": "America/Guayaquil",
      "Venezuela": "America/Caracas",
      "Uruguay": "America/Montevideo",
      "Panamá": "America/Panama",
      "Costa Rica": "America/Costa_Rica",
    };

    const timezone = COUNTRY_TIMEZONES[country] || "America/Bogota";
    
    const hours: Record<string, { open: string | null; close: string | null }> = {};
    ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].forEach(day => {
      hours[day] = {
        open: formData.get(`hours_${day}_open`) as string | null,
        close: formData.get(`hours_${day}_close`) as string | null
      };
    });

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const supabase = await createClient();
    const { data: current } = await supabase.from("barbershops").select("config").eq("id", barbershopId).single();

    const { error } = await supabase.from("barbershops").update({
      name,
      address: address || null,
      phone: phone || null,
      country,
      config: { 
        ...(current?.config || {}), 
        hours, 
        timezone, 
        currency: currency || current?.config?.currency || 'COP'
      }
    }).eq("id", barbershopId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function getAutomations() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .eq("barbershop_id", barbershopId);

  if (error) {
    console.error("Error fetching automations:", error);
    return [];
  }
  return data || [];
}

export async function toggleAutomation(type: string, is_active: boolean) {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error('No barbershop found');

  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from('automations')
    .upsert(
      { barbershop_id: barbershopId, type, is_active, config: {} },
      { onConflict: 'barbershop_id,type' }
    );

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/automatizaciones');
}

export async function initializeAutomations(barbershopId: string) {
  const supabase = await createClient();
  const types = ['reminder_24h', 'confirmation', 'post_visit', 'daily_report', 'recover_inactive', 'birthday'];
  
  const automations = types.map((t: string) => ({
    barbershop_id: barbershopId,
    type: t,
    is_active: false,
    config: {}
  }));

  const { error } = await supabase.from("automations").upsert(automations, { onConflict: 'barbershop_id, type' });
  if (error) console.error("Error initializing automations", error);
}

export async function getAutomationStats() {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return null;

    const supabase = await createClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Single query — all logs this month
    const { data: logs } = await supabase
      .from('automation_logs')
      .select('automation_type, client_id, appointment_id, sent_at')
      .eq('barbershop_id', barbershopId)
      .gte('sent_at', startOfMonth);

    const allLogs = logs || [];

    // Counts per type
    const porTipo: Record<string, number> = {};
    for (const log of allLogs) {
      porTipo[log.automation_type] = (porTipo[log.automation_type] || 0) + 1;
    }

    // Recovered clients: sent recover_inactive AND booked a completed appointment after
    const recoverLogs = allLogs.filter((l: any) => l.automation_type === 'recover_inactive');
    let recuperados = 0;
    if (recoverLogs.length > 0) {
      const clientIds = [...new Set(recoverLogs.map((l: any) => l.client_id as string))];
      const { data: recentApps } = await supabase
        .from('appointments')
        .select('client_id, scheduled_at')
        .in('client_id', clientIds)
        .eq('status', 'completed')
        .gte('scheduled_at', startOfMonth);

      if (recentApps?.length) {
        const recoveredSet = new Set<string>();
        recoverLogs.forEach((log: any) => {
          if (recentApps.some((app: any) =>
            app.client_id === log.client_id &&
            new Date(app.scheduled_at) > new Date(log.sent_at)
          )) recoveredSet.add(log.client_id);
        });
        recuperados = recoveredSet.size;
      }
    }

    return {
      totalEnviados: allLogs.length,
      recordadas: porTipo['reminder_24h'] || 0,
      confirmaciones: porTipo['confirmation'] || 0,
      postVisita: porTipo['post_visit'] || 0,
      cumpleanos: porTipo['birthday'] || 0,
      reportes: porTipo['daily_report'] || 0,
      recuperados,
      porTipo,
    };
  } catch (error) {
    console.error('Critical error in getAutomationStats:', error);
    return null;
  }
}

export async function saveOnboardingStep1(data: { name: string, city: string, whatsapp: string }) {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error("No barbershop found");

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("barbershops")
    .select("slug")
    .eq("id", barbershopId)
    .single();

  const updates: Record<string, unknown> = {
    name: data.name,
    city: data.city,
    whatsapp: data.whatsapp
  };

  if (!current?.slug) {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    updates.slug = `${slugify(data.name || 'mi-barberia')}-${randomSuffix}`;
  }

  const { error } = await supabase.from("barbershops").update(updates).eq("id", barbershopId);

  if (error) throw error;
  return { success: true };
}

export async function saveOnboardingStep2(opening_hours: unknown) {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error("No barbershop found");

  const supabase = await createClient();
  const { error } = await supabase.from("barbershops").update({
    opening_hours
  }).eq("id", barbershopId);

  if (error) throw error;
  return { success: true };
}

export async function completeOnboardingAction() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error("No barbershop found");

  const supabase = await createClient();
  
  const { error } = await supabase.from("barbershops").update({
    onboarding_completed: true
  }).eq("id", barbershopId);

  if (error) throw error;

  await initializeAutomations(barbershopId);
  
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { success: true };
}

export async function completeOnboarding(businessName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  const { data: bShop, error: bError } = await supabase
    .from("barbershops")
    .upsert({
      name: businessName,
      owner_id: user.id,
      onboarding_completed: true
    }, { onConflict: 'owner_id' })
    .select()
    .single();

  if (bError) throw bError;

  await initializeAutomations(bShop.id);
  revalidatePath("/dashboard");
}
