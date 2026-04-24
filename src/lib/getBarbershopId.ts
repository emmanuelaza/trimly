import { createClient } from "@/lib/supabase/server";

export async function getBarbershopId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No autenticado');

  const { data: barbershop, error } = await supabase
    .from('barbershops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (error || !barbershop) {
    // Si no existe, lo creamos automáticamente
    const { data: newBarbershop, error: createError } = await supabase
      .from('barbershops')
      .insert({ 
        owner_id: user.id, 
        name: 'Mi Barbería',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError) {
      console.error("Error creating barbershop fallback:", createError);
      throw new Error("No se pudo crear la barbería automáticamente");
    }

    return newBarbershop.id;
  }

  return barbershop.id;
}
