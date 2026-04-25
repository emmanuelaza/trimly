-- HOTFIX: Agregar columna price_charged si no existe y recargar esquema
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='price_charged') THEN
    ALTER TABLE appointments ADD COLUMN price_charged numeric DEFAULT 0;
  END IF;
END $$;

-- Forzar recarga del caché de PostgREST
NOTIFY pgrst, 'reload schema';
