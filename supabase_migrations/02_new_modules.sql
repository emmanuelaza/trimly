-- ==========================================
-- TRIMLY: NEW MODULES (NOMINA, BARBER ACCESS, MILO)
-- ==========================================

-- 1. ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_scheme_type') THEN
        CREATE TYPE payment_scheme_type AS ENUM ('percentage', 'fixed_monthly', 'fixed_per_service');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nomina_payment_status') THEN
        CREATE TYPE nomina_payment_status AS ENUM ('pending', 'paid');
    END IF;
END
$$;

-- 2. ALTER EXISTING TABLES
-- Add user_id to barbers to link with auth.users
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
-- Add invitation_code to barbers to handle registration
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS invitation_code TEXT UNIQUE;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending'; -- 'pending', 'accepted'

-- 3. NEW TABLES

-- Payment Schemes
CREATE TABLE IF NOT EXISTS barber_payment_schemes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE UNIQUE,
    type payment_scheme_type NOT NULL,
    percentage NUMERIC, -- For 'percentage'
    fixed_amount NUMERIC, -- For 'fixed_monthly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Rates (for fixed_per_service)
CREATE TABLE IF NOT EXISTS barber_service_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    fixed_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(barber_id, service_id)
);

-- Payroll Payments
CREATE TABLE IF NOT EXISTS nomina_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    amount_generated NUMERIC NOT NULL,
    amount_barber NUMERIC NOT NULL,
    status nomina_payment_status DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_note TEXT,
    paid_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milo State
CREATE TABLE IF NOT EXISTS milo_state (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    welcome_shown BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS POLICIES

-- Enable RLS
ALTER TABLE barber_payment_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_service_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomina_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE milo_state ENABLE ROW LEVEL SECURITY;

-- Policies for barber_payment_schemes (Owner CRUD)
CREATE POLICY "Owners can manage barber payment schemes" ON barber_payment_schemes
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM barbers b
        JOIN barbershops bs ON b.barbershop_id = bs.id
        WHERE b.id = barber_payment_schemes.barber_id AND bs.owner_id = auth.uid()
    )
);

-- Policies for barber_service_rates (Owner CRUD)
CREATE POLICY "Owners can manage barber service rates" ON barber_service_rates
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM barbers b
        JOIN barbershops bs ON b.barbershop_id = bs.id
        WHERE b.id = barber_service_rates.barber_id AND bs.owner_id = auth.uid()
    )
);

-- Policies for nomina_payments (Owner CRUD)
CREATE POLICY "Owners can manage nomina payments" ON nomina_payments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM barbershops bs
        WHERE bs.id = nomina_payments.barbershop_id AND bs.owner_id = auth.uid()
    )
);

-- Policies for milo_state (User CRUD their own)
CREATE POLICY "Users can manage their own milo state" ON milo_state
FOR ALL USING (auth.uid() = user_id);

-- Barbers can see their own payments
CREATE POLICY "Barbers can see their own payments" ON nomina_payments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM barbers b
        WHERE b.id = nomina_payments.barber_id AND b.user_id = auth.uid()
    )
);

-- Barbers can see their own payment scheme
CREATE POLICY "Barbers can see their own scheme" ON barber_payment_schemes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM barbers b
        WHERE b.id = barber_payment_schemes.barber_id AND b.user_id = auth.uid()
    )
);
