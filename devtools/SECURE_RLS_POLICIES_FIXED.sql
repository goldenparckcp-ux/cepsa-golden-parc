-- ===================================================
-- SECURE RLS POLICIES FOR CEPSA GOLDEN PARK (FIXED)
-- Run this in your Supabase SQL Editor
-- This script locks down all tables to prevent public bypass.
-- ===================================================

-- 1. Ensure user_id column exists f all booking/order tables to prevent errors
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.hotel_reservations ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Enable Row Level Security (RLS) on all user/staff tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing wide-open or duplicate policies to prevent conflicts
DROP POLICY IF EXISTS "Enable all access for service_bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Enable all access for pool_bookings" ON public.pool_bookings;
DROP POLICY IF EXISTS "Enable all access for restaurant_orders" ON public.restaurant_orders;
DROP POLICY IF EXISTS "Enable all access for hotel_reservations" ON public.hotel_reservations;
DROP POLICY IF EXISTS "Allow public inserts" ON public.restaurant_orders;
DROP POLICY IF EXISTS "Allow public inserts" ON public.hotel_reservations;
DROP POLICY IF EXISTS "Allow public inserts" ON public.pool_bookings;
DROP POLICY IF EXISTS "Allow public inserts" ON public.service_bookings;
DROP POLICY IF EXISTS "Allow authenticated users to read their own orders" ON public.restaurant_orders;
DROP POLICY IF EXISTS "Allow authenticated users to read their own reservations" ON public.hotel_reservations;
DROP POLICY IF EXISTS "Allow authenticated users to read their own pool bookings" ON public.pool_bookings;
DROP POLICY IF EXISTS "Allow authenticated users to read their own service bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Allow public access staff" ON public.staff;
DROP POLICY IF EXISTS "Allow public access orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public access order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop specific target policies to make the script re-runnable (idempotent)
DROP POLICY IF EXISTS "Profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
DROP POLICY IF EXISTS "Resto orders select own" ON public.restaurant_orders;
DROP POLICY IF EXISTS "Resto orders insert own" ON public.restaurant_orders;
DROP POLICY IF EXISTS "Resto orders update own" ON public.restaurant_orders;
DROP POLICY IF EXISTS "Orders select own" ON public.orders;
DROP POLICY IF EXISTS "Orders insert own" ON public.orders;
DROP POLICY IF EXISTS "Orders update own" ON public.orders;
DROP POLICY IF EXISTS "Order items select own" ON public.order_items;
DROP POLICY IF EXISTS "Order items insert own" ON public.order_items;
DROP POLICY IF EXISTS "Hotel select own" ON public.hotel_reservations;
DROP POLICY IF EXISTS "Hotel insert own" ON public.hotel_reservations;
DROP POLICY IF EXISTS "Hotel update own" ON public.hotel_reservations;
DROP POLICY IF EXISTS "Pool select own" ON public.pool_bookings;
DROP POLICY IF EXISTS "Pool insert own" ON public.pool_bookings;
DROP POLICY IF EXISTS "Pool update own" ON public.pool_bookings;
DROP POLICY IF EXISTS "Services select own" ON public.service_bookings;
DROP POLICY IF EXISTS "Services insert own" ON public.service_bookings;
DROP POLICY IF EXISTS "Services update own" ON public.service_bookings;
DROP POLICY IF EXISTS "Transactions select own" ON public.transactions;
DROP POLICY IF EXISTS "Transactions insert own" ON public.transactions;

-- ===================================================
-- 4. Create SECURE Policies
-- ===================================================

-- A. Profiles (Users can only read and modify their own profile)
CREATE POLICY "Profiles select own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- B. Staff (No public policies! Completely locked down from Anon key. Bypassed by Admin Service Role)
-- Explicitly denying everything for public.
-- (Supabase default is deny if no policy matches and RLS is enabled).

-- C. Restaurant Orders (restaurant_orders table - used in RestaurantClient)
CREATE POLICY "Resto orders select own" ON public.restaurant_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Resto orders insert own" ON public.restaurant_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Resto orders update own" ON public.restaurant_orders FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- D. Orders (orders table - used in api/orders)
CREATE POLICY "Orders select own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Orders insert own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Orders update own" ON public.orders FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- E. Order Items (order_items table - references orders)
CREATE POLICY "Order items select own" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);
CREATE POLICY "Order items insert own" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- F. Hotel Reservations
CREATE POLICY "Hotel select own" ON public.hotel_reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hotel insert own" ON public.hotel_reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Hotel update own" ON public.hotel_reservations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- G. Pool Bookings
CREATE POLICY "Pool select own" ON public.pool_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pool insert own" ON public.pool_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pool update own" ON public.pool_bookings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- H. Service Bookings
CREATE POLICY "Services select own" ON public.service_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Services insert own" ON public.service_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Services update own" ON public.service_bookings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- I. Transactions
CREATE POLICY "Transactions select own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Transactions insert own" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================================================
-- 5. Reload Config Notice
-- ===================================================
NOTIFY pgrst, 'reload config';
