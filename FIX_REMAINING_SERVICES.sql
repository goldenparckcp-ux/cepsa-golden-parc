-- FIX SERVICE BOOKINGS (Wash, Mechanic, etc)
CREATE TABLE IF NOT EXISTS public.service_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if missing
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS booking_number TEXT;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS booking_date TEXT;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS notes TEXT;

-- Remove Constraints
ALTER TABLE public.service_bookings ALTER COLUMN booking_number DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN customer_phone DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN service_type DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN service_name DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN booking_date DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN time_slot DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN total_price DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN price DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN status DROP NOT NULL;
ALTER TABLE public.service_bookings ALTER COLUMN notes DROP NOT NULL;

-- Drop check constraints if they exist (hard to know name, but usually 'service_bookings_status_check')
ALTER TABLE public.service_bookings DROP CONSTRAINT IF EXISTS service_bookings_status_check;
ALTER TABLE public.service_bookings DROP CONSTRAINT IF EXISTS service_bookings_service_type_check;


-- FIX POOL BOOKINGS
CREATE TABLE IF NOT EXISTS public.pool_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add known columns
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS booking_number TEXT;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS booking_date TEXT;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS ambiance TEXT;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS adults INTEGER;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS children INTEGER;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS infants INTEGER;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS user_id UUID;

-- Remove Constraints
ALTER TABLE public.pool_bookings ALTER COLUMN booking_number DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN customer_phone DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN booking_date DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN time_slot DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN ambiance DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN adults DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN children DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN infants DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN total_price DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN status DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN notes DROP NOT NULL;
ALTER TABLE public.pool_bookings ALTER COLUMN user_id DROP NOT NULL;

-- Drop check constraints
ALTER TABLE public.pool_bookings DROP CONSTRAINT IF EXISTS pool_bookings_status_check;
ALTER TABLE public.pool_bookings DROP CONSTRAINT IF EXISTS pool_bookings_ambiance_check;
ALTER TABLE public.pool_bookings DROP CONSTRAINT IF EXISTS pool_bookings_time_slot_check;


-- FIX RESTAURANT ORDERS
CREATE TABLE IF NOT EXISTS public.restaurant_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- Remove Constraints
ALTER TABLE public.restaurant_orders ALTER COLUMN order_number DROP NOT NULL;
ALTER TABLE public.restaurant_orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.restaurant_orders ALTER COLUMN customer_phone DROP NOT NULL;
ALTER TABLE public.restaurant_orders ALTER COLUMN items DROP NOT NULL;
ALTER TABLE public.restaurant_orders ALTER COLUMN status DROP NOT NULL;
ALTER TABLE public.restaurant_orders ALTER COLUMN subtotal DROP NOT NULL;
ALTER TABLE public.restaurant_orders ALTER COLUMN total_price DROP NOT NULL;

-- Drop check constraints
ALTER TABLE public.restaurant_orders DROP CONSTRAINT IF EXISTS restaurant_orders_status_check;

-- ENABLE RLS (But keep it permissive for now to ensure inserts work)
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;

-- RE-APPLY PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Enable all access for service_bookings" ON public.service_bookings;
CREATE POLICY "Enable all access for service_bookings" ON public.service_bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for pool_bookings" ON public.pool_bookings;
CREATE POLICY "Enable all access for pool_bookings" ON public.pool_bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for restaurant_orders" ON public.restaurant_orders;
CREATE POLICY "Enable all access for restaurant_orders" ON public.restaurant_orders FOR ALL USING (true) WITH CHECK (true);
