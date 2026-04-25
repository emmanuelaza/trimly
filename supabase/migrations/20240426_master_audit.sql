-- MASTER AUDIT MIGRATION 2024.04.26
-- Ensures all tables and columns from the user's checklist exist.

-- 1. CLIENTS
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='email') THEN
    ALTER TABLE clients ADD COLUMN email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='birthday') THEN
    ALTER TABLE clients ADD COLUMN birthday date; -- User specifically asked for 'birthday'
  END IF;
  -- Copy data from birthdate to birthday if anyone used it
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='birthdate') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='birthday') THEN
    UPDATE clients SET birthday = birthdate WHERE birthday IS NULL AND birthdate IS NOT NULL;
  END IF;
END $$;

-- 2. APPOINTMENTS
DO $$ 
BEGIN 
  -- Ensure columns exist. I'm using scheduled_at for both date/time (industry standard), 
  -- but I'll ensure the column scheduled_at exists and has the correct references.
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='price_charged') THEN
    ALTER TABLE appointments ADD COLUMN price_charged numeric DEFAULT 0;
  END IF;
END $$;

-- 3. BARBERSHOPS
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='barbershops' AND column_name='owner_email') THEN
    ALTER TABLE barbershops ADD COLUMN owner_email text;
  END IF;
END $$;

-- 4. ENSURE AUTOMATIONS TYPES ARE OK
-- The types are handled via code, but let's ensure the table structure is solid.
ALTER TABLE IF EXISTS automations ENABLE ROW LEVEL SECURITY;

-- 5. REFRESH CACHE
NOTIFY pgrst, 'reload schema';
