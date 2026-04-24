"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const businessName = formData.get("businessName") as string;
  const userName = formData.get("userName") as string;

  const supabase = await createClient();

  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: userName,
        negocio: businessName,
      }
    }
  });

  if (signUpError) return { success: false, error: signUpError.message };

  if (user) {
    // TAREA: Después de crear el usuario, hacer INSERT en barbershops
    const { error: insertError } = await supabase.from('barbershops').insert({
      owner_id: user.id,
      name: businessName || 'Mi Barbería',
      created_at: new Date().toISOString()
    });

    if (insertError) {
      console.error("Error creating barbershop on signup:", insertError);
      // No bloqueamos el registro si falla el insert, el fallback en acciones lo reparará
    }
  }

  return { success: true };
}
