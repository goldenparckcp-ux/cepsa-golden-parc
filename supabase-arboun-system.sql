-- 🚀 Arboun (Partial Deposit) System Schema for Cepsa Golden Park

-- 1. UPDATE PROFILES (Ensure wallet and settings exist)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partial_payment_enabled BOOLEAN DEFAULT TRUE;

-- 2. CREATE WALLET TRANSACTIONS (If missing or to standardize)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('topup', 'payment', 'refund', 'forfeit')), -- 'forfeit' for non-refundable deposits
    status TEXT DEFAULT 'completed',
    description TEXT,
    reference_id UUID, -- ID of the related booking/order
    related_table TEXT, -- 'service_bookings', 'hotel_reservations', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. ENHANCE BOOKING TABLES WITH DEPOSIT TRACKING
-- For Service Bookings (Lavage)
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS refund_id UUID REFERENCES public.wallet_transactions(id);
-- Update status constraints if necessary
-- ALTER TABLE public.service_bookings DROP CONSTRAINT IF EXISTS service_bookings_status_check;
-- ALTER TABLE public.service_bookings ADD CONSTRAINT service_bookings_status_check 
--     CHECK (status IN ('pending_payment', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- For Pool Bookings
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE public.pool_bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- For Hotel Reservations
ALTER TABLE public.hotel_reservations ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
ALTER TABLE public.hotel_reservations ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE public.hotel_reservations ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- For Food Orders (Orders/Restaurant_Orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- 4. POLICIES (Ensure users can see their transactions)
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions 
    FOR SELECT USING (auth.uid() = user_id);
