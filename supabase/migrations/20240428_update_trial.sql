-- Update trial default to 3 days
ALTER TABLE barbershops 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '3 days');

-- Update existing trialing accounts
UPDATE barbershops 
SET trial_ends_at = now() + interval '3 days',
    subscription_status = 'trialing'
WHERE subscription_status = 'trialing';
