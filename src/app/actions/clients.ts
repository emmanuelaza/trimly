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
    if (!barbershopId) return { success: false, error: "No se encontró el ID de la barbería" };

    const name = formData.get("nombre") as string;
    const phone = formData.get("telefono") as string;
    const email = formData.get("email") as string;
    const birthdate = formData.get("birthdate") as string;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const supabase = await createServerClient();
    const { error, data } = await supabase.from("clients").insert({
      barbershop_id: barbershopId,
      name,
      phone: phone || null,
      email: email || null,
      birthdate: birthdate || null
    }).select().single();

    console.log('CLIENT INSERT result:', data);
    if (error) {
      console.error('Supabase client insert error:', error.message, error.details, error.hint);
      return { success: false, error: error.message };
    }
    
    revalidatePath("/dashboard/clientes");
    return { success: true, data };
  } catch (error: any) {
    console.error("Critical error in createClient:", error);
    return { success: false, error: error.message };
  }
}

export async function updateClient(id: string, formData: FormData) {
  try {
    const name = formData.get("nombre") as string;
    const phone = formData.get("telefono") as string;
    const email = formData.get("email") as string;
    const birthdate = formData.get("birthdate") as string;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const supabase = await createServerClient();
    const { error } = await supabase.from("clients").update({
      name,
      phone: phone || null,
      email: email || null,
      birthdate: birthdate || null
    }).eq("id", id);

    if (error) {
      console.error("Error updating client:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error: any) {
    console.error("Critical error in updateClient:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteClient(id: string) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    
    if (error) {
      console.error("Error deleting client:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error: any) {
    console.error("Critical error in deleteClient:", error);
    return { success: false, error: error.message };
  }
}
