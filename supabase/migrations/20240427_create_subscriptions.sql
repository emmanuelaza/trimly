-- CREATE subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('mensual', 'anual', 'lifetime')),
  status text NOT NULL CHECK (status IN ('active', 'paused', 'cancelled', 'pending', 'expired')),
  mp_subscription_id text,
  mp_preference_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update barbershops table with subscription fields
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS subscription_status text 
  DEFAULT 'trialing' 
  CHECK (subscription_status IN ('trialing', 'active', 'paused', 'cancelled', 'expired'));

ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz 
  DEFAULT (now() + interval '7 days');

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Owner can view their own subscription
CREATE POLICY "Owner can manage their own subscription" ON subscriptions
  FOR ALL
  USING (barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid()));

-- Policy: Notify schema change if needed (standard for this project)
NOTIFY pgrst, 'reload schema';
