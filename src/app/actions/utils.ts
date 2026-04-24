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
    .maybeSingle(); // Use maybeSingle to avoid error if 0 rows
    
  if (error) {
    console.error("Error fetching barbershop_id for user", user.id, ":", error);
    return null;
  }
  
  if (!data) {
    console.warn("No barbershop found for owner_id:", user.id);
    return null;
  }
  
  return data.id;
}
