import { createClient } from "@/lib/supabase/server";

export async function getBarbershopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('barbershops')
    .select('id')
    .eq('owner_id', user.id)
    .single();
    
  if (error || !data) {
    console.error("Error fetching barbershop_id:", error);
    return null;
  }
  
  return data.id;
}
