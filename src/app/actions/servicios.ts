"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getServicios() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("servicios").select("*").order("created_at", { ascending: true });
  if (error) console.error(error);
  return data || [];
}

export async function createServicio(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const nombre = formData.get("nombre") as string;
  const precio = parseFloat(formData.get("precio") as string);

  if (!nombre) return;

  await supabase.from("servicios").insert({
    user_id: user.id,
    nombre,
    precio: isNaN(precio) ? 0 : precio,
  });

  revalidatePath("/dashboard/configuracion");
  revalidatePath("/dashboard/agenda");
}

export async function deleteServicio(id: string) {
  const supabase = await createClient();
  await supabase.from("servicios").delete().eq("id", id);
  revalidatePath("/dashboard/configuracion");
  revalidatePath("/dashboard/agenda");
}
