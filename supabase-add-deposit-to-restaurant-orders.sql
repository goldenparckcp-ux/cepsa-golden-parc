-- 🚀 ADD DEPOSIT COLUMNS TO RESTAURANT_ORDERS TABLE
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/vktqecgylkjogquhsymz/sql

DO $$ 
BEGIN
    -- 1. Add deposit columns to restaurant_orders if they don't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_orders' AND column_name = 'deposit_amount') THEN
            ALTER TABLE public.restaurant_orders ADD COLUMN deposit_amount NUMERIC DEFAULT 0;
            RAISE NOTICE 'Added deposit_amount column';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_orders' AND column_name = 'deposit_paid') THEN
            ALTER TABLE public.restaurant_orders ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added deposit_paid column';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_orders' AND column_name = 'payment_intent_id') THEN
            ALTER TABLE public.restaurant_orders ADD COLUMN payment_intent_id TEXT;
            RAISE NOTICE 'Added payment_intent_id column';
        END IF;
    END IF;
END $$;
