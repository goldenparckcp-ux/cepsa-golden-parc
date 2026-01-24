-- ============================================
-- AUTO PROFILE CREATION TRIGGER
-- ============================================
-- This script creates a trigger that automatically
-- creates a profile in the public.profiles table
-- whenever a new user signs up via Supabase Auth
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, wallet_balance, loyalty_tier, partial_payment_enabled)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Golden Member'),
    0.00,
    'silver',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the trigger was created:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- ============================================
-- NOTES
-- ============================================
-- 1. This trigger runs automatically when a user signs up
-- 2. Default balance is set to 0.00 MAD
-- 3. Default name is 'Golden Member' (can be updated later)
-- 4. Default loyalty tier is 'silver'
-- 5. Partial payment (Arboune) is disabled by default
-- 6. The trigger uses SECURITY DEFINER to bypass RLS
-- ============================================
