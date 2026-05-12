-- ============================================================
-- TRIMLY — MIGRACIÓN SQL
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ── 1. REFERIDOS ─────────────────────────────────────────────

-- Completar tabla referral_program
ALTER TABLE referral_program
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS activo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo_beneficio text
    DEFAULT 'porcentaje'
    CHECK (tipo_beneficio IN ('porcentaje', 'monto')),
  ADD COLUMN IF NOT EXISTS valor_beneficio numeric(10,2) DEFAULT 20,
  ADD COLUMN IF NOT EXISTS mensaje_personalizado text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW();

-- Completar tabla referral_uses
ALTER TABLE referral_uses
  ADD COLUMN IF NOT EXISTS estado text DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aplicado')),
  ADD COLUMN IF NOT EXISTS beneficio_aplicado_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS credito_otorgado numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cliente_que_refirio uuid REFERENCES clients(id),
  ADD COLUMN IF NOT EXISTS cliente_nuevo uuid REFERENCES clients(id),
  ADD COLUMN IF NOT EXISTS referral_code text;

-- Agregar columnas de referidos a clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS credito_acumulado numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credito_usado numeric(10,2) DEFAULT 0;

-- Generar códigos para clientes existentes
UPDATE clients
SET referral_code = UPPER(SUBSTRING(MD5(id::text || COALESCE(created_at::text, '')), 1, 8))
WHERE referral_code IS NULL;

-- Función y trigger para nuevos clientes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code = UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_referral_code ON clients;
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Agregar columnas de referidos a appointments
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS referral_code_usado text,
  ADD COLUMN IF NOT EXISTS descuento_referido numeric(10,2) DEFAULT 0;

-- ── 2. EGRESOS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  categoria text NOT NULL
    CHECK (categoria IN (
      'arriendo', 'servicios_publicos', 'insumos',
      'nomina', 'marketing', 'equipos', 'impuestos', 'otro'
    )),
  descripcion text NOT NULL,
  monto numeric(10,2) NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  es_recurrente boolean DEFAULT false,
  frecuencia text CHECK (frecuencia IN ('diario', 'semanal', 'mensual', 'anual')),
  notas text,
  created_at timestamp with time zone DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_expenses" ON expenses;
CREATE POLICY "owner_expenses" ON expenses FOR ALL
  USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- ── 3. NÓMINA ────────────────────────────────────────────────

ALTER TABLE nomina_payments
  ADD COLUMN IF NOT EXISTS periodo_inicio date,
  ADD COLUMN IF NOT EXISTS periodo_fin date,
  ADD COLUMN IF NOT EXISTS monto_generado numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monto_barbero numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estado text DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'pagado')),
  ADD COLUMN IF NOT EXISTS fecha_pago timestamp with time zone,
  ADD COLUMN IF NOT EXISTS metodo_pago text
    CHECK (metodo_pago IN ('efectivo', 'nequi', 'daviplata', 'transferencia', 'otro')),
  ADD COLUMN IF NOT EXISTS nota_pago text,
  ADD COLUMN IF NOT EXISTS pagado_por uuid;
