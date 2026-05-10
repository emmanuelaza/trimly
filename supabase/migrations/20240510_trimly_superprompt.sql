-- TABLA: products
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  categoria text NOT NULL DEFAULT 'Otro',
  precio_costo numeric(10,2) DEFAULT 0,
  precio_venta numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- TABLA: product_sales
CREATE TABLE IF NOT EXISTS product_sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id),
  appointment_id uuid REFERENCES appointments(id),
  cantidad integer NOT NULL DEFAULT 1,
  precio_unitario numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT NOW()
);

-- TABLA: locations (sedes)
CREATE TABLE IF NOT EXISTS locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  direccion text,
  telefono text,
  horario jsonb,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW()
);

-- TABLA: barber_locations
CREATE TABLE IF NOT EXISTS barber_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id uuid NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  UNIQUE(barber_id, location_id)
);

-- TABLA: coupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  codigo text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('porcentaje', 'monto')),
  valor numeric(10,2) NOT NULL,
  servicios_ids uuid[] DEFAULT '{}',
  usos_maximos integer DEFAULT 0,
  usos_actuales integer DEFAULT 0,
  fecha_vencimiento timestamp with time zone,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW(),
  UNIQUE(barbershop_id, codigo)
);

-- TABLA: reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id),
  cliente_nombre text,
  calificacion integer NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario text,
  es_publica boolean DEFAULT false,
  mostrar_en_pagina boolean DEFAULT false,
  codigo_unico text UNIQUE NOT NULL,
  leida boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW()
);

-- TABLA: referral_program
CREATE TABLE IF NOT EXISTS referral_program (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  activo boolean DEFAULT false,
  tipo_beneficio text DEFAULT 'porcentaje',
  valor_beneficio numeric(10,2) DEFAULT 20,
  mensaje_personalizado text,
  created_at timestamp with time zone DEFAULT NOW(),
  UNIQUE(barbershop_id)
);

-- TABLA: referral_uses
CREATE TABLE IF NOT EXISTS referral_uses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  cliente_que_refirio uuid REFERENCES clients(id),
  cliente_nuevo uuid REFERENCES clients(id),
  appointment_id uuid REFERENCES appointments(id),
  credito_otorgado numeric(10,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW()
);

-- TABLA: push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  keys_p256dh text NOT NULL,
  keys_auth text NOT NULL,
  notif_nueva_cita boolean DEFAULT true,
  notif_cancelacion boolean DEFAULT true,
  notif_nomina boolean DEFAULT true,
  notif_cliente_inactivo boolean DEFAULT true,
  notif_resumen_diario boolean DEFAULT false,
  notif_resumen_semanal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- TABLA: notification_log
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  titulo text NOT NULL,
  cuerpo text NOT NULL,
  enviada boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Agregar columnas a tablas existentes
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS cupon_id uuid REFERENCES coupons(id),
  ADD COLUMN IF NOT EXISTS descuento_aplicado numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id);

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS bloqueado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS razon_bloqueo text,
  ADD COLUMN IF NOT EXISTS fecha_bloqueo timestamp with time zone,
  ADD COLUMN IF NOT EXISTS no_shows integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS credito_acumulado numeric(10,2) DEFAULT 0;

-- Generar códigos de referido para clientes existentes
UPDATE clients
SET referral_code = UPPER(SUBSTRING(MD5(id::text), 1, 8))
WHERE referral_code IS NULL;

-- RLS para todas las tablas nuevas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (sin recursión)
CREATE POLICY "owner_products" ON products FOR ALL USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "owner_product_sales" ON product_sales FOR ALL USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "owner_locations" ON locations FOR ALL USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "owner_coupons" ON coupons FOR ALL USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "owner_reviews" ON reviews FOR ALL USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "public_reviews_select" ON reviews FOR SELECT USING (es_publica = true AND mostrar_en_pagina = true);
CREATE POLICY "owner_referral_program" ON referral_program FOR ALL USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
CREATE POLICY "owner_push_subscriptions" ON push_subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "public_reviews_insert" ON reviews FOR INSERT WITH CHECK (true);
