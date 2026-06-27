-- Create home_promos table
CREATE TABLE IF NOT EXISTS public.home_promos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    badge_fr TEXT NOT NULL,
    badge_ar TEXT,
    title_fr TEXT NOT NULL,
    title_ar TEXT,
    desc_fr TEXT NOT NULL,
    desc_ar TEXT,
    image_url TEXT,
    link_path TEXT NOT NULL,
    gradient_class TEXT DEFAULT 'from-red-600 to-red-900',
    shadow_color TEXT DEFAULT 'rgba(220,38,38,0.5)',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.home_promos ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists
DROP POLICY IF EXISTS "Allow public read access" ON public.home_promos;

-- Create policy for public read (Anon select)
CREATE POLICY "Allow public read access" ON public.home_promos FOR SELECT USING (true);

-- Insert default promotions to avoid blank screen
INSERT INTO public.home_promos (badge_fr, badge_ar, title_fr, title_ar, desc_fr, desc_ar, image_url, link_path, gradient_class, shadow_color, sort_order, is_active)
VALUES 
('CATALOGUE 100% DIGITAL', 'كتالوج رقمي 100%', 'Comptoir Lubrifiants', 'ركن زيوت المحركات', 'Découvrez notre gamme complète d''huiles de performance.', 'اكتشف مجموعتنا الكاملة من زيوت الأداء العالي.', 'https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero.jpg', '/services/lubrifiants', 'from-red-600 to-red-900', 'rgba(220,38,38,0.5)', 1, true),
('SPÉCIAL RAMADAN', 'خاص برمضان', 'Menu Ftour', 'قائمة الفطور', 'Le Ftour beldi complet à 20 DH.', 'فطور بلدي متكامل بـ 20 درهم فقط.', 'https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/ftor_complet.jpeg', '/restaurant', 'from-amber-500 to-orange-600', 'rgba(245,158,11,0.5)', 2, true)
ON CONFLICT DO NOTHING;
