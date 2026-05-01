"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

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
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${slugify(businessName || 'mi-barberia')}-${randomSuffix}`;
    const whatsapp = formData.get("whatsapp") as string;

    const { error: insertError } = await supabase.from('barbershops').insert({
      owner_id: user.id,
      name: businessName || 'Mi Barbería',
      slug: slug,
      whatsapp: whatsapp || null,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      console.error("Error creating barbershop on signup:", insertError);
      // No bloqueamos el registro si falla el insert, el fallback en acciones lo reparará
    }
  }

  return { success: true };
}
