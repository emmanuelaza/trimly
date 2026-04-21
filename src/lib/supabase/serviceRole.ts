import { createClient } from '@supabase/supabase-js';

// Cliente especial que BYPASSA el Row Level Security (RLS)
// DEBE ser usado ÚNICAMENTE en Cron Jobs y Rutas protegidas
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!url || !key) {
    throw new Error('Supabase URL or Service Role Key missing');
  }

  return createClient(url, key);
}
