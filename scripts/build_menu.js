const fs = require('fs');

const categories = [
    { id: "FastFood", label_fr: "Fast Food", sort_order: 1 },
    { id: "Plats", label_fr: "Plats & Beldi", sort_order: 2 },
    { id: "Ftour", label_fr: "Ftour (Ptit Déj)", sort_order: 3 },
    { id: "Salades", label_fr: "Salades", sort_order: 4 },
    { id: "Desserts", label_fr: "Desserts", sort_order: 5 },
    { id: "Boissons", label_fr: "Boissons", sort_order: 6 }
];

const supplementCombo = { label: "Suppléments", type: "checkbox", options: [{ id: "frites", label: "Frites", price: 8 }, { id: "fromage", label: "Fromage", price: 3 }, { id: "oeuf", label: "Oeuf", price: 3 }, { id: "nuggets", label: "1 Nugget", price: 4 }, { id: "crabe", label: "Crabe", price: 5 }] };
const fritesCombo = { label: "Formule Menu", type: "radio", options: [{ id: "seul", label: "Seul", price: 0 }, { id: "menu", label: "Menu (Frites + Boisson)", price: 15 }], default: "seul" };

const menu = [
    // --- FAST FOOD (Consolidated Pizza, Tacos, Burgers, Sandwichs, Specialites) ---
    {
        category: "FastFood", name: "Pizza Personnalisée", description: "Créez votre pizza parfaite avec la pâte et les garnitures de votre choix.", basePrice: 20, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", prepTime: "15 min", badge: "Populaire", isFeatured: true,
        customization: {
            type: { label: "Recette", type: "radio", options: [
                { id: "marg", label: "Margerite", price: 0 },
                { id: "veg", label: "Végétarienne", price: 0 },
                { id: "viande", label: "Viande Hachée", price: 10 },
                { id: "dinde", label: "Dinde", price: 10 },
                { id: "4from", label: "4 Fromages", price: 10 },
                { id: "kabab", label: "Kabab", price: 10 },
                { id: "fruit", label: "Fruit de Mér", price: 15 },
                { id: "4saisons", label: "4 Saisons", price: 15 },
                { id: "dindefume", label: "Dinde Fumé", price: 15 }
            ], default: "marg" },
            taille: { label: "Taille", type: "radio", options: [{ id: "P", label: "Petite (P)", price: 0 }, { id: "M", label: "Moyenne (M)", price: 10 }, { id: "G", label: "Grande (G)", price: 20 }], default: "P" }
        }
    },
    {
        category: "FastFood", name: "Tacos Sur Mesure", description: "Votre Tacos avec frites et sauce fromagère maison.", basePrice: 30, image: "/image/taxos.jpeg", prepTime: "10 min", badge: "Bestseller", isFeatured: true,
        customization: {
            viande: { label: "Choix Viande", type: "radio", options: [
                { id: "viande", label: "Viande Hachée", price: 0 },
                { id: "dinde", label: "Dinde", price: 0 },
                { id: "mixte", label: "Mixte", price: 5 },
                { id: "nuggets", label: "Nuggets", price: 10 },
                { id: "fruitmer", label: "Fruit de Mer", price: 15 }
            ], default: "dinde" },
            taille: { label: "Taille du Tacos", type: "radio", options: [{ id: "M", label: "Taille M", price: 0 }, { id: "L", label: "Taille L", price: 10 }, { id: "XL", label: "Taille XL", price: 20 }], default: "M" },
            gratine: { label: "Supplément Gratiné", type: "radio", options: [{ id: "non", label: "Normal (Non Gratiné)", price: 0 }, { id: "grat_m", label: "Gratiné M", price: 5 }, { id: "grat_l", label: "Gratiné L", price: 7 }, { id: "grat_xl", label: "Gratiné XL", price: 10 }], default: "non" },
            sauce: { label: "Sauces internes (Max 2)", type: "checkbox", options: [{ id: "alg", label: "Algérienne" }, { id: "sam", label: "Samourai" }, { id: "and", label: "Andalouse" }, { id: "big", label: "Biggy" }, { id: "ketchup", label: "Ketchup" }] },
            supplements: supplementCombo
        }
    },
    {
        category: "FastFood", name: "Burger Maison", description: "Steak haché de boeuf, salade, tomate, oignons, sauce burger.", basePrice: 20, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", prepTime: "10 min", badge: null, isFeatured: false,
        customization: {
            type: { label: "Type de Burger", type: "radio", options: [
                { id: "burger", label: "Hamburger", price: 0 },
                { id: "cheese", label: "Cheese Burger", price: 5 },
                { id: "chicken", label: "Chicken Burger", price: 10 },
                { id: "american", label: "American Burger", price: 15 }
            ], default: "burger" },
            combo: fritesCombo,
            supplements: supplementCombo
        }
    },
    {
        category: "FastFood", name: "Panini Pressé", description: "Pain ciabatta, fromage fondant, garniture au choix.", basePrice: 15, image: "/image/panini.jpeg", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {
            viande: { label: "Garniture", type: "radio", options: [
                { id: "thon", label: "Thon", price: 0 },
                { id: "viande", label: "Viande Hachée", price: 5 },
                { id: "dinde", label: "Dinde", price: 5 },
                { id: "mixte", label: "Mixte", price: 10 },
                { id: "fruitmer", label: "Fruits De Mer", price: 10 },
                { id: "nuggets", label: "Nuggets", price: 10 },
                { id: "cordon", label: "Cordon Bleu", price: 10 }
            ], default: "thon" },
            combo: fritesCombo
        }
    },
    {
        category: "FastFood", name: "Sandwich Classique", description: "Baguette croustillante, frites, salade, garniture au choix.", basePrice: 10, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {
            viande: { label: "Garniture", type: "radio", options: [
                { id: "normal", label: "Normal (Sans viande)", price: 0 },
                { id: "froid", label: "Froid (Cachir/Fromage)", price: 3 },
                { id: "thon", label: "Thon", price: 5 },
                { id: "viande", label: "Viande Hachée", price: 10 },
                { id: "dinde", label: "Dinde", price: 10 },
                { id: "mixte", label: "Mixte", price: 15 },
                { id: "fruitmer", label: "Fruits De Mer", price: 15 }
            ], default: "viande" },
            combo: fritesCombo
        }
    },
    {
        category: "FastFood", name: "Sandwich Pain Maison", description: "Notre spécialité pain maison extra moelleux.", basePrice: 30, image: "https://images.unsplash.com/photo-1553909489-cd47cebeefa9?w=800", prepTime: "10 min", badge: "Signature", isFeatured: false,
        customization: {
            viande: { label: "Spécialité", type: "radio", options: [
                { id: "chiken", label: "Chiken", price: 0 },
                { id: "foud", label: "Foud Paris", price: 0 },
                { id: "tandoori", label: "Chiken Tandoori", price: 0 },
                { id: "mixparis", label: "Mix Paris", price: 0 },
                { id: "mixroyale", label: "Mix Royale", price: 0 },
                { id: "cordon", label: "Cordon Bleu", price: 0 }
            ], default: "chiken" },
            combo: fritesCombo
        }
    },
    {
        category: "FastFood", name: "Pasticcio & Lasagnes", description: "Plats au four gratinés.", basePrice: 25, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800", prepTime: "20 min", badge: "Gourmand", isFeatured: false,
        customization: {
            type: { label: "Type de Plat", type: "radio", options: [
                { id: "lasagne", label: "Lasagne", price: 0 },
                { id: "pasticcio", label: "Pasticcio (Macaronis)", price: 10 }
            ], default: "pasticcio" },
            viande: { label: "Garniture", type: "radio", options: [
                { id: "dinde", label: "Dinde", price: 0 },
                { id: "viande", label: "Viande Hachée", price: 0 },
                { id: "mixte", label: "Mixte", price: 5 },
                { id: "fruitmer", label: "Fruit de Mer", price: 10 },
                { id: "kabab", label: "Kabab", price: 10 }
            ], default: "viande" }
        }
    },
    {
        category: "FastFood", name: "Shawarma & Cheese Naan", description: "Spécialités orientales, pain libanais ou indien au fromage.", basePrice: 25, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {
            type: { label: "Type de Pain", type: "radio", options: [
                { id: "shawarma", label: "Shawarma Syrien", price: 0 },
                { id: "naan", label: "Cheese Naan", price: 10 }
            ], default: "shawarma" },
            viande: { label: "Garniture", type: "radio", options: [
                { id: "normal", label: "Poulet", price: 0 },
                { id: "viande", label: "V.Haché", price: 0 },
                { id: "mixte", label: "Mixte", price: 5 }
            ], default: "normal" },
            combo: fritesCombo
        }
    },

    // --- PLATS & BELDI ---
    {
        category: "Plats", name: "Tajine Marocain", description: "Cuit lentement sur charbon (Fekhar).", basePrice: 35, image: "/image/tajin.jpeg", prepTime: "40 min", badge: "Beldi", isFeatured: true,
        customization: {
            variant: { label: "Type de Tajine", type: "radio", options: [
                { id: "poulet_citron", label: "Poulet Citron / Dghmira", price: 0 },
                { id: "kefta", label: "Kefta Oeufs (Sauce Tomate)", price: 0 },
                { id: "legume", label: "Légumes (Végétarien)", price: -5 },
                { id: "viande_pruneau", label: "Viande Pruneaux", price: 30 }
            ], default: "poulet_citron" }
        }
    },
    {
        category: "Plats", name: "Poulet Rôti (Djaj Mhamer)", description: "Poulet rôti à la marocaine avec frites et olives.", basePrice: 40, image: "/image/djaj m7amar.jpeg", prepTime: "20 min", badge: null, isFeatured: false,
        customization: {
            portion: { label: "Portion", type: "radio", options: [
                { id: "quart", label: "1/4 Poulet (Individuel)", price: 0 },
                { id: "demi", label: "1/2 Poulet", price: 30 },
                { id: "entier", label: "Poulet Entier (Famille)", price: 80 }
            ], default: "quart" }
        }
    },
    {
        category: "Plats", name: "Couscous (Vendredi)", description: "Plat traditionnel marocain, servi uniquement le vendredi.", basePrice: 30, image: "/image/couscous.jpeg", prepTime: "30 min", badge: "Spécialité", isFeatured: false,
        customization: {
            variant: { label: "Type", type: "radio", options: [
                { id: "poulet", label: "Couscous Poulet", price: 0 },
                { id: "viande", label: "Couscous Viande", price: 20 }
            ], default: "poulet" }
        }
    },
    {
        category: "Plats", name: "Pâtes", description: "Spaghetti ou Penne servis avec votre sauce préférée.", basePrice: 30, image: "/image/les pate.jpeg", prepTime: "15 min", badge: null, isFeatured: false,
        customization: {
            sauce: { label: "Recette", type: "radio", options: [
                { id: "bolo", label: "Bolognaise", price: 0 },
                { id: "dinde", label: "Dinde Fumé & Crème Fraîche", price: 5 },
                { id: "fruitmer", label: "Fruits de Mer", price: 10 }
            ], default: "bolo" },
            type: { label: "Type de Pâtes", type: "radio", options: [{ id: "penne", label: "Penne" }, { id: "spag", label: "Spaghetti" }], default: "penne" }
        }
    },

    // --- FTOUR ---
    {
        category: "Ftour", name: "Omelette", description: "Œufs de ferme préparés à votre goût.", basePrice: 15, image: "/image/Omelette.jpeg", prepTime: "10 min", badge: null, isFeatured: false,
        customization: {
            variant: { label: "Type", type: "radio", options: [
                { id: "nature", label: "Nature", price: 0 },
                { id: "fromage", label: "Fromage", price: 5 },
                { id: "khlii", label: "Khliî (Viande séchée)", price: 10 }
            ], default: "nature" }
        }
    },
    { category: "Ftour", name: "Ftour Complet", description: "Petit déjeuner complet traditionnel.", basePrice: 35, image: "/image/ftor complet.jpeg", prepTime: "15 min", badge: null, isFeatured: false },
    {
        category: "Ftour", name: "Crêpes & Galettes Chaudes", description: "Assortiment de Baghrir, Msamen, Harcha.", basePrice: 10, image: "/image/msmn o 7rcha.jpeg", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {
            accompagnement: { label: "Accompagnements", type: "checkbox", options: [
                { id: "miel", label: "Miel & Beurre", price: 2 },
                { id: "amlou", label: "Amlou (Amandes & Argan)", price: 5 },
                { id: "nutella", label: "Nutella", price: 5 }
            ] }
        }
    },

    // --- SALADES ---
    {
        category: "Salades", name: "Salade Fraîche", description: "Légumes frais de saison.", basePrice: 25, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800", prepTime: "10 min", badge: null, isFeatured: false,
        customization: {
            type: { label: "Variété", type: "radio", options: [
                { id: "nicoise", label: "Niçoise", price: 0 },
                { id: "mexicaine", label: "Mexicaine", price: 0 },
                { id: "cesar", label: "César", price: 10 },
                { id: "paris", label: "Paris", price: 15 }
            ], default: "nicoise" }
        }
    },

    // --- BOISSONS ---
    {
        category: "Boissons", name: "Jus Frais", description: "Pressé minute, 100% fruits.", basePrice: 10, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {
            fruit: { label: "Fruit", type: "radio", options: [
                { id: "orange", label: "D'orange", price: 0 },
                { id: "citron", label: "De Citron", price: 0 },
                { id: "pomme", label: "De pomme", price: 0 },
                { id: "banane", label: "De Banane", price: 0 },
                { id: "tropical", label: "Tropical", price: 0 },
                { id: "avocat", label: "De avocat", price: 6 },
                { id: "panache", label: "Panaché (Orange)", price: 8 }
            ], default: "orange" },
            sucre: { label: "Sucre", type: "radio", options: [{ id: "avec", label: "Avec Sucre" }, { id: "sans", label: "Sans Sucre" }], default: "avec" }
        }
    },
    {
        category: "Boissons", name: "Cafétéria", description: "Boissons chaudes premium.", basePrice: 10, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800", prepTime: "5 min", badge: null, isFeatured: false,
        customization: {
            boisson: { label: "Choix", type: "radio", options: [
                { id: "cafe", label: "Café Espresso", price: 0 },
                { id: "lait", label: "Lait Chaud", price: 0 },
                { id: "nousnous", label: "Nouss Nouss", price: 0 },
                { id: "the", label: "Thé à la Menthe", price: 5 }
            ], default: "cafe" }
        }
    },
    {
        category: "Boissons", name: "Soda & Eau", description: "Boissons fraîches.", basePrice: 5, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800", prepTime: "2 min", badge: null, isFeatured: false,
        customization: {
            boisson: { label: "Choix", type: "radio", options: [
                { id: "eau_p", label: "Eau Minérale (Petite)", price: 0 },
                { id: "eau_g", label: "Eau 50 Cl", price: 3 },
                { id: "coca", label: "Soda Canette (Coca, etc.)", price: 5 }
            ], default: "eau_p" }
        }
    },

    // --- DESSERTS ---
    { category: "Desserts", name: "Salade de fruit", description: "Cocktail de fruits de saison fraîchement coupés.", basePrice: 40, image: "https://images.unsplash.com/photo-1490474418585-ba9f528d2981?w=800", prepTime: "10 min", badge: "Frais", isFeatured: true },
    { category: "Desserts", name: "Flan Amlou", description: "Flan onctueux parfumé à la pâte d'Amlou.", basePrice: 15, image: "https://images.unsplash.com/photo-1590080876477-d923a1a3debb?w=800", prepTime: "5 min", badge: "Local", isFeatured: false },
    { category: "Desserts", name: "Za3za3", description: "Cocktail avocat, fruits, crème et fruits secs.", basePrice: 25, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800", prepTime: "10 min", badge: "Énergie", isFeatured: true }
];

// 1. GENERATE menu.ts
let tsContent = `// Auto-generated full menu consolidated (Glovo Style)
export interface MenuOption {
    id: string;
    label: string;
    price?: number;
    included?: boolean;
    removable?: boolean;
}

export interface MenuCustomization {
    [key: string]: {
        label: string;
        type: "radio" | "checkbox" | "checkbox-group" | "stepper";
        required?: boolean;
        min?: number;
        max?: number;
        default?: unknown;
        unit?: string;
        options?: MenuOption[];
        freeCount?: number;
        extraPrice?: number;
        minSelection?: number;
    };
}

export interface MenuItem {
    id: number;
    category: string;
    name: string;
    description: string;
    basePrice: number;
    image: string;
    prepTime: string;
    available: boolean;
    badge?: string;
    isFeatured?: boolean;
    customizable?: boolean;
    customization?: MenuCustomization;
}

export const restaurantCategories = [
${categories.map(c => `    { id: "${c.id}", label: "${c.label_fr}" }`).join(',\n')}
];

export const COMPLETE_MENU: MenuItem[] = [
`;

menu.forEach((m, idx) => {
    tsContent += `    {
        id: ${1000 + idx},
        category: "${m.category}",
        name: "${m.name}",
        description: "${m.description}",
        basePrice: ${m.basePrice},
        image: "${m.image}",
        prepTime: "${m.prepTime}",
        available: true,
        badge: ${m.badge ? `"${m.badge}"` : "undefined"},
        isFeatured: ${m.isFeatured},
        customizable: ${m.customization ? "true" : "false"},
        customization: ${m.customization ? JSON.stringify(m.customization, null, 12).replace(/"([^"]+)":/g, '$1:') : "undefined"}
    }${idx < menu.length - 1 ? ',' : ''}\n`;
});

tsContent += `];\n`;

fs.writeFileSync('lib/types/menu.ts', tsContent);
console.log('lib/types/menu.ts generated!');

// 2. GENERATE setup_restaurant.sql
let sql = `-- 1. Create Categories Table
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

TRUNCATE TABLE public.restaurant_items CASCADE;
TRUNCATE TABLE public.restaurant_categories CASCADE;

INSERT INTO public.restaurant_categories (id, label_fr, sort_order) VALUES
`;

const catVals = categories.map(c => `('${c.id}', '${c.label_fr.replace(/'/g, "''")}', ${c.sort_order})`).join(',\n');
sql += catVals + '\nON CONFLICT (id) DO NOTHING;\n\n';

sql += `INSERT INTO public.restaurant_items (category_id, name_fr, description_fr, base_price, image_url, prep_time, badge, is_featured, customization_json) VALUES\n`;

const itemVals = menu.map(m => {
    const custJson = m.customization ? `'${JSON.stringify(m.customization).replace(/'/g, "''")}'::jsonb` : 'NULL';
    const badge = m.badge ? `'${m.badge.replace(/'/g, "''")}'` : 'NULL';
    return `('${m.category}', '${m.name.replace(/'/g, "''")}', '${m.description.replace(/'/g, "''")}', ${m.basePrice}, '${m.image}', '${m.prepTime}', ${badge}, ${m.isFeatured}, ${custJson})`;
}).join(',\n');

sql += itemVals + '\n;';

fs.writeFileSync('setup_restaurant.sql', sql);
console.log('setup_restaurant.sql generated!');
