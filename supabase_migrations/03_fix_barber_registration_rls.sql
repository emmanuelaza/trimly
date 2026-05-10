-- SOLUCIÓN: Permitir que el barbero vincule su cuenta al registrarse
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- 1. Permitir que cualquiera actualice un registro 'pending' si conoce el ID (durante el registro)
DROP POLICY IF EXISTS "Permitir vinculación de cuenta" ON barbers;
CREATE POLICY "Permitir vinculación de cuenta" ON barbers 
FOR UPDATE 
TO public
USING (invitation_status = 'pending')
WITH CHECK (invitation_status = 'accepted' AND user_id IS NOT NULL);

-- 2. Permitir que el barbero vea su propio registro
DROP POLICY IF EXISTS "Barberos ven su propio registro" ON barbers;
CREATE POLICY "Barberos ven su propio registro" ON barbers 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Asegurar que los dueños siguen teniendo control total
DROP POLICY IF EXISTS "Dueños control total sobre sus barberos" ON barbers;
CREATE POLICY "Dueños control total sobre sus barberos" ON barbers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM barbershops bs 
    WHERE bs.id = barbers.barbershop_id AND bs.owner_id = auth.uid()
  )
);
