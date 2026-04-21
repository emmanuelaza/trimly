"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

export async function getBarbers() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("barbershop_id", barbershopId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching barbers:", error);
    return [];
  }
  return data || [];
}

export async function createBarber(formData: FormData) {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return;

  const name = formData.get("nombre") as string;
  const phone = formData.get("telefono") as string;
  const email = formData.get("email") as string;

  if (!name) return;

  const supabase = await createClientSupabase();
  const { error } = await supabase.from("barbers").insert({
    barbershop_id: barbershopId,
    name,
    phone: phone || null,
    email: email || null
  });

  if (error) console.error(error);
  else {
    revalidatePath("/dashboard/barberos");
    revalidatePath("/dashboard/configuracion");
  }
}

export async function deleteBarber(id: string) {
  const supabase = await createClientSupabase();
  const { error } = await supabase.from("barbers").delete().eq("id", id);
  if (error) console.error(error);
  else {
    revalidatePath("/dashboard/barberos");
    revalidatePath("/dashboard/configuracion");
  }
}

async function createClientSupabase() {
  return await createClient();
}
