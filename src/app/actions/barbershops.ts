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
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return;

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const config = formData.get("config") as string;

  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("barbershops").update({
    name,
    address: address || null,
    phone: phone || null,
    config: config ? JSON.parse(config) : undefined
  }).eq("id", barbershopId);

  if (error) console.error(error);
  else revalidatePath("/dashboard/configuracion");
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
  if (!barbershopId) return;

  const supabase = await createClient();
  
  // Upsert rule
  const { error } = await supabase.from("automations").upsert({
    barbershop_id: barbershopId,
    type,
    is_active
  }, { onConflict: 'barbershop_id, type' });

  if (error) console.error("Error toggling automation", error);
  else revalidatePath("/dashboard/automatizaciones");
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
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return null;

  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Citas recordadas
  const { count: recordadas } = await supabase
    .from("automation_logs")
    .select("*", { count: 'exact', head: true })
    .eq("automation_type", "reminder_24h")
    .gte("sent_at", startOfMonth);

  // 2. Clientes recuperados: Quienes recibieron 'recover_inactive' y luego COMPLETARON una cita
  const { data: logsRecuperacion } = await supabase
    .from("automation_logs")
    .select("client_id, sent_at")
    .eq("automation_type", "recover_inactive")
    .gte("sent_at", startOfMonth);

  let recuperadosCount = 0;
  if (logsRecuperacion && logsRecuperacion.length > 0) {
    for (const log of logsRecuperacion) {
      const { count } = await supabase
        .from("appointments")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", log.client_id)
        .eq("status", "completed")
        .gt("scheduled_at", log.sent_at);
      if (count && count > 0) recuperadosCount++;
    }
  }

  // 3. No-shows evitados (estimado): Citas con recordatorio enviado que terminaron en 'completed'
  const { data: remindedApps } = await supabase
    .from("automation_logs")
    .select("appointment_id")
    .eq("automation_type", "reminder_24h")
    .gte("sent_at", startOfMonth);
  
  let realEvitados = 0;
  if (remindedApps && remindedApps.length > 0) {
     const ids = remindedApps.map(r => r.appointment_id).filter(Boolean);
     const { count } = await supabase
       .from("appointments")
       .select("*", { count: 'exact', head: true })
       .in("id", ids)
       .eq("status", "completed");
     realEvitados = count || 0;
  }

  return {
    recordadas: recordadas || 0,
    recuperados: recuperadosCount,
    evitados: realEvitados
  };
}

export async function completeOnboarding(businessName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  // 1. Create Barbershop
  const { data: bShop, error: bError } = await supabase
    .from("barbershops")
    .insert({
      name: businessName,
      owner_id: user.id
    })
    .select()
    .single();

  if (bError) throw bError;

  // 2. Initialize Automations
  await initializeAutomations(bShop.id);
  
  revalidatePath("/dashboard");
}
