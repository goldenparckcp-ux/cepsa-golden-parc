-- 🚀 PAYMENT & ARBOUN INTEGRATION SCHEMA (Stripe, PayPal, CMI)

-- 1. TRANSACTION LOGS (For Accounting)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    booking_id UUID, -- Reference to service_bookings, hotel_reservations, etc.
    booking_table TEXT, -- 'service_bookings', 'hotel_reservations', 'pool_bookings', 'orders'
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'MAD',
    gateway TEXT CHECK (gateway IN ('stripe', 'paypal', 'cmi', 'wallet')),
    gateway_reference TEXT, -- Stripe PaymentIntent ID or PayPal Capture ID
    type TEXT CHECK (type IN ('deposit', 'full_payment', 'refund', 'payout')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    metadata JSONB, -- Store full gateway response if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. ENHANCE BOOKINGS WITH FINANCIAL DATA
-- Ensure all booking tables have these columns (Repeat for all booking tables)
DO $$ 
BEGIN
    -- service_bookings
    ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
    ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;
    ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
    ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC DEFAULT 10;
    
    -- hotel_reservations
    ALTER TABLE public.hotel_reservations ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
    ALTER TABLE public.hotel_reservations ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.hotel_reservations ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
    
    -- pool_bookings
    ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
    ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
END $$;

-- 3. ENABLE RLS FOR TRANSACTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions 
    FOR SELECT USING (auth.uid() = user_id);

-- 4. WALLET AUDIT LOGS (Wallet Transactions)
-- This table already exists from previous step, ensure it has a reference to the main transaction
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES public.transactions(id);
