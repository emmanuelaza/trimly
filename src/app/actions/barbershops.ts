"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

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
    
    // Parse hours
    const hours: any = {};
    ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].forEach(day => {
      hours[day] = {
        open: formData.get(`hours_${day}_open`),
        close: formData.get(`hours_${day}_close`)
      };
    });

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const supabase = await createClient();
    
    // Get existing config to merge
    const { data: current } = await supabase.from("barbershops").select("config").eq("id", barbershopId).single();

    const { error } = await supabase.from("barbershops").update({
      name,
      address: address || null,
      phone: phone || null,
      country,
      config: { ...(current?.config || {}), hours, timezone }
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
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return;

    const supabase = await createClient();
    
    // Upsert rule
    const { error } = await supabase.from("automations").upsert({
      barbershop_id: barbershopId,
      type,
      is_active
    }, { onConflict: 'barbershop_id, type' });

    if (error) {
      console.error("Error toggling automation:", error);
    } else {
      revalidatePath("/dashboard/automatizaciones");
    }
  } catch (error) {
    console.error("Critical error in toggleAutomation:", error);
  }
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

    // 1. Citas recordadas (count direct)
    const { count: recordadas, error: err1 } = await supabase
      .from("automation_logs")
      .select("*", { count: 'exact', head: true })
      .eq("barbershop_id", barbershopId)
      .eq("automation_type", "reminder_24h")
      .gte("sent_at", startOfMonth);

    if (err1) console.error("Stats Error 1:", err1);

    // 2. Clientes recuperados: Fetch unique client IDs who received recovery email
    const { data: logsRecuperacion, error: err2 } = await supabase
      .from("automation_logs")
      .select("client_id, sent_at")
      .eq("barbershop_id", barbershopId)
      .eq("automation_type", "recover_inactive")
      .gte("sent_at", startOfMonth);

    if (err2) console.error("Stats Error 2:", err2);

    let recuperadosCount = 0;
    if (logsRecuperacion && logsRecuperacion.length > 0) {
      const clientIds = Array.from(new Set(logsRecuperacion.map((l: any) => l.client_id)));
      
      // Get all completed appointments for these clients after the startOfMonth
      const { data: recentApps, error: err3 } = await supabase
        .from("appointments")
        .select("client_id, scheduled_at")
        .in("client_id", clientIds)
        .eq("status", "completed")
        .gte("scheduled_at", startOfMonth);

      if (err3) console.error("Stats Error 3:", err3);

      if (recentApps) {
        // For each log, check if there's any appointment after sent_at
        // Using a set of clientIds who were recovered to avoid double counting
        const recoveredSet = new Set();
        logsRecuperacion.forEach((log: any) => {
          const hasAppAfter = recentApps.some((app: any) => 
            app.client_id === log.client_id && 
            new Date(app.scheduled_at) > new Date(log.sent_at)
          );
          if (hasAppAfter) recoveredSet.add(log.client_id);
        });
        recuperadosCount = recoveredSet.size;
      }
    }

    // 3. No-shows evitados (estimado): Citas con recordatorio enviado que terminaron en 'completed'
    const { data: remindedApps, error: err4 } = await supabase
      .from("automation_logs")
      .select("appointment_id")
      .eq("barbershop_id", barbershopId)
      .eq("automation_type", "reminder_24h")
      .gte("sent_at", startOfMonth);

    if (err4) console.error("Stats Error 4:", err4);
    
    let realEvitados = 0;
    if (remindedApps && remindedApps.length > 0) {
       const ids = remindedApps.map((r: any) => r.appointment_id).filter(Boolean);
       if (ids.length > 0) {
          const { count, error: err5 } = await supabase
            .from("appointments")
            .select("*", { count: 'exact', head: true })
            .in("id", ids)
            .eq("status", "completed");
          if (err5) console.error("Stats Error 5:", err5);
          realEvitados = count || 0;
       }
    }

    return {
      recordadas: recordadas || 0,
      recuperados: recuperadosCount,
      evitados: realEvitados
    };
  } catch (error) {
    console.error("Critical error in getAutomationStats:", error);
    return null;
  }
}

export async function saveOnboardingStep1(data: { name: string, city: string, whatsapp: string }) {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error("No barbershop found");

  const supabase = await createClient();
  const { error } = await supabase.from("barbershops").update({
    name: data.name,
    city: data.city,
    whatsapp: data.whatsapp
  }).eq("id", barbershopId);

  if (error) throw error;
  return { success: true };
}

export async function saveOnboardingStep2(opening_hours: any) {
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
  
  // 1. Mark as completed
  const { error } = await supabase.from("barbershops").update({
    onboarding_completed: true
  }).eq("id", barbershopId);

  if (error) throw error;

  // 2. Initialize Automations if not already done
  await initializeAutomations(barbershopId);
  
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { success: true };
}

// Keep the old one for compatibility if needed, but updated to use new fields
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
