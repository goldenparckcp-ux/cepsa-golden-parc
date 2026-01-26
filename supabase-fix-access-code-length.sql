-- ============================================
-- FIX: Increase access_code column size
-- Run this in Supabase SQL Editor
-- ============================================

-- Alter the existing access_code column to allow longer values
ALTER TABLE hotel_reservations 
ALTER COLUMN access_code TYPE VARCHAR(100);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'access_code column updated to VARCHAR(100) successfully!';
END $$;
