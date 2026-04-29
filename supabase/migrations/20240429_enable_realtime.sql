-- Enable Realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Ensure RLS is enabled and there is a policy for public select (needed for realtime to filter)
-- We already have one from previous migrations, but repeating for clarity:
-- CREATE POLICY "Public SELECT for appointments availability" ON appointments FOR SELECT USING (true);
