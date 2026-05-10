-- ==========================================
-- TRIMLY: BARBER MAGIC LINK ACCESS
-- ==========================================

CREATE TABLE IF NOT EXISTS barber_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id uuid NOT NULL REFERENCES barbers(id)
    ON DELETE CASCADE,
  barbershop_id uuid NOT NULL
    REFERENCES barbershops(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT NOW(),
  expires_at timestamp with time zone
    DEFAULT NOW() + INTERVAL '7 days',
  last_used_at timestamp with time zone,
  is_active boolean DEFAULT true
);

-- Índice para búsqueda rápida por token
CREATE INDEX IF NOT EXISTS idx_barber_tokens_token
ON barber_tokens(token);

-- RLS: solo el dueño puede crear/ver/revocar tokens
-- de su barbería. Sin RLS recursivo.
ALTER TABLE barber_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_manage_tokens"
ON barber_tokens FOR ALL
USING (
  barbershop_id IN (
    SELECT id FROM barbershops
    WHERE owner_id = auth.uid()
  )
);

-- NOTIFY pgrst, 'reload schema';
