-- FIX DATABASE POLICIES (Safe Version)
-- This script safely drops existing policies before creating new ones to avoid "Policy already exists" errors.

-- 1. Enable RLS on all tables (Just in case)
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop EXISTING policies (To prevent errors)
DROP POLICY IF EXISTS "Enable all access for service_bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Enable all access for pool_bookings" ON public.pool_bookings;
DROP POLICY IF EXISTS "Enable all access for restaurant_orders" ON public.restaurant_orders;
DROP POLICY IF EXISTS "Enable all access for hotel_reservations" ON public.hotel_reservations;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. Create NEW Permissive Policies (Allows all inserts/updates for now found dev)
CREATE POLICY "Enable all access for service_bookings" ON public.service_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for pool_bookings" ON public.pool_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for restaurant_orders" ON public.restaurant_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for hotel_reservations" ON public.hotel_reservations FOR ALL USING (true) WITH CHECK (true);

-- 4. Re-Apply Column Fixes (Just to be 100% sure everything is nullable)
ALTER TABLE public.service_bookings ALTER COLUMN booking_number DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN customer_phone DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN booking_number DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN customer_phone DROP NOT NULL;
ALTER TABLE public.restaurant_orders ALTER COLUMN order_number DROP NOT NULL;
ALTER TABLE public.restaurant_orders ALTER COLUMN customer_phone DROP NOT NULL;
