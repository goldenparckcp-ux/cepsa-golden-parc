-- ============================================
-- COMPLETE DATABASE FIX FOR CEPSA GOLDEN PARK
-- Fixes all missing columns, tables, and permissions
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE PROFILES TABLE (if missing)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) UNIQUE,
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. FIX SERVICE_BOOKINGS TABLE
-- ============================================
-- Add missing columns
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS time_slot VARCHAR(20);
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS service_name VARCHAR(100);
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS booking_time VARCHAR(20);
ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- ============================================
-- 3. CREATE/FIX POOL_BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pool_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  booking_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'full_day')),
  adults INTEGER DEFAULT 0 CHECK (adults >= 0),
  children INTEGER DEFAULT 0 CHECK (children >= 0),
  infants INTEGER DEFAULT 0 CHECK (infants >= 0),
  total_price DECIMAL(10,2),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'checked_in', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  checked_in_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Add indexes for pool_bookings
CREATE INDEX IF NOT EXISTS idx_pool_bookings_customer ON pool_bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_pool_bookings_user ON pool_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_pool_bookings_date ON pool_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_pool_bookings_status ON pool_bookings(status);

-- ============================================
-- 4. FIX HOTEL_RESERVATIONS TABLE
-- ============================================
ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS room_type VARCHAR(100);
ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE hotel_reservations ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 5. FIX RESTAURANT_ORDERS TABLE
-- ============================================
ALTER TABLE restaurant_orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE restaurant_orders ADD COLUMN IF NOT EXISTS items JSONB;

-- ============================================
-- 6. DISABLE RLS TEMPORARILY & DROP OLD POLICIES
-- ============================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE pool_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_orders DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable all access" ON profiles;
DROP POLICY IF EXISTS "Enable all access" ON service_bookings;
DROP POLICY IF EXISTS "Enable all access" ON hotel_reservations;
DROP POLICY IF EXISTS "Enable all access" ON pool_bookings;
DROP POLICY IF EXISTS "Enable all access" ON restaurant_orders;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- ============================================
-- 7. ENABLE RLS WITH OPEN POLICIES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allows all operations for demo)
CREATE POLICY "Enable all access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON service_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON hotel_reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON pool_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON restaurant_orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 8. GRANT PERMISSIONS TO ALL ROLES
-- ============================================
GRANT ALL ON profiles TO anon, authenticated, service_role;
GRANT ALL ON service_bookings TO anon, authenticated, service_role;
GRANT ALL ON hotel_reservations TO anon, authenticated, service_role;
GRANT ALL ON pool_bookings TO anon, authenticated, service_role;
GRANT ALL ON restaurant_orders TO anon, authenticated, service_role;

-- Grant sequence permissions (if using serial IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================
-- 9. CREATE TRIGGER FOR AUTO-UPDATING updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'service_bookings';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pool_bookings';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'hotel_reservations';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'restaurant_orders';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
