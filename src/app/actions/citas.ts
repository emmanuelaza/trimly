"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCitas() {
  const supabase = await createClient();
  // Fetch today's appointments by default or all for simplicity since this is minimal UI
  const { data, error } = await supabase
    .from("citas")
    .select(`
      *,
      cliente:clientes(nombre, telefono),
      servicio:servicios(nombre, precio),
      barbero:barberos(nombre)
    `)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });
    
  if (error) console.error(error);
  return data || [];
}

export async function createCita(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const cliente_id = formData.get("cliente_id") as string;
  const servicio_id = formData.get("servicio_id") as string;
  const barbero_id = formData.get("barbero_id") as string;
  const fecha = formData.get("fecha") as string;
  const hora = formData.get("hora") as string;

  if (!cliente_id || !servicio_id || !fecha || !hora) return { error: "Faltan datos" };

  // Fetch the service price to save it historically
  const { data: svc } = await supabase.from("servicios").select("precio").eq("id", servicio_id).single();
  const precio_cobrado = svc ? svc.precio : 0;

  const { error } = await supabase.from("citas").insert({
    user_id: user.id,
    cliente_id,
    servicio_id,
    barbero_id: barbero_id || null,
    fecha,
    hora,
    precio_cobrado,
    estado: 'completada' // Auto completada for simplicity on this early MVP to trigger features
  });

  if (error) {
    console.error(error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/clientes");
  return { success: true };
}

export async function deleteCita(id: string) {
  const supabase = await createClient();
  await supabase.from("citas").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
}
