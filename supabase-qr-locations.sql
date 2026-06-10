-- ============================================================
-- Table: qr_locations
-- Stores admin-generated QR codes for restaurant tables,
-- pool spots, and hotel rooms.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.qr_locations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        TEXT NOT NULL CHECK (type IN ('restaurant', 'pool', 'hotel')),
    label       TEXT NOT NULL,               -- "Table 5", "Chambre 101", etc.
    token       TEXT NOT NULL UNIQUE,        -- Random 8-char token (admin-only)
    url         TEXT NOT NULL,               -- Full scan URL
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on token for fast scan lookups
CREATE INDEX IF NOT EXISTS qr_locations_token_idx ON public.qr_locations (token);

-- Index on type for admin filtering
CREATE INDEX IF NOT EXISTS qr_locations_type_idx  ON public.qr_locations (type);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_qr_locations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_qr_locations_updated_at ON public.qr_locations;
CREATE TRIGGER trg_qr_locations_updated_at
    BEFORE UPDATE ON public.qr_locations
    FOR EACH ROW EXECUTE FUNCTION update_qr_locations_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.qr_locations ENABLE ROW LEVEL SECURITY;

-- Public can READ active QR codes (needed for scan verification)
CREATE POLICY "Public can read active qr_locations"
    ON public.qr_locations FOR SELECT
    USING (is_active = TRUE);

-- Only service_role (admin API) can INSERT / UPDATE / DELETE
CREATE POLICY "Service role full access"
    ON public.qr_locations FOR ALL
    USING (auth.role() = 'service_role');
