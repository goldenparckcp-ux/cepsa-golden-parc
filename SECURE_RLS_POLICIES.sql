-- ==========================================
-- SECURE RLS POLICIES FOR CEPSA GOLDEN PARK
-- ==========================================
-- This script locks down the customer tables.
-- Admin APIs use the SERVICE_ROLE key, which bypasses RLS.
-- Therefore, we can safely block SELECT/UPDATE/DELETE for the Anon Key.

-- 1. Enable RLS on all tables (Just in case)
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_reservations ENABLE ROW LEVEL SECURITY;

-- 2. Drop the dangerous "Enable all access" policies
DROP POLICY IF EXISTS "Enable all access for service_bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Enable all access for pool_bookings" ON public.pool_bookings;
DROP POLICY IF EXISTS "Enable all access for restaurant_orders" ON public.restaurant_orders;
DROP POLICY IF EXISTS "Enable all access for hotel_reservations" ON public.hotel_reservations;

-- 3. Create Secure Policies

-- A. Restaurant Orders
CREATE POLICY "Allow public inserts" ON public.restaurant_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read their own orders" ON public.restaurant_orders FOR SELECT USING (auth.uid() = user_id);

-- B. Hotel Reservations
CREATE POLICY "Allow public inserts" ON public.hotel_reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read their own reservations" ON public.hotel_reservations FOR SELECT USING (auth.uid() = user_id);

-- C. Pool Bookings
CREATE POLICY "Allow public inserts" ON public.pool_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read their own pool bookings" ON public.pool_bookings FOR SELECT USING (auth.uid() = user_id);

-- D. Service Bookings
CREATE POLICY "Allow public inserts" ON public.service_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read their own service bookings" ON public.service_bookings FOR SELECT USING (auth.uid() = user_id);

-- E. Profiles (Optional, but good practice to ensure users only edit their own profiles)
-- Leaving this commented out to avoid breaking profile creation logic if it relies on Anon.
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Databases are now secured. RLS is active.';
END $$;
