-- HOTFIX: Asegurar columna email en la tabla clients
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='email') THEN
    ALTER TABLE clients ADD COLUMN email text;
  END IF;
END $$;
