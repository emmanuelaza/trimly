-- Migration: Create automations and automation_logs tables
-- Date: 2024-04-23

CREATE TABLE IF NOT EXISTS automations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  type text NOT NULL,
  is_active boolean DEFAULT false,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(barbershop_id, type)
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id),
  automation_type text NOT NULL,
  appointment_id uuid REFERENCES appointments(id),
  client_id uuid REFERENCES clients(id),
  sent_at timestamptz DEFAULT now(),
  channel text DEFAULT 'email'
);

-- RLS Policies (Basic)
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- If you have a way to check owner_id:
-- CREATE POLICY "Users can view their own automations" ON automations
-- FOR SELECT USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));
