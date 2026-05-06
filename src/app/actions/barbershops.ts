"use server";

import { createClient } from "@/lib/supabase/server";
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
    const primaryColor = formData.get("primaryColor") as string;
    const welcomeMessage = formData.get("welcomeMessage") as string;

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
        currency: currency || current?.config?.currency || 'COP',
        primaryColor: primaryColor || current?.config?.primaryColor || '#C9F53B',
        welcomeMessage: welcomeMessage || current?.config?.welcomeMessage || ''
      }
    }).eq("id", barbershopId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBarbershopVisuals(data: {
  primaryColor: string;
  welcomeMessage: string;
}) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return { success: false, error: "No se encontró la barbería" };

    const supabase = await createClient();
    const { data: current } = await supabase.from("barbershops").select("config").eq("id", barbershopId).single();

    const { error } = await supabase.from("barbershops").update({
      config: {
        ...(current?.config || {}),
        primaryColor: data.primaryColor,
        welcomeMessage: data.welcomeMessage,
      }
    }).eq("id", barbershopId);

    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard");
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

    const { count: recordadas, error: err1 } = await supabase
      .from("automation_logs")
      .select("*", { count: 'exact', head: true })
      .eq("barbershop_id", barbershopId)
      .eq("automation_type", "reminder_24h")
      .gte("sent_at", startOfMonth);

    if (err1) console.error("Stats Error 1:", err1);

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
      
      const { data: recentApps, error: err3 } = await supabase
        .from("appointments")
        .select("client_id, scheduled_at")
        .in("client_id", clientIds)
        .eq("status", "completed")
        .gte("scheduled_at", startOfMonth);

      if (err3) console.error("Stats Error 3:", err3);

      if (recentApps) {
        const recoveredSet = new Set<string>();
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
