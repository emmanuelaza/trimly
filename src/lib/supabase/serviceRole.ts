import { createClient } from '@supabase/supabase-js';

// Cliente especial que BYPASSA el Row Level Security (RLS)
// DEBE ser usado ÚNICAMENTE en Cron Jobs y Rutas protegidas
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
