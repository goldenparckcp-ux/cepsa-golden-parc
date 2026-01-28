-- ============================================
-- FIX FINAL - SUPPRESSION DES CONTRAINTES STRICTES
-- ============================================

DO $$ 
BEGIN 

    -- 1. HOTEL_RESERVATIONS : Supprimer la contrainte de statut
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hotel_reservations_status_check') THEN 
        ALTER TABLE hotel_reservations DROP CONSTRAINT hotel_reservations_status_check; 
    END IF;

    -- Supprimer les NOT NULL (Rappel)
    BEGIN ALTER TABLE hotel_reservations ALTER COLUMN price DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE hotel_reservations ALTER COLUMN total_price DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE hotel_reservations ALTER COLUMN room_number DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE hotel_reservations ALTER COLUMN customer_phone DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE hotel_reservations ALTER COLUMN booking_number DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;


    -- 2. SERVICE_BOOKINGS : Supprimer la contrainte de statut
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_bookings_status_check') THEN 
        ALTER TABLE service_bookings DROP CONSTRAINT service_bookings_status_check; 
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_bookings_time_slot_check') THEN 
        ALTER TABLE service_bookings DROP CONSTRAINT service_bookings_time_slot_check; 
    END IF;


    -- 3. POOL_BOOKINGS : Supprimer contraintes
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pool_bookings_status_check') THEN 
        ALTER TABLE pool_bookings DROP CONSTRAINT pool_bookings_status_check; 
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pool_bookings_time_slot_check') THEN 
        ALTER TABLE pool_bookings DROP CONSTRAINT pool_bookings_time_slot_check; 
    END IF;
    
    BEGIN ALTER TABLE pool_bookings ALTER COLUMN customer_phone DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;

END $$;

NOTIFY pgrst, 'reload config';
