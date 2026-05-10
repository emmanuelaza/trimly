"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBarbershopId } from "./utils";

export async function getBarbers() {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return [];

    const supabase = await createClient();
    // Traemos barberos y sus tokens activos
    const { data, error } = await supabase
      .from("barbers")
      .select("*, barber_tokens(*)")
      .eq("barbershop_id", barbershopId)
      .eq("barber_tokens.is_active", true)
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

    if (error) {
      console.error('Supabase barber insert error:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/equipo");
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

    revalidatePath("/dashboard/equipo");
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

    revalidatePath("/dashboard/equipo");
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateBarberTokenAction(barberId: string) {
  try {
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return { success: false, error: "No se encontró el ID de la barbería" };

    const supabase = await createClient();

    // 1. Generar token único de 32 caracteres
    const token = Array.from(
      crypto.getRandomValues(new Uint8Array(24))
    ).map(b => b.toString(16).padStart(2, '0')).join('');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 2. Desactivar token anterior si existe
    await supabase
      .from('barber_tokens')
      .update({ is_active: false })
      .eq('barber_id', barberId)
      .eq('is_active', true);

    // 3. Crear nuevo token
    const { data, error } = await supabase
      .from('barber_tokens')
      .insert({
        barber_id: barberId,
        barbershop_id: barbershopId,
        token,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error("Error generating token:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/equipo");
    return { success: true, token: data.token };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function revokeBarberTokenAction(barberId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('barber_tokens')
      .update({ is_active: false })
      .eq('barber_id', barberId)
      .eq('is_active', true);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/equipo");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBarberByCode(code: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("barbers")
      .select("*, barbershops(name)")
      .eq("invitation_code", code)
      .eq("invitation_status", "pending")
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
}

export async function linkBarberAccount(barberId: string, userId: string, email: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("barbers")
      .update({
        user_id: userId,
        invitation_status: 'accepted',
        email: email
      })
      .eq("id", barberId);

    if (error) {
      console.error("Error linking barber account:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/barber/dashboard");
    revalidatePath("/dashboard/equipo");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
