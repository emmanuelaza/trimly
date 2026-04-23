"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

export async function getClients() {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return [];

    const supabase = await createServerClient();
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
  } catch (error) {
    console.error("Critical error in getClients:", error);
    return [];
  }
}

export async function createClient(formData: FormData) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return;

    const nombre = formData.get("nombre") as string;
    const telefono = formData.get("telefono") as string;
    const email = formData.get("email") as string;
    const birthdate = formData.get("birthdate") as string;

    if (!nombre) return;

    const supabase = await createServerClient();
    const { error } = await supabase.from("clients").insert({
      barbershop_id: barbershopId,
      name: nombre,
      phone: telefono || null,
      email: email || null,
      birthdate: birthdate || null
    });

    if (error) {
      console.error("Error creating client:", error);
    } else {
      revalidatePath("/dashboard/clientes");
    }
  } catch (error) {
    console.error("Critical error in createClient:", error);
  }
}

export async function deleteClient(id: string) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      console.error("Error deleting client:", error);
    } else {
      revalidatePath("/dashboard/clientes");
    }
  } catch (error) {
    console.error("Critical error in deleteClient:", error);
  }
}

