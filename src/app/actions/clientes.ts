"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClientes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("*").order("ultima_visita", { ascending: false, nullsFirst: true });
  if (error) console.error(error);
  return data || [];
}

export async function createCliente(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const nombre = formData.get("nombre") as string;
  const telefono = formData.get("telefono") as string;
  const notas = formData.get("notas") as string;

  if (!nombre) return null;

  const { data, error } = await supabase.from("clientes").insert({
    user_id: user.id,
    nombre,
    telefono,
    notas,
  }).select().single();

  revalidatePath("/dashboard/clientes");
  revalidatePath("/dashboard/agenda");
  return data;
}

export async function deleteCliente(id: string) {
  const supabase = await createClient();
  await supabase.from("clientes").delete().eq("id", id);
  revalidatePath("/dashboard/clientes");
  revalidatePath("/dashboard/agenda");
}
