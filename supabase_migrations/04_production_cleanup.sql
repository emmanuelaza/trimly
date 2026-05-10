-- ==========================================
-- TRIMLY: LIMPIEZA Y OPTIMIZACIÓN DE PRODUCCIÓN
-- ==========================================

-- 1. LIMPIEZA DE DUPLICADOS EN BARBERSHOPS
-- Mantenemos solo la barbería más antigua de cada dueño
DELETE FROM barbershops a USING barbershops b
WHERE a.id > b.id AND a.owner_id = b.owner_id;

-- 2. ASEGURAR UNICIDAD DE DUEÑO (Evita que esto vuelva a pasar)
ALTER TABLE barbershops DROP CONSTRAINT IF EXISTS barbershops_owner_id_key;
ALTER TABLE barbershops ADD CONSTRAINT barbershops_owner_id_key UNIQUE (owner_id);

-- 3. MARCAR ONBOARDING COMO COMPLETADO PARA USUARIOS EXISTENTES
-- Si un dueño ya tiene barberos, servicios o citas, es que ya hizo el onboarding
UPDATE barbershops
SET onboarding_completed = true
WHERE onboarding_completed = false
AND (
  EXISTS (SELECT 1 FROM barbers b WHERE b.barbershop_id = barbershops.id) OR
  EXISTS (SELECT 1 FROM services s WHERE s.barbershop_id = barbershops.id) OR
  EXISTS (SELECT 1 FROM appointments a WHERE a.barbershop_id = barbershops.id)
);

-- 4. VERIFICAR ROLES (Si el usuario no tiene rol en metadata, asumimos owner si tiene barbershop)
-- Este paso se hace en el código generalmente, pero aquí aseguramos las columnas.
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending';

-- 5. POLÍTICAS DE SEGURIDAD PARA BARBEROS (Re-asegurar)
DROP POLICY IF EXISTS "Barberos ven su propio registro" ON barbers;
CREATE POLICY "Barberos ven su propio registro" ON barbers 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Barberos ven su barberia" ON barbershops;
CREATE POLICY "Barberos ven su barberia" ON barbershops 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM barbers b 
    WHERE b.barbershop_id = barbershops.id 
    AND (b.user_id = auth.uid() OR b.email = auth.jwt() ->> 'email')
  )
);

-- RECARGAR SCHEMA
NOTIFY pgrst, 'reload schema';
