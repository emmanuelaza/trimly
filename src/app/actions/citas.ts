"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCitas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("citas")
    .select("id, fecha, hora, cliente_id, precio_cobrado, servicio_id, cliente:clientes(nombre, telefono), servicio:servicios(nombre, precio)")
    .order("fecha", { ascending: false })
    .order("hora", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

export async function createCita(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No autenticado");
    return;
  }

  const cliente_id = formData.get("cliente_id") as string;
  const servicio_id = formData.get("servicio_id") as string;
  const barbero_id = formData.get("barbero_id") as string;
  const fecha = formData.get("fecha") as string;
  const hora = formData.get("hora") as string;

  if (!cliente_id || !servicio_id || !fecha || !hora) {
    console.error("Faltan datos");
    return;
  }

  const { data: svc } = await supabase
    .from("servicios")
    .select("precio")
    .eq("id", servicio_id)
    .single();

  const precio_cobrado = svc ? svc.precio : 0;

  const { error } = await supabase.from("citas").insert({
    user_id: user.id,
    cliente_id,
    servicio_id,
    barbero_id: barbero_id || null,
    fecha,
    hora,
    precio_cobrado,
    estado: "completada"
  });

  if (error) {
    console.error(error);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/clientes");
}

export async function deleteCita(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("citas").delete().eq("id", id);
  if (error) {
    console.error(error);
  } else {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/clientes");
  }
}