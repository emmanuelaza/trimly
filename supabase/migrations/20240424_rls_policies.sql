-- Migración para configurar RLS en todas las tablas
-- Ejecutar en el SQL Editor de Supabase

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para BARBERSHOPS (Dueños pueden ver y editar su propia barbería)
DROP POLICY IF EXISTS "Users can view own barbershop" ON barbershops;
DROP POLICY IF EXISTS "Users can update own barbershop" ON barbershops;

CREATE POLICY "Users can view own barbershop" ON barbershops
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can update own barbershop" ON barbershops
  FOR UPDATE USING (owner_id = auth.uid());

-- 3. Función auxiliar para verificar pertenencia a la barbería del usuario
-- Esto evita repetir el subquery en cada política

-- 4. Políticas para CLIENTS
DROP POLICY IF EXISTS "users can read own clients" ON clients;
DROP POLICY IF EXISTS "users can insert own clients" ON clients;
DROP POLICY IF EXISTS "users can update own clients" ON clients;
DROP POLICY IF EXISTS "users can delete own clients" ON clients;

CREATE POLICY "users can read own clients" ON clients
  FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can insert own clients" ON clients
  FOR INSERT WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can update own clients" ON clients
  FOR UPDATE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can delete own clients" ON clients
  FOR DELETE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 5. Políticas para BARBERS
DROP POLICY IF EXISTS "users can read own barbers" ON barbers;
DROP POLICY IF EXISTS "users can insert own barbers" ON barbers;
DROP POLICY IF EXISTS "users can update own barbers" ON barbers;
DROP POLICY IF EXISTS "users can delete own barbers" ON barbers;

CREATE POLICY "users can read own barbers" ON barbers
  FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can insert own barbers" ON barbers
  FOR INSERT WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can update own barbers" ON barbers
  FOR UPDATE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can delete own barbers" ON barbers
  FOR DELETE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 6. Políticas para SERVICES
DROP POLICY IF EXISTS "users can read own services" ON services;
DROP POLICY IF EXISTS "users can insert own services" ON services;
DROP POLICY IF EXISTS "users can update own services" ON services;
DROP POLICY IF EXISTS "users can delete own services" ON services;

CREATE POLICY "users can read own services" ON services
  FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can insert own services" ON services
  FOR INSERT WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can update own services" ON services
  FOR UPDATE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can delete own services" ON services
  FOR DELETE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 7. Políticas para APPOINTMENTS
DROP POLICY IF EXISTS "users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "users can delete own appointments" ON appointments;

CREATE POLICY "users can read own appointments" ON appointments
  FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can update own appointments" ON appointments
  FOR UPDATE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

CREATE POLICY "users can delete own appointments" ON appointments
  FOR DELETE USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 8. Políticas para AUTOMATIONS
DROP POLICY IF EXISTS "users can manage own automations" ON automations;
CREATE POLICY "users can manage own automations" ON automations
  FOR ALL USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- 9. Políticas para AUTOMATION_LOGS
DROP POLICY IF EXISTS "users can view own automation logs" ON automation_logs;
CREATE POLICY "users can view own automation logs" ON automation_logs
  FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
