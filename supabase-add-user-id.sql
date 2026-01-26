-- ============================================
-- ADD user_id TO ALL ORDER TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Add user_id to restaurant_orders
ALTER TABLE public.restaurant_orders 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);

-- Add user_id to service_bookings (if not exists)
ALTER TABLE public.service_bookings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);

-- Add user_id to pool_bookings (if not exists)
ALTER TABLE public.pool_bookings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);

-- Add user_id to hotel_reservations (if not exists)
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
  RAISE NOTICE 'user_id columns added successfully to all order tables!';
END $$;
