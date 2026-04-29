-- 1. Enable Realtime for appointments table
-- This publication might already exist, so we use a safe approach
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'appointments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;
END $$;

-- 2. Ensure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 3. Add Public SELECT policy for appointments availability check
DROP POLICY IF EXISTS "Public SELECT for appointments availability" ON appointments;
CREATE POLICY "Public SELECT for appointments availability" ON appointments 
FOR SELECT 
TO anon
USING (status IN ('confirmed', 'pending'));

-- 4. Add unique index to prevent double booking at the database level
-- This handles the case where multiple requests arrive at the same time
CREATE UNIQUE INDEX IF NOT EXISTS appointments_barber_slot_unique 
ON appointments (barber_id, scheduled_at) 
WHERE status IN ('confirmed', 'pending');
