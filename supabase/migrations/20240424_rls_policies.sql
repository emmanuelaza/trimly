-- MIGRACIÓN COMPLETA: ESQUEMA + RLS
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. ESTRUCTURA BASE (Por si faltan columnas)
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

-- 2. HABILITAR RLS
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS PARA BARBERSHOPS
DROP POLICY IF EXISTS "Users can view own barbershop" ON barbershops;
DROP POLICY IF EXISTS "Users can update own barbershop" ON barbershops;
CREATE POLICY "Users can view own barbershop" ON barbershops FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can update own barbershop" ON barbershops FOR UPDATE USING (owner_id = auth.uid());

-- 4. POLÍTICAS PARA CLIENTS
DROP POLICY IF EXISTS "users can read own clients" ON clients;
DROP POLICY IF EXISTS "users can insert own clients" ON clients;
DROP POLICY IF EXISTS "users can update own clients" ON clients;
DROP POLICY IF EXISTS "users can delete own clients" ON clients;

CREATE POLICY "users can read own clients" ON clients FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can insert own clients" ON clients FOR INSERT WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can update own clients" ON clients FOR UPDATE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can delete own clients" ON clients FOR DELETE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 5. POLÍTICAS PARA BARBERS
DROP POLICY IF EXISTS "users can read own barbers" ON barbers;
DROP POLICY IF EXISTS "users can insert own barbers" ON barbers;
DROP POLICY IF EXISTS "users can update own barbers" ON barbers;
DROP POLICY IF EXISTS "users can delete own barbers" ON barbers;

CREATE POLICY "users can read own barbers" ON barbers FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can insert own barbers" ON barbers FOR INSERT WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can update own barbers" ON barbers FOR UPDATE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can delete own barbers" ON barbers FOR DELETE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 6. POLÍTICAS PARA SERVICES
DROP POLICY IF EXISTS "users can read own services" ON services;
DROP POLICY IF EXISTS "users can insert own services" ON services;
DROP POLICY IF EXISTS "users can update own services" ON services;
DROP POLICY IF EXISTS "users can delete own services" ON services;

CREATE POLICY "users can read own services" ON services FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can insert own services" ON services FOR INSERT WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can update own services" ON services FOR UPDATE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can delete own services" ON services FOR DELETE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 7. POLÍTICAS PARA APPOINTMENTS
DROP POLICY IF EXISTS "users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "users can delete own appointments" ON appointments;

CREATE POLICY "users can read own appointments" ON appointments FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can insert own appointments" ON appointments FOR INSERT WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can update own appointments" ON appointments FOR UPDATE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "users can delete own appointments" ON appointments FOR DELETE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 8. POLÍTICAS PARA AUTOMATIONS
DROP POLICY IF EXISTS "users can manage own automations" ON automations;
CREATE POLICY "users can manage own automations" ON automations FOR ALL USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 9. POLÍTICAS PARA AUTOMATION_LOGS
DROP POLICY IF EXISTS "users can view own automation logs" ON automation_logs;
CREATE POLICY "users can view own automation logs" ON automation_logs FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
