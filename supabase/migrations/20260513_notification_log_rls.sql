-- Allow barbershop owners to read their own notification log
CREATE POLICY "owner_notification_log_select" ON notification_log
  FOR SELECT USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- Enable realtime for notification_log (run in Supabase dashboard too: Table Editor > Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE notification_log;
