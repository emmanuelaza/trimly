-- Barber access tokens — magic links for barbers who don't use Supabase Auth
CREATE TABLE IF NOT EXISTS barber_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id uuid NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + INTERVAL '7 days',
  last_used_at timestamptz,
  is_active boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_barber_tokens_token ON barber_tokens(token);
CREATE INDEX IF NOT EXISTS idx_barber_tokens_barber ON barber_tokens(barber_id);

ALTER TABLE barber_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_tokens" ON barber_tokens;
DROP POLICY IF EXISTS "owner_manage_tokens" ON barber_tokens;
DROP POLICY IF EXISTS "public_update_last_used" ON barber_tokens;

-- Public can read tokens to validate them (barbers have no Supabase Auth session)
CREATE POLICY "public_read_tokens"
  ON barber_tokens FOR SELECT
  USING (true);

-- Owner of the barbershop can insert/update/delete tokens
CREATE POLICY "owner_manage_tokens"
  ON barber_tokens FOR ALL
  USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
    )
  );

-- Public can update last_used_at when a barber uses their token
CREATE POLICY "public_update_last_used"
  ON barber_tokens FOR UPDATE
  USING (true)
  WITH CHECK (true);
