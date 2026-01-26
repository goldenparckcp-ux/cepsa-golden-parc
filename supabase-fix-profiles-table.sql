-- ============================================
-- MIGRATION: Fix profiles table for Google Auth
-- Run this FIRST in Supabase SQL Editor
-- ============================================

-- 1. Remove UNIQUE constraint from phone (Google users won't have phone initially)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;

-- 2. Make sure email and phone can be NULL
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- 3. Add email column if it doesn't exist (for older databases)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN 
        ALTER TABLE public.profiles ADD COLUMN email text; 
    END IF;
END $$;

-- 4. Add avatar_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN 
        ALTER TABLE public.profiles ADD COLUMN avatar_url text; 
    END IF;
END $$;

-- 5. Verify the structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
