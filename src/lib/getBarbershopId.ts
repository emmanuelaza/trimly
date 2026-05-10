import { createClient } from "@/lib/supabase/server";
import { slugify } from "./utils";

export async function getBarbershopId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No autenticado');

  // Intentamos obtener la barbería. Usamos maybeSingle para evitar que lance error si no hay nada.
  // Si por alguna razón hay varias (error de duplicación previo), tomamos la primera.
  const { data: barbershop, error } = await supabase
    .from('barbershops')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!barbershop) {
    // Solo creamos automáticamente si el usuario es un dueño (owner)
    // Los barberos no deben crear barbershops automáticamente
    if (user.user_metadata?.role === 'barber') {
      return null;
    }

    // Antes de crear, verificamos si realmente no existe ninguna (doble check)
    const { data: existing } = await supabase
      .from('barbershops')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);
    
    if (existing && existing.length > 0) {
      return existing[0].id;
    }

    const defaultName = 'Mi Barbería';
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const { data: newBarbershop, error: createError } = await supabase
      .from('barbershops')
      .insert({ 
        owner_id: user.id, 
        name: defaultName,
        slug: `${slugify(defaultName)}-${randomSuffix}`,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError) {
      console.error("Error creating barbershop fallback:", createError);
      return null;
    }

    return newBarbershop.id;
  }

  return barbershop.id;
}
