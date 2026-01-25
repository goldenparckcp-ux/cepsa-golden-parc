-- Add missing columns to hotel_reservations
ALTER TABLE hotel_reservations 
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS room_number INTEGER,
ADD COLUMN IF NOT EXISTS room_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS access_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Ensure policies allow authenticated users to insert
ALTER TABLE hotel_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reservations" ON hotel_reservations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reservations" ON hotel_reservations
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
