"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

export async function getClients() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("barbershop_id", barbershopId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  return data || [];
}

export async function createClient(formData: FormData) {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return;

  const nombre = formData.get("nombre") as string;
  const telefono = formData.get("telefono") as string;
  const email = formData.get("email") as string;
  const birthdate = formData.get("birthdate") as string;

  if (!nombre) return;

  const supabase = await createClientSupabase();
  const { error } = await supabase.from("clients").insert({
    barbershop_id: barbershopId,
    name: nombre,
    phone: telefono || null,
    email: email || null,
    birthdate: birthdate || null
  });

  if (error) console.error(error);
  else revalidatePath("/dashboard/clientes");
}

export async function deleteClient(id: string) {
  const supabase = await createClientSupabase();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) console.error(error);
  else revalidatePath("/dashboard/clientes");
}

// Renamed internally to not conflict with FormData createClient export
async function createClientSupabase() {
  return await createClient();
}
