-- ============================================
-- FIX: Extend customer_phone column to accept emails
-- Run this in Supabase SQL Editor BEFORE adding user_id
-- ============================================

-- Extend customer_phone in restaurant_orders to accept emails
ALTER TABLE public.restaurant_orders 
ALTER COLUMN customer_phone TYPE text;

-- Extend customer_phone in service_bookings
ALTER TABLE public.service_bookings 
ALTER COLUMN customer_phone TYPE text;

-- Extend customer_phone in pool_bookings
ALTER TABLE public.pool_bookings 
ALTER COLUMN customer_phone TYPE text;

-- Extend customer_phone in hotel_reservations
ALTER TABLE public.hotel_reservations 
ALTER COLUMN customer_phone TYPE text;

-- Now add user_id columns
ALTER TABLE public.restaurant_orders 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);

ALTER TABLE public.service_bookings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);

ALTER TABLE public.pool_bookings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);

ALTER TABLE public.hotel_reservations 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_user_id ON public.restaurant_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_user_id ON public.service_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_pool_bookings_user_id ON public.pool_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_user_id ON public.hotel_reservations(user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Tables updated successfully! customer_phone now accepts emails and user_id columns added.';
END $$;
