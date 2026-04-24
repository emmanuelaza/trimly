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
    const config = formData.get("config") as string;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const supabase = await createClient();
    const { error } = await supabase.from("barbershops").update({
      name,
      address: address || null,
      phone: phone || null,
      config: config ? JSON.parse(config) : undefined
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
  
  const automations = types.map(t => ({
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
      const clientIds = Array.from(new Set(logsRecuperacion.map(l => l.client_id)));
      
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
        logsRecuperacion.forEach(log => {
          const hasAppAfter = recentApps.some(app => 
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
       const ids = remindedApps.map(r => r.appointment_id).filter(Boolean);
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

export async function completeOnboarding(businessName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  // 1. Create Barbershop (Upsert based on owner_id)
  const { data: bShop, error: bError } = await supabase
    .from("barbershops")
    .upsert({
      name: businessName,
      owner_id: user.id
    }, { onConflict: 'owner_id' })
    .select()
    .single();

  if (bError) throw bError;

  // 2. Initialize Automations
  await initializeAutomations(bShop.id);
  
  revalidatePath("/dashboard");
}
