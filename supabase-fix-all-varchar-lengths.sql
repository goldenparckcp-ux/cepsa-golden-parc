-- ============================================
-- COMPREHENSIVE FIX: Update ALL VARCHAR columns to appropriate lengths
-- Run this in Supabase SQL Editor
-- ============================================

-- This migration increases VARCHAR limits across all tables to prevent
-- "value too long for type character varying(X)" errors

-- ============================================
-- STAFF TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
        -- Update phone column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' 
            AND column_name = 'phone'
        ) THEN
            ALTER TABLE staff ALTER COLUMN phone TYPE VARCHAR(50);
        END IF;
        
        -- Update pin_hash column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' 
            AND column_name = 'pin_hash'
        ) THEN
            ALTER TABLE staff ALTER COLUMN pin_hash TYPE VARCHAR(500);
        END IF;
        
        -- Update role column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' 
            AND column_name = 'role'
        ) THEN
            ALTER TABLE staff ALTER COLUMN role TYPE VARCHAR(50);
        END IF;
        
        -- Update name column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' 
            AND column_name = 'name'
        ) THEN
            ALTER TABLE staff ALTER COLUMN name TYPE VARCHAR(200);
        END IF;
    END IF;
END $$;

-- ============================================
-- RESTAURANT_ORDERS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_orders') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'restaurant_orders' 
            AND column_name = 'order_number'
        ) THEN
            ALTER TABLE restaurant_orders ALTER COLUMN order_number TYPE VARCHAR(50);
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'restaurant_orders' 
            AND column_name = 'customer_phone'
        ) THEN
            ALTER TABLE restaurant_orders ALTER COLUMN customer_phone TYPE VARCHAR(50);
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'restaurant_orders' 
            AND column_name = 'status'
        ) THEN
            ALTER TABLE restaurant_orders ALTER COLUMN status TYPE VARCHAR(50);
        END IF;
    END IF;
END $$;

-- ============================================
-- SERVICE_BOOKINGS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_bookings') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'booking_number') THEN
            ALTER TABLE service_bookings ALTER COLUMN booking_number TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'customer_phone') THEN
            ALTER TABLE service_bookings ALTER COLUMN customer_phone TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'service_type') THEN
            ALTER TABLE service_bookings ALTER COLUMN service_type TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'service_name') THEN
            ALTER TABLE service_bookings ALTER COLUMN service_name TYPE VARCHAR(200);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'time_slot') THEN
            ALTER TABLE service_bookings ALTER COLUMN time_slot TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'duration') THEN
            ALTER TABLE service_bookings ALTER COLUMN duration TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'appointment_type') THEN
            ALTER TABLE service_bookings ALTER COLUMN appointment_type TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_bookings' AND column_name = 'status') THEN
            ALTER TABLE service_bookings ALTER COLUMN status TYPE VARCHAR(50);
        END IF;
    END IF;
END $$;

-- ============================================
-- HOTEL_RESERVATIONS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotel_reservations') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'reservation_id') THEN
            ALTER TABLE hotel_reservations ALTER COLUMN reservation_id TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'customer_phone') THEN
            ALTER TABLE hotel_reservations ALTER COLUMN customer_phone TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'room_type') THEN
            ALTER TABLE hotel_reservations ALTER COLUMN room_type TYPE VARCHAR(100);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'duration') THEN
            ALTER TABLE hotel_reservations ALTER COLUMN duration TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'status') THEN
            ALTER TABLE hotel_reservations ALTER COLUMN status TYPE VARCHAR(50);
        END IF;
        
        -- Add or update access_code column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reservations' AND column_name = 'access_code') THEN
            ALTER TABLE hotel_reservations ADD COLUMN access_code VARCHAR(100);
        ELSE
            ALTER TABLE hotel_reservations ALTER COLUMN access_code TYPE VARCHAR(100);
        END IF;
    END IF;
END $$;

-- ============================================
-- POOL_BOOKINGS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pool_bookings') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'booking_number') THEN
            ALTER TABLE pool_bookings ALTER COLUMN booking_number TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'customer_phone') THEN
            ALTER TABLE pool_bookings ALTER COLUMN customer_phone TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'time_slot') THEN
            ALTER TABLE pool_bookings ALTER COLUMN time_slot TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'status') THEN
            ALTER TABLE pool_bookings ALTER COLUMN status TYPE VARCHAR(50);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_bookings' AND column_name = 'pool_type') THEN
            ALTER TABLE pool_bookings ALTER COLUMN pool_type TYPE VARCHAR(100);
        END IF;
    END IF;
END $$;

-- ============================================
-- ACTIVITY_LOG TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_log') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'activity_type') THEN
            ALTER TABLE activity_log ALTER COLUMN activity_type TYPE VARCHAR(100);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'related_table') THEN
            ALTER TABLE activity_log ALTER COLUMN related_table TYPE VARCHAR(100);
        END IF;
    END IF;
END $$;

-- ============================================
-- PROFILES TABLE (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Update phone column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'phone'
        ) THEN
            ALTER TABLE profiles ALTER COLUMN phone TYPE VARCHAR(50);
        END IF;
        
        -- Update full_name column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'full_name'
        ) THEN
            ALTER TABLE profiles ALTER COLUMN full_name TYPE VARCHAR(200);
        END IF;
    END IF;
END $$;

-- ============================================
-- ORDERS TABLE (if exists - legacy table)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        -- Update customer_phone column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'customer_phone'
        ) THEN
            ALTER TABLE orders ALTER COLUMN customer_phone TYPE VARCHAR(50);
        END IF;
        
        -- Update status column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'status'
        ) THEN
            ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(50);
        END IF;
        
        -- Update service_type column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'service_type'
        ) THEN
            ALTER TABLE orders ALTER COLUMN service_type TYPE VARCHAR(50);
        END IF;
        
        -- Update table_number column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'table_number'
        ) THEN
            ALTER TABLE orders ALTER COLUMN table_number TYPE VARCHAR(50);
        END IF;
    END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ All VARCHAR columns have been updated successfully!';
  RAISE NOTICE 'All phone numbers: VARCHAR(50)';
  RAISE NOTICE 'All IDs/numbers: VARCHAR(50)';
  RAISE NOTICE 'All status fields: VARCHAR(50)';
  RAISE NOTICE 'All names: VARCHAR(100-200)';
  RAISE NOTICE 'This should prevent any "value too long" errors in the future.';
END $$;
