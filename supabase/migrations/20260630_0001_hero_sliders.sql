-- ==========================================
-- HERO SLIDERS (Admin manageable)
-- ==========================================
create table if not exists public.hero_sliders (
  id uuid primary key default uuid_generate_v4(),
  page text not null, -- 'hotel', 'restaurant', 'pool'
  title text not null,
  subtitle text,
  badge_text text,
  cta_text text,
  image_url text not null,
  order_index int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- RLS
alter table public.hero_sliders enable row level security;
drop policy if exists "Public Usage" on public.hero_sliders;
create policy "Public Usage" on public.hero_sliders for all using (true) with check (true);

-- Insert Default Data
insert into public.hero_sliders (page, title, subtitle, badge_text, image_url, order_index) values
('hotel', 'Votre Séjour de Rêve', 'Détente et confort absolu au cœur du Golden Park', 'OFFRE SPÉCIALE', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 0),
('hotel', 'Chambres Familiales', 'Spacieuses, modernes et équipées pour toute la famille', 'ESPACE FAMILLE', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 1),
('hotel', 'Piscine & Détente', 'Accès gratuit à la piscine pour tous nos résidents', 'INCLUS DANS LE SÉJOUR', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 2),

('pool', 'Oasis de Fraîcheur', 'Plongez dans le luxe et la détente absolue', 'PISCINE GOLDEN PARK', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 0),
('pool', 'Lounge & Transats', 'Détente garantie sous le soleil avec service VIP', 'DÉTENTE ABSOLUE', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 1),
('pool', 'Activités Aquatiques', 'Pour petits et grands, un moment inoubliable', 'FUN & JEUX', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 2),

('restaurant', 'L''Art Culinaire Marocain', 'Une expérience gastronomique authentique', 'SAVEURS D''EXCEPTION', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1200&q=80', 0),
('restaurant', 'Ambiance Raffinée', 'Un cadre luxueux pour vos repas mémorables', 'ÉLÉGANCE', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 1),
('restaurant', 'Grillades & Barbecue', 'Nos viandes premium grillées à la perfection', 'SPÉCIALITÉ', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80', 2);
