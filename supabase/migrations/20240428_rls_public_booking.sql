-- Enable RLS on tables
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 1. Public SELECT for barbershops, services, and barbers
CREATE POLICY "Public SELECT for barbershops" ON barbershops FOR SELECT USING (true);
CREATE POLICY "Public SELECT for services" ON services FOR SELECT USING (true);
CREATE POLICY "Public SELECT for barbers" ON barbers FOR SELECT USING (true);

-- 2. Public INSERT for appointments and clients
CREATE POLICY "Public INSERT for appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public INSERT for clients" ON clients FOR INSERT WITH CHECK (true);

-- 3. Public SELECT/UPDATE for clients (needed to match existing clients by phone)
-- WARNING: This is a simplified policy for public booking.
-- In a real app, you might want more restricted logic.
CREATE POLICY "Public SELECT for clients matching phone" ON clients FOR SELECT USING (true);
CREATE POLICY "Public UPDATE for clients matching phone" ON clients FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Owners still need access (if they were relying on RLS being disabled before)
-- Adding owner policies (assuming auth.uid() matches owner_id)
CREATE POLICY "Owner access for barbershops" ON barbershops FOR ALL USING (auth.uid() = owner_id);
-- Other owner policies would follow similar patterns for sub-resources joined via barbershop_id
