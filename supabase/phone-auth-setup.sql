-- ============================================
-- PHONE AUTHENTICATION SETUP
-- ============================================
-- Instructions for enabling phone authentication
-- in your Supabase project
-- ============================================

/*
  STEP 1: Enable Phone Authentication in Supabase Dashboard
  ---------------------------------------------------------
  1. Go to: https://supabase.com/dashboard/project/vktqecgylkjogquhsymz/auth/providers
  2. Click on "Phone" provider
  3. Enable the "Phone" toggle
  4. Configure SMS provider (Twilio recommended for production)
  
  FOR TESTING (Development):
  - You can use Supabase's test phone numbers
  - Test phone: Any phone number
  - Test OTP: 123456 (works in development mode)
  
  FOR PRODUCTION:
  - Set up Twilio or another SMS provider
  - Add your Twilio credentials in the Phone provider settings
*/

-- ============================================
-- STEP 2: Run the Auto Profile Trigger
-- ============================================
-- This has been created in: supabase/auto-profile-trigger.sql
-- Make sure to run that script in your SQL Editor

-- ============================================
-- STEP 3: Test Phone Authentication
-- ============================================
-- Use these test credentials in development:
-- Phone: 0600000000 (or any Moroccan number)
-- OTP: 123456 (Supabase default test OTP)

-- ============================================
-- STEP 4: Verify Setup
-- ============================================
-- After running the auto-profile-trigger.sql, verify:

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- ============================================
-- STEP 5: Test Profile Creation
-- ============================================
-- After a user signs up via phone, check if profile was created:
/*
SELECT 
  p.id,
  p.full_name,
  p.wallet_balance,
  p.loyalty_tier,
  p.partial_payment_enabled,
  p.created_at,
  u.phone
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC
LIMIT 5;
*/

-- ============================================
-- TROUBLESHOOTING
-- ============================================
/*
  If profiles are not being created automatically:
  
  1. Check if the trigger is enabled:
     SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  
  2. Check for errors in Supabase logs:
     Go to: Database > Logs in your Supabase dashboard
  
  3. Manually create a profile for testing:
     INSERT INTO profiles (id, full_name, wallet_balance)
     VALUES ('user-uuid-here', 'Test User', 100.00);
  
  4. Verify RLS policies allow the trigger to insert:
     The trigger uses SECURITY DEFINER to bypass RLS
*/

-- ============================================
-- PHONE NUMBER FORMAT
-- ============================================
/*
  Supabase expects phone numbers in E.164 format:
  - Morocco: +212XXXXXXXXX
  - Example: +212600000000
  
  The login page automatically formats:
  - Input: 0600000000
  - Sent to Supabase: +212600000000
*/
