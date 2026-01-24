-- ============================================
-- MIGRATION FIX SCRIPT
-- Run this to fix "column does not exist" errors
-- caused by existing tables lacking new columns
-- ============================================

-- 1. Fix service_bookings (Lavage & Mecanique)
DO $$
BEGIN
    -- Lavage specific columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'scheduled_date') THEN
        ALTER TABLE service_bookings ADD COLUMN scheduled_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'time_slot') THEN
        ALTER TABLE service_bookings ADD COLUMN time_slot VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'service_id') THEN
        ALTER TABLE service_bookings ADD COLUMN service_id INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'service_name') THEN
        ALTER TABLE service_bookings ADD COLUMN service_name VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'duration') THEN
        ALTER TABLE service_bookings ADD COLUMN duration VARCHAR(20);
    END IF;

    -- Mecanique specific columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'services') THEN
        ALTER TABLE service_bookings ADD COLUMN services JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'scheduled_time') THEN
        ALTER TABLE service_bookings ADD COLUMN scheduled_time TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'appointment_type') THEN
        ALTER TABLE service_bookings ADD COLUMN appointment_type VARCHAR(20);
    END IF;

    -- Common columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'vehicle_info') THEN
        ALTER TABLE service_bookings ADD COLUMN vehicle_info TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'notes') THEN
        ALTER TABLE service_bookings ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'price') THEN
        ALTER TABLE service_bookings ADD COLUMN price DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'completed_at') THEN
        ALTER TABLE service_bookings ADD COLUMN completed_at TIMESTAMP;
    END IF;
END $$;


-- 2. Fix hotel_reservations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'checked_in_at') THEN
        ALTER TABLE hotel_reservations ADD COLUMN checked_in_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'checked_out_at') THEN
        ALTER TABLE hotel_reservations ADD COLUMN checked_out_at TIMESTAMP;
    END IF;
END $$;


-- 3. Fix pool_bookings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'checked_in_at') THEN
        ALTER TABLE pool_bookings ADD COLUMN checked_in_at TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'completed_at') THEN
        ALTER TABLE pool_bookings ADD COLUMN completed_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'notes') THEN
        ALTER TABLE pool_bookings ADD COLUMN notes TEXT;
    END IF;
END $$;


-- 4. Fix restaurant_orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_orders' AND column_name = 'completed_at') THEN
        ALTER TABLE restaurant_orders ADD COLUMN completed_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_orders' AND column_name = 'service_fee') THEN
        ALTER TABLE restaurant_orders ADD COLUMN service_fee DECIMAL(10,2) DEFAULT 10;
    END IF;
END $$;

-- 5. STAFF Table (Ensure it exists)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('kitchen', 'services', 'hotel', 'admin')),
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
