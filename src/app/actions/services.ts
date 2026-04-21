"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

export async function getServices() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("barbershop_id", barbershopId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }
  return data || [];
}

export async function createService(formData: FormData) {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return;

  const name = formData.get("nombre") as string;
  const priceStr = formData.get("precio") as string;
  const durationStr = formData.get("duracion") as string;

  if (!name || !priceStr || !durationStr) return;

  const supabase = await createClientSupabase();
  const { error } = await supabase.from("services").insert({
    barbershop_id: barbershopId,
    name,
    price: Number(priceStr),
    duration_minutes: Number(durationStr)
  });

  if (error) console.error(error);
  else {
    revalidatePath("/dashboard/servicios");
    revalidatePath("/dashboard/configuracion");
  }
}

export async function deleteService(id: string) {
  const supabase = await createClientSupabase();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) console.error(error);
  else {
    revalidatePath("/dashboard/servicios");
    revalidatePath("/dashboard/configuracion");
  }
}

async function createClientSupabase() {
  return await createClient();
}
