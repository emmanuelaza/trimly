-- Allow public (unauthenticated) users to read appointments for slot availability checking.
-- This is required for the public booking page to show which time slots are already taken.
-- Only scheduled_at, duration_minutes, status, and barber_id are queried by the booking page.
CREATE POLICY IF NOT EXISTS "Public SELECT for appointments availability"
  ON appointments FOR SELECT USING (true);
