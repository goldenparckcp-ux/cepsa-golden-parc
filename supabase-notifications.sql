-- CEPSA GOLDEN PARK - NOTIFICATIONS & DELAY SYNC SCHEMA
-- Run this script in the Supabase SQL Editor

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT, -- Supabase auth user_id or customer_phone or 'global'
    customer_phone TEXT,
    type VARCHAR(30) NOT NULL CHECK (type IN ('promo', 'personal', 'cancellation_warning', 'arrival_check')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    booking_id TEXT,
    booking_table TEXT,
    is_read BOOLEAN DEFAULT false,
    action_type TEXT DEFAULT 'none', -- 'none', 'cancel_prompt', 'delay_prompt', 'link'
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_phone ON public.notifications(customer_phone);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS and add public access policy
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public notifications access" ON public.notifications FOR ALL USING (true);

-- 2. Add Delay Tracking & Notification Flags to Booking Tables
ALTER TABLE public.restaurant_orders 
    ADD COLUMN IF NOT EXISTS delay_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_arrival_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS notified_cancel_50m BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS notified_arrival_30m BOOLEAN DEFAULT false;

ALTER TABLE public.hotel_reservations 
    ADD COLUMN IF NOT EXISTS delay_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_arrival_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS notified_cancel_50m BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS notified_arrival_30m BOOLEAN DEFAULT false;

ALTER TABLE public.pool_bookings 
    ADD COLUMN IF NOT EXISTS delay_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_arrival_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS notified_cancel_50m BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS notified_arrival_30m BOOLEAN DEFAULT false;

ALTER TABLE public.service_bookings 
    ADD COLUMN IF NOT EXISTS delay_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_arrival_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS notified_cancel_50m BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS notified_arrival_30m BOOLEAN DEFAULT false;
