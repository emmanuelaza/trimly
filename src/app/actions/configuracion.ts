"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateConfiguracion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const negocio = formData.get("negocio") as string;
  const horario = formData.get("horario") as string;

  if (negocio) {
    await supabase.auth.updateUser({
      data: { 
        negocio,
        horario: horario || ""
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/configuracion");
}
