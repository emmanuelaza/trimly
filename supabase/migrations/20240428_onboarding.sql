-- Add onboarding fields to barbershops
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT '{
  "monday": {"active": true, "open": "09:00", "close": "19:00"},
  "tuesday": {"active": true, "open": "09:00", "close": "19:00"},
  "wednesday": {"active": true, "open": "09:00", "close": "19:00"},
  "thursday": {"active": true, "open": "09:00", "close": "19:00"},
  "friday": {"active": true, "open": "09:00", "close": "19:00"},
  "saturday": {"active": true, "open": "09:00", "close": "19:00"},
  "sunday": {"active": false, "open": "09:00", "close": "19:00"}
}'::jsonb;

-- Notify schema change
NOTIFY pgrst, 'reload schema';
