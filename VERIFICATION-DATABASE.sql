-- ============================================
-- VERIFICATION SCRIPT
-- Run this to check if all columns exist
-- ============================================

-- Check service_bookings columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'service_bookings'
ORDER BY ordinal_position;

-- Check pool_bookings columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pool_bookings'
ORDER BY ordinal_position;

-- Check hotel_reservations columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'hotel_reservations'
ORDER BY ordinal_position;

-- Check restaurant_orders columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'restaurant_orders'
ORDER BY ordinal_position;

-- Check profiles columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('service_bookings', 'pool_bookings', 'hotel_reservations', 'restaurant_orders', 'profiles');
