-- SCRIPT PARA REPARAR EL ESQUEMA (Multi-tenant)
-- Ejecutar en el SQL Editor de Supabase si falla la migración de RLS

-- 1. Asegurar que existe la tabla barbershops
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Agregar columna barbershop_id a todas las tablas si no existe
DO $$ 
BEGIN 
  -- Tabla clients
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='barbershop_id') THEN
    ALTER TABLE clients ADD COLUMN barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
  END IF;

  -- Tabla barbers
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='barbers' AND column_name='barbershop_id') THEN
    ALTER TABLE barbers ADD COLUMN barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
  END IF;

  -- Tabla services
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='barbershop_id') THEN
    ALTER TABLE services ADD COLUMN barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
  END IF;

  -- Tabla appointments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='barbershop_id') THEN
    ALTER TABLE appointments ADD COLUMN barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
  END IF;

  -- Tabla automations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='automations' AND column_name='barbershop_id') THEN
    ALTER TABLE automations ADD COLUMN barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
  END IF;

  -- Tabla automation_logs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='automation_logs' AND column_name='barbershop_id') THEN
    ALTER TABLE automation_logs ADD COLUMN barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Ahora sí, habilitar RLS y crear políticas (reutilizando el script anterior)
-- Ejecuta el script de RLS después de este
