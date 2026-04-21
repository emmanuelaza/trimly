-- ==========================================
-- TRIMLY SaaS: ARCHITECTURE SCHEMA (MULTI-TENANT)
-- Ejecutar en Supabase -> SQL Editor
-- Script Idempotente (Seguro de re-ejecutar)
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Creación segura)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'no_show', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'automation_type') THEN
        CREATE TYPE automation_type AS ENUM ('reminder_24h', 'confirmation', 'post_visit', 'daily_report', 'recover_inactive', 'birthday');
    END IF;
END
$$;

-- 3. TABLES
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barbers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthdate DATE,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  type automation_type NOT NULL,
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barbershop_id, type)
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  automation_type automation_type NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  channel TEXT DEFAULT 'email'
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- DUEÑOS DE BARBERSHOPS
DROP POLICY IF EXISTS "Dueños pueden ver sus propios barbershops" ON barbershops;
CREATE POLICY "Dueños pueden ver sus propios barbershops" ON barbershops FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Dueños pueden insertar sus barbershops" ON barbershops;
CREATE POLICY "Dueños pueden insertar sus barbershops" ON barbershops FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Dueños pueden actualizar sus barbershops" ON barbershops;
CREATE POLICY "Dueños pueden actualizar sus barbershops" ON barbershops FOR UPDATE USING (auth.uid() = owner_id);

-- RESTO DE TABLAS (barbers, clients, services, appointments, automations)
DROP POLICY IF EXISTS "Owner crud on barbers" ON barbers;
CREATE POLICY "Owner crud on barbers" ON barbers FOR ALL USING (
  EXISTS (SELECT 1 FROM barbershops b WHERE b.id = barbers.barbershop_id AND b.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owner crud on clients" ON clients;
CREATE POLICY "Owner crud on clients" ON clients FOR ALL USING (
  EXISTS (SELECT 1 FROM barbershops b WHERE b.id = clients.barbershop_id AND b.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owner crud on services" ON services;
CREATE POLICY "Owner crud on services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM barbershops b WHERE b.id = services.barbershop_id AND b.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owner crud on appointments" ON appointments;
CREATE POLICY "Owner crud on appointments" ON appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM barbershops b WHERE b.id = appointments.barbershop_id AND b.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owner crud on automations" ON automations;
CREATE POLICY "Owner crud on automations" ON automations FOR ALL USING (
  EXISTS (SELECT 1 FROM barbershops b WHERE b.id = automations.barbershop_id AND b.owner_id = auth.uid())
);
