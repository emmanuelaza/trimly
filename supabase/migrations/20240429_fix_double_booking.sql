-- 1. Enable Realtime for appointments table (ensure it's in the publication)
-- Note: If already added, this might need to be handled gracefully in Supabase UI, 
-- but SQL-wise we can re-verify or add other tables if needed.
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- 2. Create Unique Index to prevent double bookings at the database level
-- This prevents the same barber from having two confirmed/pending appointments 
-- at the exact same scheduled_at time.
CREATE UNIQUE INDEX IF NOT EXISTS appointments_barber_slot_unique 
ON appointments (barber_id, scheduled_at) 
WHERE status IN ('confirmed', 'pending');
