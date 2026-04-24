"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

export async function getServices() {
  try {
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
  } catch (error) {
    console.error("Error in getServices:", error);
    return [];
  }
}

export async function createService(formData: FormData) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return { success: false, error: "No se encontró el ID de la barbería" };

    const name = formData.get("nombre") as string;
    const priceStr = formData.get("precio") as string;
    const durationStr = formData.get("duracion") as string;

    if (!name || !priceStr || !durationStr) return { success: false, error: "Todos los campos son obligatorios" };

    const supabase = await createClient();
    const { error } = await supabase.from("services").insert({
      barbershop_id: barbershopId,
      name,
      price: Number(priceStr),
      duration_minutes: Number(durationStr)
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/servicios");
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateService(id: string, formData: FormData) {
  try {
    const name = formData.get("nombre") as string;
    const priceStr = formData.get("precio") as string;
    const durationStr = formData.get("duracion") as string;

    if (!name || !priceStr || !durationStr) return { success: false, error: "Todos los campos son obligatorios" };

    const supabase = await createClient();
    const { error } = await supabase.from("services").update({
      name,
      price: Number(priceStr),
      duration_minutes: Number(durationStr)
    }).eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/servicios");
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteService(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("services").delete().eq("id", id);
    
    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/servicios");
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
