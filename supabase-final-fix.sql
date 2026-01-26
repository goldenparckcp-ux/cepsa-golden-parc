-- =======================================================
-- FINAL FIX SCRIPT FOR GOLDEN PARK CEPSA
-- 1. Adds all missing columns
-- 2. Grants full permissions (INSERT/UPDATE/SELECT)
-- 3. Enables RLS but allows ALL traffic for demo purposes
-- =======================================================

-- 1. FIX SERVICE BOOKINGS (Lavage & Mecanique)
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS time_slot VARCHAR(20);
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS service_name VARCHAR(100);
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS booking_time VARCHAR(20);
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- 2. FIX HOTEL RESERVATIONS
ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS room_type VARCHAR(100);
ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE;

-- 3. FIX POOL BOOKINGS
ALTER TABLE pool_bookings ADD COLUMN IF NOT EXISTS infants INT DEFAULT 0;
ALTER TABLE pool_bookings ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. FIX RESTAURANT ORDERS
ALTER TABLE restaurant_orders ADD COLUMN IF NOT EXISTS items JSONB;

-- 5. FIX PERMISSIONS (RLS POLICIES)
-- We drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Enable all access" ON service_bookings;
DROP POLICY IF EXISTS "Enable all access" ON hotel_reservations;
DROP POLICY IF EXISTS "Enable all access" ON pool_bookings;
DROP POLICY IF EXISTS "Enable all access" ON restaurant_orders;
DROP POLICY IF EXISTS "Enable all access" ON profiles;

-- Enable RLS
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create Open Policies (Allows Insert/Update/Select for Everyone)
CREATE POLICY "Enable all access" ON service_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON hotel_reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON pool_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON restaurant_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- 6. GRANT PERMISSIONS TO ROLES
GRANT ALL ON service_bookings TO anon, authenticated, service_role;
GRANT ALL ON hotel_reservations TO anon, authenticated, service_role;
GRANT ALL ON pool_bookings TO anon, authenticated, service_role;
GRANT ALL ON restaurant_orders TO anon, authenticated, service_role;
GRANT ALL ON profiles TO anon, authenticated, service_role;

-- 7. ENSURE SEQUENCES/DEFAULTS
-- Usually UUIDs handle this, but if you used serials elsewhere, grant usage.
