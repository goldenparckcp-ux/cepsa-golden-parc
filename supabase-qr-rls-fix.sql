-- Fix RLS: Allow admin (anon client) to INSERT / UPDATE / DELETE qr_locations
-- The admin panel is already protected by PIN code

CREATE POLICY "Anon can insert qr_locations"
    ON public.qr_locations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anon can update qr_locations"
    ON public.qr_locations FOR UPDATE
    USING (true);

CREATE POLICY "Anon can delete qr_locations"
    ON public.qr_locations FOR DELETE
    USING (true);
