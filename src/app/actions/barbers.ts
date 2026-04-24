"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

export async function getBarbers() {
  try {
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
  } catch (error) {
    console.error("Error in getBarbers:", error);
    return [];
  }
}

export async function createBarber(formData: FormData) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return { success: false, error: "No se encontró el ID de la barbería" };

    const name = formData.get("nombre") as string;
    const phone = formData.get("telefono") as string;
    const email = formData.get("email") as string;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const supabase = await createClient();
    const { data, error } = await supabase.from("barbers").insert({
      barbershop_id: barbershopId,
      name,
      phone: phone || null,
      email: email || null
    }).select().single();

    console.log('BARBER INSERT result:', data);
    if (error) {
      console.error('Supabase barber insert error:', error.message, error.details, error.hint);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/barberos");
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBarber(id: string, formData: FormData) {
  try {
    const name = formData.get("nombre") as string;
    const phone = formData.get("telefono") as string;
    const email = formData.get("email") as string;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const supabase = await createClient();
    const { error } = await supabase.from("barbers").update({
      name,
      phone: phone || null,
      email: email || null
    }).eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/barberos");
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBarber(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("barbers").delete().eq("id", id);
    
    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/barberos");
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
