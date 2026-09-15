"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/serviceRole";
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

  // Supabase devuelve un usuario "decoy" sin identidades cuando el email ya
  // está registrado (para no filtrar qué correos existen). Si no detectamos
  // esto, seguiríamos creando una barbería duplicada para una cuenta que ya
  // existe, y esa duplicada quedaría con onboarding sin terminar para siempre.
  if (user && user.identities && user.identities.length === 0) {
    return { success: false, error: "Ya existe una cuenta con este correo. Inicia sesión en su lugar." };
  }

  if (user) {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${slugify(businessName || 'mi-barberia')}-${randomSuffix}`;
    const whatsapp = formData.get("whatsapp") as string;

    // Usamos el cliente admin (no el de sesión) porque si el proyecto exige
    // confirmar el email, todavía no hay sesión activa aquí y el insert con
    // RLS fallaría en silencio, dejando al usuario sin barbería y atrapado
    // en onboarding para siempre en su primer login real.
    const admin = getSupabaseAdmin();
    const { error: insertError } = await admin.from('barbershops').insert({
      owner_id: user.id,
      name: businessName || 'Mi Barbería',
      slug: slug,
      whatsapp: whatsapp || null,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      console.error("Error creating barbershop on signup:", insertError);
      return { success: false, error: "No pudimos terminar de crear tu barbería. Intenta de nuevo o contáctanos." };
    }
  }

  return { success: true };
}
