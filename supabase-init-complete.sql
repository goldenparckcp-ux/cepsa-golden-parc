-- ============================================
-- COMPLETE DATABASE INITIALIZATION & FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- It handles both NEW tables and EXISTING ones.
-- ============================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STAFF
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('kitchen', 'services', 'hotel', 'admin')),
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- ============================================
-- RESTAURANT ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS restaurant_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  items JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  subtotal DECIMAL(10,2),
  service_fee DECIMAL(10,2) DEFAULT 10,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Patch existing restaurant_orders if missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_orders' AND column_name = 'completed_at') THEN
        ALTER TABLE restaurant_orders ADD COLUMN completed_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_orders' AND column_name = 'service_fee') THEN
        ALTER TABLE restaurant_orders ADD COLUMN service_fee DECIMAL(10,2) DEFAULT 10;
    END IF;
END $$;


-- ============================================
-- SERVICE BOOKINGS (Lavage + Mecanique)
-- ============================================
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('lavage', 'mecanique')),
  service_id INTEGER,
  service_name VARCHAR(100),
  scheduled_date DATE,
  time_slot VARCHAR(10),
  duration VARCHAR(20),
  services JSONB,
  scheduled_time TIMESTAMP,
  appointment_type VARCHAR(20),
  vehicle_info TEXT,
  notes TEXT,
  price DECIMAL(10,2),
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Patch existing service_bookings if missing columns
DO $$
BEGIN
    -- Add columns individually if they don't exist
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'services') THEN
        ALTER TABLE service_bookings ADD COLUMN services JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'appointment_type') THEN
        ALTER TABLE service_bookings ADD COLUMN appointment_type VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'completed_at') THEN
        ALTER TABLE service_bookings ADD COLUMN completed_at TIMESTAMP;
    END IF;
END $$;


-- ============================================
-- HOTEL RESERVATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS hotel_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  room_number INTEGER NOT NULL,
  room_type VARCHAR(50),
  check_in_time TIMESTAMP NOT NULL,
  duration VARCHAR(20),
  price DECIMAL(10,2),
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMP
);

-- Patch hotel
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'checked_in_at') THEN
        ALTER TABLE hotel_reservations ADD COLUMN checked_in_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'checked_out_at') THEN
        ALTER TABLE hotel_reservations ADD COLUMN checked_out_at TIMESTAMP;
    END IF;
END $$;


-- ============================================
-- POOL BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS pool_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  adults INTEGER DEFAULT 0,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,
  total_price DECIMAL(10,2),
  notes TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  checked_in_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Patch pool
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'checked_in_at') THEN
        ALTER TABLE pool_bookings ADD COLUMN checked_in_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'completed_at') THEN
        ALTER TABLE pool_bookings ADD COLUMN completed_at TIMESTAMP;
    END IF;
END $$;
