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

export async function getAutomationStats() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return null;

  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Citas recordadas (Count of logs with type 'reminder_24h' this month)
  const { count: recordadas } = await supabase
    .from("automation_logs")
    .select("*", { count: 'exact', head: true })
    .eq("automation_type", "reminder_24h")
    .gte("sent_at", startOfMonth);

  // 2. Clientes recuperados (Mocked logic for now, count of recover_inactive logs)
  const { count: recuperados } = await supabase
    .from("automation_logs")
    .select("*", { count: 'exact', head: true })
    .eq("automation_type", "recover_inactive")
    .gte("sent_at", startOfMonth);

  return {
    recordadas: recordadas || 0,
    recuperados: recuperados || 0,
    evitados: Math.round((recordadas || 0) * 0.15) // Estimation
  };
}
