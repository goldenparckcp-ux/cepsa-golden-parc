const { Client } = require('pg');

const sql = `
CREATE TABLE IF NOT EXISTS public.restaurant_categories (
    id TEXT PRIMARY KEY,
    label_fr TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.restaurant_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT REFERENCES public.restaurant_categories(id),
    name_fr TEXT NOT NULL,
    description_fr TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    prep_time TEXT,
    is_available BOOLEAN DEFAULT true,
    badge TEXT,
    is_featured BOOLEAN DEFAULT false,
    customizable BOOLEAN DEFAULT false,
    customization_json JSONB
);

ALTER TABLE public.restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for categories" ON public.restaurant_categories;
CREATE POLICY "Allow public read for categories" ON public.restaurant_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read for items" ON public.restaurant_items;
CREATE POLICY "Allow public read for items" ON public.restaurant_items FOR SELECT USING (true);

INSERT INTO public.restaurant_categories (id, label_fr, sort_order) VALUES
('Ftour', 'Ftour (Ptit Déj)', 1),
('Snacks', 'Snacks & Pizza', 2),
('Plats', 'Plats & Beldi', 3),
('Boissons', 'Jus & Café', 4),
('Desserts', 'Desserts', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.restaurant_items (category_id, name_fr, description_fr, base_price, image_url, prep_time, customization_json) VALUES
('Ftour', 'Omelette', 'Œufs frais préparés à votre goût.', 15.00, '/image/Omelette.jpeg', '10 min', '{"variant": {"type": "radio", "label": "Type d''Omelette", "default": "nature", "options": [{"id": "nature", "price": 0, "label": "Omelette Nature"}, {"id": "fromage", "price": 3, "label": "Omelette Fromage (+3 DH)"}, {"id": "khlii", "price": 7, "label": "Omelette Khliaa (+7 DH)"}]}}'::jsonb),
('Ftour', 'Ftour Complet', 'Petit déjeuner complet traditionnel.', 20.00, '/image/ftor complet.jpeg', '15 min', NULL),
('Ftour', 'Crêpes & Galettes (Msamen/Harcha)', 'Spécialités marocaines chaudes.', 2.00, '/image/msmn o 7rcha.jpeg', '5 min', '{"variant": {"type": "radio", "label": "Choix", "default": "msamen", "options": [{"id": "baghrir", "price": 0, "label": "Baghrir"}, {"id": "msamen", "price": 0, "label": "Msamen"}, {"id": "harcha", "price": 0, "label": "Harcha"}, {"id": "toast", "price": 13, "label": "Toast Grillé (+13 DH)"}]}}'::jsonb),
('Ftour', 'Raib / Mhalabia / Flan', 'Desserts lactés frais.', 6.00, '/image/flo.jpeg', '0 min', '{"variant": {"type": "radio", "label": "Choix", "default": "mhalabia", "options": [{"id": "mhalabia", "price": 0, "label": "Mhalabia"}, {"id": "flan", "price": 4, "label": "Flan Royal (+4 DH)"}, {"id": "panna", "price": 9, "label": "Panna Cotta (+9 DH)"}, {"id": "raib", "price": 9, "label": "Raib (+9 DH)"}]}}'::jsonb),
('Snacks', 'Tacos', 'Le fameux Tacos servi avec frites.', 30.00, '/image/taxos.jpeg', '15 min', '{"variant": {"type": "radio", "label": "Choix Viande", "default": "poulet", "options": [{"id": "poulet", "price": 0, "label": "Poulet / Dinde"}, {"id": "hachee", "price": 5, "label": "Viande Hachée (+5 DH)"}, {"id": "mix", "price": 10, "label": "Mixte (Poulet + Viande) (+10 DH)"}, {"id": "nuggets", "price": 0, "label": "Tacos Nuggets"}]}}'::jsonb),
('Snacks', 'Panini', 'Pain croustillant servi chaud.', 20.00, '/image/panini.jpeg', '10 min', '{"variant": {"type": "radio", "label": "Choix", "default": "fromage", "options": [{"id": "fromage", "price": 0, "label": "Fromage"}, {"id": "poulet", "price": 5, "label": "Poulet (+5 DH)"}, {"id": "viande", "price": 5, "label": "Viande Hachée (+5 DH)"}, {"id": "thon", "price": 5, "label": "Thon (+5 DH)"}]}}'::jsonb),
('Snacks', 'Pizza', 'Pâte fine maison et mozzarella.', 20.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', '20 min', '{"size": {"type": "radio", "label": "Taille", "default": "s", "options": [{"id": "s", "price": 0, "label": "Individuelle"}, {"id": "l", "price": 30, "label": "Familiale (Grand Format)"}]}, "variant": {"type": "radio", "label": "Choix", "default": "marg", "options": [{"id": "marg", "price": 0, "label": "Margherita (20 DH)"}, {"id": "veg", "price": 5, "label": "Végétarienne (25 DH)"}, {"id": "thon", "price": 5, "label": "Thon (25 DH)"}, {"id": "poulet", "price": 10, "label": "Poulet (30 DH)"}, {"id": "bolo", "price": 15, "label": "Bolognaise (35 DH)"}, {"id": "mix", "price": 15, "label": "Mixte (35 DH)"}, {"id": "mer", "price": 15, "label": "Fruits de Mer (35 DH)"}]}}'::jsonb),
('Plats', 'Couscous (Vendredi)', 'Plat traditionnel marocain, servi uniquement le vendredi.', 30.00, '/image/couscous.jpeg', '30 min', '{"variant": {"type": "radio", "label": "Type", "default": "poulet", "options": [{"id": "poulet", "price": 0, "label": "Couscous Poulet"}, {"id": "viande", "price": 15, "label": "Couscous Viande (+15 DH)"}]}}'::jsonb),
('Plats', 'Pâtes', 'Pâtes italiennes fraîches, sauce maison.', 20.00, '/image/les pate.jpeg', '20 min', '{"variant": {"type": "radio", "label": "Sauce", "default": "tomate", "options": [{"id": "tomate", "price": 5, "label": "Sauce Tomate (25 DH)"}, {"id": "bolo", "price": 10, "label": "Bolognaise (30 DH)"}, {"id": "poulet", "price": 15, "label": "Poulet Champignon (35 DH)"}, {"id": "carbo", "price": 5, "label": "Carbonara (25 DH)"}]}}'::jsonb),
('Plats', 'Tajine Marocain', 'Cuit lentement sur charbon (Fekhar).', 35.00, '/image/tajin.jpeg', '40 min', '{"variant": {"type": "radio", "label": "Type de Tajine", "default": "poulet_citron", "options": [{"id": "poulet_citron", "price": 0, "label": "Poulet Citron / Dghmira"}, {"id": "kefta", "price": 0, "label": "Kefta Oeufs (Sauce Tomate)"}, {"id": "legume", "price": -5, "label": "Légumes (Végétarien) -5 DH"}, {"id": "viande_pruneau", "price": 15, "label": "Viande Pruneaux (Barkouk) +15 DH"}]}}'::jsonb),
('Plats', 'Poulet Rôti (Djaj Mhamer)', 'Poulet rôti à la marocaine avec frites et olives.', 40.00, '/image/djaj m7amar.jpeg', '20 min', '{"portion": {"type": "radio", "label": "Portion", "default": "quart", "options": [{"id": "quart", "price": 0, "label": "1/4 Poulet (Individuel)"}, {"id": "demi", "price": 30, "label": "1/2 Poulet (+30 DH)"}, {"id": "entier", "price": 80, "label": "Poulet Entier (Famille) (+80 DH)"}]}}'::jsonb),
('Boissons', 'Jus Frais', 'Fruits frais pressés minute.', 10.00, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800', '5 min', '{"sugar": {"type": "radio", "label": "Préférence Sucre", "default": "avec", "options": [{"id": "avec", "label": "Avec Sucre (Normal)"}, {"id": "sans", "label": "Sans Sucre (Naturel)"}, {"id": "peu", "label": "Un peu de sucre"}]}, "variant": {"type": "radio", "label": "Saveur", "default": "orange", "options": [{"id": "orange", "price": 3, "label": "Orange (13 DH)"}, {"id": "banane", "price": 3, "label": "Jus de Banane (13 DH)"}, {"id": "pomme", "price": 3, "label": "Jus de Pomme (13 DH)"}, {"id": "citron", "price": 3, "label": "Jus de Citron (13 DH)"}, {"id": "fraise", "price": 5, "label": "Jus de Fraise (15 DH)"}, {"id": "avocat", "price": 7, "label": "Jus d''Avocat (17 DH)"}, {"id": "avocat_sec", "price": 10, "label": "Avocat + Fruits Secs (20 DH)"}, {"id": "panache", "price": 5, "label": "Panaché (15 DH)"}, {"id": "dragon", "price": 20, "label": "Jus de Dragon (30 DH)"}, {"id": "peche", "price": 5, "label": "Jus de Pêche (15 DH)"}]}}'::jsonb),
('Boissons', 'Cafétéria', 'Boissons chaudes premium.', 9.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', '5 min', '{"sugar": {"type": "radio", "label": "Sucre", "default": "normal", "options": [{"id": "normal", "label": "Sucre Normal"}, {"id": "sans", "label": "Sans Sucre"}, {"id": "apart", "label": "Sucre à part"}]}, "variant": {"type": "radio", "label": "Choix", "default": "cafe", "options": [{"id": "cafe", "price": 0, "label": "Café (9 DH)"}, {"id": "lait", "price": 0, "label": "Lait Chaud (9 DH)"}, {"id": "nousnous", "price": 0, "label": "Nouss Nouss (9 DH)"}]}}'::jsonb),
('Boissons', 'Thé Marocain (Barrad)', 'Thé traditionnel servi avec herbes fraîches.', 15.00, '/image/Tea.jpeg', '5 min', '{"sugar": {"type": "radio", "label": "Hlawa (Sucre)", "default": "normal", "options": [{"id": "normal", "label": "Hlou (Normal)"}, {"id": "medium", "label": "N9ess (Moins sucré)"}, {"id": "messous", "label": "Messous (Sans Sucre)"}, {"id": "apart", "label": "Sucre à part"}]}, "flavor": {"type": "radio", "label": "Nessma (Choix)", "default": "menthe", "options": [{"id": "menthe", "label": "Na3na3 (Menthe)"}, {"id": "chiba", "label": "Chiba (Absinthe)"}, {"id": "fliyo", "label": "Fliyo"}, {"id": "lwiza", "label": "Lwiza (Verveine)"}, {"id": "mansour", "label": "Ssalmia"}, {"id": "mkhallat", "label": "Mkhallat (Mélange)"}]}}'::jsonb),
('Desserts', 'Les Crêpes Sucrées', 'Gourmandise faite maison.', 10.00, 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800', '10 min', '{"variant": {"type": "radio", "label": "Garniture", "default": "sucre", "options": [{"id": "sucre", "price": 0, "label": "Sucre (10 DH)"}, {"id": "miel", "price": 0, "label": "Miel (10 DH)"}, {"id": "amlou", "price": 2, "label": "Amlou (12 DH)"}, {"id": "nutella", "price": 5, "label": "Nutella (15 DH)"}, {"id": "nutella_banane", "price": 10, "label": "Nutella Banane (20 DH)"}]}}'::jsonb)
ON CONFLICT DO NOTHING;
`;

try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
} catch (err) {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const client = new Client({
    connectionString
});

client.connect()
    .then(() => client.query(sql))
    .then(() => {
        console.log("Database initialized successfully!");
        client.end();
    })
    .catch(err => {
        console.error("Error initializing database:", err);
        client.end();
    });
