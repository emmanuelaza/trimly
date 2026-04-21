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
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("barbershops").update({
    name,
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
