"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getBarberos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("barberos").select("id, nombre").order("created_at", { ascending: true });
  if (error) console.error(error);
  return data || [];
}

export async function createBarbero(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const nombre = formData.get("nombre") as string;
  if (!nombre) return;

  await supabase.from("barberos").insert({
    user_id: user.id,
    nombre,
  });

  revalidatePath("/dashboard/barberos");
  revalidatePath("/dashboard/agenda");
}

export async function deleteBarbero(id: string) {
  const supabase = await createClient();
  await supabase.from("barberos").delete().eq("id", id);
  revalidatePath("/dashboard/barberos");
  revalidatePath("/dashboard/agenda");
}
