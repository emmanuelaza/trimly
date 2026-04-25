-- UNIFICACIÓN DE ESQUEMA (INGLÉS)
-- Este script elimina las tablas en español (si existen) y asegura que las inglesas tengan el esquema correcto.

-- 1. ELIMINAR TABLAS EN ESPAÑOL (LIMPIEZA)
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS barberos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS ingresos CASCADE;

-- 2. ASEGURAR TABLA BARBERSHOPS
CREATE TABLE IF NOT EXISTS barbershops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  name text NOT NULL,
  address text,
  phone text,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. CREAR/ACTUALIZAR TABLAS EN INGLÉS
CREATE TABLE IF NOT EXISTS barbers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  birthdate date,
  last_visit timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_minutes integer DEFAULT 30,
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id),
  client_id uuid REFERENCES clients(id),
  service_id uuid REFERENCES services(id),
  scheduled_at timestamptz NOT NULL,
  status text DEFAULT 'pending',
  notes text,
  price_charged numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. HABILITAR RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS (UNIFICADAS)

-- BARBERS
DROP POLICY IF EXISTS "owner can manage barbers" ON barbers;
CREATE POLICY "owner can manage barbers" ON barbers FOR ALL
  USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()))
  WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- CLIENTS
DROP POLICY IF EXISTS "owner can manage clients" ON clients;
CREATE POLICY "owner can manage clients" ON clients FOR ALL
  USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()))
  WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- SERVICES
DROP POLICY IF EXISTS "owner can manage services" ON services;
CREATE POLICY "owner can manage services" ON services FOR ALL
  USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()))
  WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- APPOINTMENTS
DROP POLICY IF EXISTS "owner can manage appointments" ON appointments;
CREATE POLICY "owner can manage appointments" ON appointments FOR ALL
  USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()))
  WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
