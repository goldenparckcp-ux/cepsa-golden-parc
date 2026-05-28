const fs = require('fs');

const categories = [
    { id: "Ftour", label_fr: "Ftour (Ptit Déj)", sort_order: 1 },
    { id: "Burgers", label_fr: "Burgers & Fast Food", sort_order: 2 },
    { id: "Snacks", label_fr: "Snacks & Tacos", sort_order: 3 },
    { id: "Pizza", label_fr: "Pizza", sort_order: 4 },
    { id: "Plats", label_fr: "Plats & Beldi", sort_order: 5 },
    { id: "Salades", label_fr: "Salades & Fraîcheur", sort_order: 6 },
    { id: "Boissons", label_fr: "Jus & Café", sort_order: 7 },
    { id: "Desserts", label_fr: "Desserts", sort_order: 8 }
];

const menu = [
    {
        category: "Burgers", name: "Smash Burger Double", description: "Deux steaks hachés smashés, double cheddar, oignons caramélisés, sauce secrète maison, pain brioché toasté.", basePrice: 55, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", prepTime: "15 min", badge: "Bestseller", isFeatured: true,
        customization: {"combo":{"label":"Formule Menu","type":"radio","options":[{"id":"seul","label":"Burger Seul","price":0},{"id":"menu","label":"Menu (Frites + Boisson)","price":20}],"default":"seul"},"cuisson":{"label":"Cuisson de la viande","type":"radio","options":[{"id":"saignant","label":"Saignant"},{"id":"appoint","label":"À point"},{"id":"bien_cuit","label":"Bien cuit"}],"default":"appoint"},"sans":{"label":"Retirer des ingrédients","type":"checkbox","options":[{"id":"sans_oignon","label":"Sans oignons"},{"id":"sans_cornichon","label":"Sans cornichons"},{"id":"sans_tomate","label":"Sans tomates"},{"id":"sans_sauce","label":"Sans sauce"}]},"extras":{"label":"Suppléments gourmands","type":"checkbox","options":[{"id":"extra_steak","label":"Steak Supplémentaire","price":20},{"id":"extra_fromage","label":"Tranche de Cheddar","price":5},{"id":"bacon","label":"Bacon de dinde fumé","price":10},{"id":"jalapenos","label":"Jalapeños (Piquant)","price":5}]}}
    },
    {
        category: "Burgers", name: "Crispy Chicken Burger", description: "Blanc de poulet pané extra croustillant, salade coleslaw, cheddar fondu, sauce spicy mayo.", basePrice: 45, image: "https://images.unsplash.com/photo-1615719413546-198b25453f85?w=800", prepTime: "15 min", badge: null, isFeatured: false,
        customization: {"combo":{"label":"Formule Menu","type":"radio","options":[{"id":"seul","label":"Burger Seul","price":0},{"id":"menu","label":"Menu (Frites + Boisson)","price":20}],"default":"seul"},"spicy":{"label":"Niveau de piquant","type":"radio","options":[{"id":"normal","label":"Normal (Léger)"},{"id":"spicy","label":"Très Piquant 🔥","price":0}],"default":"normal"}}
    },
    {
        category: "Salades", name: "Salade César Poulet", description: "Laitue romaine croquante, blancs de poulet grillés, croûtons à l'ail, copeaux de parmesan, sauce César authentique.", basePrice: 40, image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800", prepTime: "10 min", badge: "Healthy", isFeatured: false,
        customization: {"sauce":{"label":"Sauce César","type":"radio","options":[{"id":"dedans","label":"Mélangée dans la salade"},{"id":"apart","label":"Sauce à part"}],"default":"apart"},"extras":{"label":"Protéines supplémentaires","type":"checkbox","options":[{"id":"extra_poulet","label":"Double Poulet","price":15},{"id":"oeuf","label":"Œuf dur","price":5},{"id":"avocat","label":"Avocat frais","price":10}]}}
    },
    {
        category: "Salades", name: "Salade Marocaine Royale", description: "Tomates, oignons, concombres, poivrons grillés, olives, thon, maïs et vinaigrette à l'huile d'olive.", basePrice: 35, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800", prepTime: "10 min", badge: null, isFeatured: false, customization: null
    },
    {
        category: "Pizza", name: "Pizza Margherita Truffée", description: "Sauce tomate San Marzano, mozzarella fior di latte, basilic frais, et un filet d'huile de truffe.", basePrice: 40, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", prepTime: "20 min", badge: null, isFeatured: false,
        customization: {"size":{"label":"Taille de la Pizza","type":"radio","options":[{"id":"moyenne","label":"Moyenne (30cm)","price":0},{"id":"mega","label":"Méga Familiale (40cm)","price":30}],"default":"moyenne"},"pate":{"label":"Type de pâte","type":"radio","options":[{"id":"fine","label":"Pâte fine italienne"},{"id":"epaisse","label":"Pâte épaisse (Pan)"},{"id":"cheesy","label":"Croûte fourrée au fromage","price":15}],"default":"fine"},"extras":{"label":"Garnitures supplémentaires","type":"checkbox","options":[{"id":"champignons","label":"Champignons frais","price":5},{"id":"poulet","label":"Poulet fumé","price":10},{"id":"viande","label":"Viande hachée","price":12},{"id":"mozzarella","label":"Double Mozzarella","price":10}]}}
    },
    {
        category: "Pizza", name: "Pizza 4 Fromages", description: "Base crème fraîche, mozzarella, gorgonzola, chèvre, emmental, cerneaux de noix.", basePrice: 50, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", prepTime: "20 min", badge: null, isFeatured: false, customization: null
    },
    {
        category: "Snacks", name: "Tacos Frenchie (Gratiné)", description: "Tacos taille XL, frites croustillantes, sauce fromagère maison, gratiné au four avec mozzarella.", basePrice: 45, image: "/image/taxos.jpeg", prepTime: "15 min", badge: null, isFeatured: false,
        customization: {"viande":{"label":"Choix Viandes (1 à 3)","type":"checkbox","options":[{"id":"poulet","label":"Poulet mariné"},{"id":"hachee","label":"Viande hachée"},{"id":"nuggets","label":"Nuggets"},{"id":"cordon","label":"Cordon Bleu"},{"id":"merguez","label":"Merguez"}]},"sauce":{"label":"Sauces internes (Max 2)","type":"checkbox","options":[{"id":"alg","label":"Algérienne"},{"id":"samurai","label":"Samurai (Piquant)"},{"id":"andalouse","label":"Andalouse"},{"id":"blanche","label":"Blanche (Ail & Fines herbes)"},{"id":"ketchup","label":"Ketchup"},{"id":"mayo","label":"Mayonnaise"}]},"extras":{"label":"Suppléments internes","type":"checkbox","options":[{"id":"extra_fromage","label":"Double Sauce Fromagère","price":5},{"id":"bacon","label":"Bacon de dinde","price":8},{"id":"oeuf","label":"Œuf","price":4}]}}
    },
    {
        category: "Snacks", name: "Panini Viande Hachée", description: "Pain ciabatta pressé à chaud, viande hachée épicée, fromage fondant.", basePrice: 25, image: "/image/panini.jpeg", prepTime: "10 min", badge: null, isFeatured: false,
        customization: {"combo":{"label":"Ajouter Frites & Boisson","type":"radio","options":[{"id":"non","label":"Non merci","price":0},{"id":"oui","label":"Oui (+15 DH)","price":15}],"default":"non"}}
    },
    {
        category: "Plats", name: "Tajine Viande aux Pruneaux", description: "Viande de veau fondante, pruneaux caramélisés, amandes grillées, sésame. Cuit au feu de bois.", basePrice: 65, image: "/image/tajin.jpeg", prepTime: "25 min", badge: null, isFeatured: true,
        customization: {"pain":{"label":"Type de pain","type":"radio","options":[{"id":"tafarnout","label":"Pain Tafarnout (Maison)"},{"id":"normal","label":"Pain Blanc de boulangerie"}],"default":"tafarnout"},"boisson":{"label":"Accompagner d'un thé ?","type":"radio","options":[{"id":"non","label":"Non merci"},{"id":"the","label":"Thé à la menthe (Barrad)","price":15}],"default":"non"}}
    },
    {
        category: "Plats", name: "Poulet Rôti (Djaj Mhamer)", description: "Poulet rôti à la marocaine avec sa sauce Dghmira, frites maison et olives.", basePrice: 40, image: "/image/djaj m7amar.jpeg", prepTime: "20 min", badge: null, isFeatured: false,
        customization: {"portion":{"label":"Portion","type":"radio","options":[{"id":"quart","label":"1/4 Poulet (Individuel)","price":0},{"id":"demi","label":"1/2 Poulet","price":30},{"id":"entier","label":"Poulet Entier (Famille)","price":80}],"default":"quart"},"sides":{"label":"Accompagnements (1 inclus)","type":"checkbox","options":[{"id":"frites","label":"Frites Maison"},{"id":"riz","label":"Riz aux légumes"},{"id":"zaalouk","label":"Zaalouk d'aubergines"}]}}
    },
    {
        category: "Plats", name: "Couscous Royal (Vendredi)", description: "Le Couscous traditionnel aux 7 légumes avec Poulet et Viande de veau.", basePrice: 50, image: "/image/couscous.jpeg", prepTime: "30 min", badge: "Spécialité", isFeatured: false,
        customization: {"lben":{"label":"Ajouter Lben (Babeurre)","type":"radio","options":[{"id":"non","label":"Sans Lben"},{"id":"oui","label":"Verre de Lben frais","price":5}],"default":"non"},"tfaya":{"label":"Tfaya (Oignons et raisins secs sucrés)","type":"radio","options":[{"id":"avec","label":"Avec Tfaya","price":10},{"id":"sans","label":"Sans Tfaya","price":0}],"default":"sans"}}
    },
    {
        category: "Ftour", name: "Omelette Khliî", description: "Œufs de ferme brouillés avec de la viande séchée marocaine (Khliî) artisanale.", basePrice: 25, image: "/image/Omelette.jpeg", prepTime: "10 min", badge: null, isFeatured: false,
        customization: {"cuisson":{"label":"Cuisson des œufs","type":"radio","options":[{"id":"baveuse","label":"Baveuse"},{"id":"bien_cuite","label":"Bien cuite"}],"default":"bien_cuite"},"fromage":{"label":"Ajouter du Fromage","type":"radio","options":[{"id":"non","label":"Sans fromage"},{"id":"vache","label":"La Vache qui rit","price":3},{"id":"edam","label":"Fromage Rouge râpé","price":5}],"default":"non"}}
    },
    {
        category: "Ftour", name: "Ftour Beldi Complet", description: "Thé, Msamen, Harcha, Huile d'olive, Miel pur, Olives noires et Omelette nature.", basePrice: 35, image: "/image/ftor complet.jpeg", prepTime: "15 min", badge: null, isFeatured: false, customization: null
    },
    {
        category: "Ftour", name: "Crêpes & Galettes Chaudes", description: "Assortiment de Baghrir, Msamen, Harcha.", basePrice: 15, image: "/image/msmn o 7rcha.jpeg", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {"accompagnement":{"label":"Accompagnements inclus","type":"checkbox","options":[{"id":"miel","label":"Miel & Beurre"},{"id":"amlou","label":"Amlou (Amandes & Argan)","price":5},{"id":"jben","label":"Jben (Fromage frais)","price":5},{"id":"nutella","label":"Nutella","price":5}]}}
    },
    {
        category: "Boissons", name: "Cocktail Jus Frais Signature", description: "Mélange pressé à froid sur demande. 100% fruits frais.", basePrice: 15, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {"base":{"label":"Base du jus","type":"radio","options":[{"id":"orange","label":"Orange"},{"id":"pomme","label":"Pomme"},{"id":"lait","label":"Lait"}],"default":"orange"},"fruits":{"label":"Fruits mixés (Max 2)","type":"checkbox","options":[{"id":"banane","label":"Banane"},{"id":"fraise","label":"Fraise","price":3},{"id":"avocat","label":"Avocat","price":5},{"id":"mangue","label":"Mangue","price":7}]},"sucre":{"label":"Préférence Sucre","type":"radio","options":[{"id":"avec","label":"Sucre Normal"},{"id":"sans","label":"Sans Sucre"}],"default":"avec"}}
    },
    {
        category: "Boissons", name: "Cafétéria Premium", description: "Café torréfié localement, thés et infusions.", basePrice: 12, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {"boisson":{"label":"Choix de la boisson","type":"radio","options":[{"id":"espresso","label":"Espresso"},{"id":"americain","label":"Café Allongé (Américain)"},{"id":"nouss","label":"Nouss Nouss (Moitié Lait, Moitié Café)"},{"id":"cappuccino","label":"Cappuccino","price":5},{"id":"chocolat","label":"Chocolat Chaud","price":8},{"id":"the","label":"Thé à la Menthe"}],"default":"espresso"}}
    },
    {
        category: "Desserts", name: "Crêpes Gourmandes", description: "Crêpe française fine préparée minute, pliée avec garniture généreuse.", basePrice: 20, image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800", prepTime: "10 min", badge: null, isFeatured: false,
        customization: {"garniture":{"label":"Nappage","type":"radio","options":[{"id":"sucre_citron","label":"Sucre & Citron"},{"id":"nutella","label":"Nutella"},{"id":"caramel","label":"Caramel Beurre Salé","price":5},{"id":"lotus","label":"Crème Speculoos Lotus","price":8}],"default":"nutella"},"fruits":{"label":"Fruits à l'intérieur","type":"checkbox","options":[{"id":"banane","label":"Rondelles de banane","price":5},{"id":"fraise","label":"Morceaux de fraises","price":7}]},"glace":{"label":"Boule de Glace","type":"radio","options":[{"id":"non","label":"Sans glace"},{"id":"vanille","label":"Vanille","price":10},{"id":"chocolat","label":"Chocolat","price":10}],"default":"non"}}
    }
];

let sql = `-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.restaurant_categories (
    id TEXT PRIMARY KEY,
    label_fr TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- 2. Create Items Table
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

-- 3. Enable RLS
ALTER TABLE public.restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_items ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Allow everyone to read)
DROP POLICY IF EXISTS "Allow public read for categories" ON public.restaurant_categories;
CREATE POLICY "Allow public read for categories" ON public.restaurant_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read for items" ON public.restaurant_items;
CREATE POLICY "Allow public read for items" ON public.restaurant_items FOR SELECT USING (true);

-- 5. TRUNCATE EXISTING DATA (New Database requested by user)
TRUNCATE TABLE public.restaurant_items CASCADE;
TRUNCATE TABLE public.restaurant_categories CASCADE;

-- 6. Insert Initial Categories
INSERT INTO public.restaurant_categories (id, label_fr, sort_order) VALUES
`;

const catVals = categories.map(c => `('${c.id}', '${c.label_fr.replace(/'/g, "''")}', ${c.sort_order})`).join(',\n');
sql += catVals + '\nON CONFLICT (id) DO NOTHING;\n\n';

sql += `-- 7. Insert Initial Items\nINSERT INTO public.restaurant_items (category_id, name_fr, description_fr, base_price, image_url, prep_time, badge, is_featured, customization_json) VALUES\n`;

const itemVals = menu.map(m => {
    const custJson = m.customization ? `'${JSON.stringify(m.customization).replace(/'/g, "''")}'::jsonb` : 'NULL';
    const badge = m.badge ? `'${m.badge.replace(/'/g, "''")}'` : 'NULL';
    return `('${m.category}', '${m.name.replace(/'/g, "''")}', '${m.description.replace(/'/g, "''")}', ${m.basePrice}, '${m.image}', '${m.prepTime}', ${badge}, ${m.isFeatured}, ${custJson})`;
}).join(',\n');

sql += itemVals + '\n;';

fs.writeFileSync('setup_restaurant.sql', sql);
console.log('setup_restaurant.sql generated!');
