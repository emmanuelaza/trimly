import { createClient } from "@/lib/supabase/server";

export async function getBarbershopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn("getBarbershopId: No user logged in");
    return null;
  }
  
  const { data, error } = await supabase
    .from('barbershops')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle(); 
    
  if (error) {
    console.error("Error fetching barbershop_id:", error);
    return null;
  }
  
  if (!data) {
    // AUTO-CREATION: If it doesn't exist, create it on the fly
    const name = user.user_metadata?.negocio || "Mi Barbería";
    const { data: newShop, error: createError } = await supabase
      .from('barbershops')
      .insert({ name, owner_id: user.id })
      .select('id')
      .single();

    if (createError) {
      console.error("Failed to auto-create barbershop:", createError);
      return null;
    }
    return newShop.id;
  }
  
  return data.id;
}
