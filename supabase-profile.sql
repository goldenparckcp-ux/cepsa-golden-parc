-- Add email column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN 
        ALTER TABLE public.profiles ADD COLUMN email text; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN 
        ALTER TABLE public.profiles ADD COLUMN avatar_url text; 
    END IF;
END $$;
