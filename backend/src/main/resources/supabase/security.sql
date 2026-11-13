-- Supabase only. Closes Supabase's own public data API to the table. Spring is not affected,
-- because it connects as the table's owner. Safe to run again.
ALTER TABLE property ENABLE ROW LEVEL SECURITY;
