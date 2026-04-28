-- Add slug to barbershops for public booking link
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Initial population of slugs based on name
UPDATE barbershops 
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Remove trailing/leading dashes if any
UPDATE barbershops
SET slug = trim(both '-' from slug)
WHERE slug IS NOT NULL;

-- Notify schema change
NOTIFY pgrst, 'reload schema';
