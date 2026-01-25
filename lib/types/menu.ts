
// High-quality photos from Unsplash
export interface MenuOption {
    id: string;
    label: string;
    price?: number;
    included?: boolean;
    removable?: boolean; // Can be removed if included
}

export interface MenuCustomization {
    [key: string]: {
        label: string;
        type: "radio" | "checkbox" | "checkbox-group" | "stepper";
        required?: boolean;
        min?: number;
        max?: number;
        default?: any;
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

export const COMPLETE_MENU: MenuItem[] = [
    // ==========================================
    // 🍳 FTOUR MAROCAIN (Breakfast)
    // ==========================================
    {
        id: 101,
        category: "Ftour",
        name: "Omelette",
        description: "Œufs frais préparés à votre goût.",
        basePrice: 15,
        image: "/image/Omelette.jpeg",
        prepTime: "10 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Type d'Omelette",
                type: "radio",
                options: [
                    { id: "nature", label: "Omelette Nature", price: 0 },
                    { id: "fromage", label: "Omelette Fromage (+3 DH)", price: 3 },
                    { id: "khlii", label: "Omelette Khliaa (+7 DH)", price: 7 }
                ],
                default: "nature"
            }
        }
    },
    {
        id: 102,
        category: "Ftour",
        name: "Ftour Complet",
        description: "Petit déjeuner complet traditionnel.",
        basePrice: 20,
        image: "/image/ftor complet.jpeg",
        prepTime: "15 min",
        available: true
    },
    {
        id: 103,
        category: "Ftour",
        name: "Crêpes & Galettes (Msamen/Harcha)",
        description: "Spécialités marocaines chaudes.",
        basePrice: 2,
        image: "/image/msmn o 7rcha.jpeg",
        prepTime: "5 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix",
                type: "radio",
                options: [
                    { id: "baghrir", label: "Baghrir", price: 0 },
                    { id: "msamen", label: "Msamen", price: 0 },
                    { id: "harcha", label: "Harcha", price: 0 },
                    { id: "toast", label: "Toast Grillé (+13 DH)", price: 13 }
                ],
                default: "msamen"
            }
        }
    },
    {
        id: 104,
        category: "Ftour",
        name: "Raib / Mhalabia / Flan",
        description: "Desserts lactés frais.",
        basePrice: 6,
        image: "/image/flo.jpeg",
        prepTime: "0 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix",
                type: "radio",
                options: [
                    { id: "mhalabia", label: "Mhalabia", price: 0 },
                    { id: "flan", label: "Flan Royal (+4 DH)", price: 4 },
                    { id: "panna", label: "Panna Cotta (+9 DH)", price: 9 },
                    { id: "raib", label: "Raib (+9 DH)", price: 9 }
                ],
                default: "mhalabia"
            }
        }
    },

    // ==========================================
    // 🌮 SNACKS (Tacos, Panini)
    // ==========================================
    {
        id: 201,
        category: "Snacks",
        name: "Tacos",
        description: "Le fameux Tacos servi avec frites.",
        basePrice: 30,
        image: "/image/taxos.jpeg",
        prepTime: "15 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix Viande",
                type: "radio",
                options: [
                    { id: "poulet", label: "Poulet / Dinde", price: 0 },
                    { id: "hachee", label: "Viande Hachée (+5 DH)", price: 5 },
                    { id: "mix", label: "Mixte (Poulet + Viande) (+10 DH)", price: 10 },
                    { id: "nuggets", label: "Tacos Nuggets", price: 0 }
                ],
                default: "poulet"
            },
            sauce: {
                label: "Sauces (Max 2)",
                type: "checkbox",
                freeCount: 2,
                extraPrice: 0,
                options: [
                    { id: "alg", label: "Algérienne" },
                    { id: "biggy", label: "Biggy" },
                    { id: "samurai", label: "Samurai" },
                    { id: "andalouse", label: "Andalouse" },
                    { id: "blanche", label: "Blanche" },
                    { id: "ketchup", label: "Ketchup" },
                    { id: "mayo", label: "Mayonnaise" }
                ]
            }
        }
    },
    {
        id: 202,
        category: "Snacks",
        name: "Panini",
        description: "Pain croustillant servi chaud.",
        basePrice: 20,
        image: "/image/panini.jpeg",
        prepTime: "10 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix",
                type: "radio",
                options: [
                    { id: "fromage", label: "Fromage", price: 0 },
                    { id: "poulet", label: "Poulet (+5 DH)", price: 5 },
                    { id: "viande", label: "Viande Hachée (+5 DH)", price: 5 },
                    { id: "thon", label: "Thon (+5 DH)", price: 5 }
                ],
                default: "fromage"
            }
        }
    },

    // ==========================================
    // 🍝 PLATS (Couscous, Pâtes)
    // ==========================================
    {
        id: 301,
        category: "Plats",
        name: "Couscous (Vendredi)",
        description: "Plat traditionnel marocain, servi uniquement le vendredi.",
        basePrice: 30,
        image: "/image/couscous.jpeg",
        prepTime: "30 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Type",
                type: "radio",
                options: [
                    { id: "poulet", label: "Couscous Poulet", price: 0 },
                    { id: "viande", label: "Couscous Viande (+15 DH)", price: 15 }
                ],
                default: "poulet"
            }
        }
    },
    {
        id: 302,
        category: "Plats",
        name: "Pâtes",
        description: "Pâtes italiennes fraîches, sauce maison.",
        basePrice: 20,
        image: "/image/les pate.jpeg",
        prepTime: "20 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Sauce",
                type: "radio",
                options: [
                    { id: "tomate", label: "Sauce Tomate (25 DH)", price: 5 },
                    { id: "bolo", label: "Bolognaise (30 DH)", price: 10 },
                    { id: "poulet", label: "Poulet Champignon (35 DH)", price: 15 },
                    { id: "carbo", label: "Carbonara (25 DH)", price: 5 }
                ],
                default: "tomate"
            }
        }
    },

    // ==========================================
    // 🍕 PIZZA
    // ==========================================
    {
        id: 401,
        category: "Snacks",
        name: "Pizza",
        description: "Pâte fine maison et mozzarella.",
        basePrice: 20,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
        prepTime: "20 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix",
                type: "radio",
                options: [
                    { id: "marg", label: "Margherita (20 DH)", price: 0 },
                    { id: "veg", label: "Végétarienne (25 DH)", price: 5 },
                    { id: "thon", label: "Thon (25 DH)", price: 5 },
                    { id: "poulet", label: "Poulet (30 DH)", price: 10 },
                    { id: "bolo", label: "Bolognaise (35 DH)", price: 15 },
                    { id: "mix", label: "Mixte (35 DH)", price: 15 },
                    { id: "mer", label: "Fruits de Mer (35 DH)", price: 15 }
                ],
                default: "marg"
            },
            size: {
                label: "Taille",
                type: "radio",
                options: [
                    { id: "s", label: "Individuelle", price: 0 },
                    { id: "l", label: "Familiale (Grand Format)", price: 30 }
                ],
                default: "s"
            }
        }
    },

    // ==========================================
    // 🥘 BELDI & PLATS TRADITIONNELS
    // ==========================================
    {
        id: 303,
        category: "Plats",
        name: "Tajine Marocain",
        description: "Cuit lentement sur charbon (Fekhar).",
        basePrice: 35,
        image: "/image/tajin.jpeg",
        prepTime: "40 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Type de Tajine",
                type: "radio",
                options: [
                    { id: "poulet_citron", label: "Poulet Citron / Dghmira", price: 0 },
                    { id: "kefta", label: "Kefta Oeufs (Sauce Tomate)", price: 0 },
                    { id: "legume", label: "Légumes (Végétarien) -5 DH", price: -5 },
                    { id: "viande_pruneau", label: "Viande Pruneaux (Barkouk) +15 DH", price: 15 }
                ],
                default: "poulet_citron"
            }
        }
    },
    {
        id: 304,
        category: "Plats",
        name: "Poulet Rôti (Djaj Mhamer)",
        description: "Poulet rôti à la marocaine avec frites et olives.",
        basePrice: 40,
        image: "/image/djaj m7amar.jpeg",
        prepTime: "20 min",
        available: true,
        customizable: true,
        customization: {
            portion: {
                label: "Portion",
                type: "radio",
                options: [
                    { id: "quart", label: "1/4 Poulet (Individuel)", price: 0 },
                    { id: "demi", label: "1/2 Poulet (+30 DH)", price: 30 },
                    { id: "entier", label: "Poulet Entier (Famille) (+80 DH)", price: 80 }
                ],
                default: "quart"
            },
            sides: {
                label: "Accompagnement",
                type: "checkbox",
                freeCount: 1,
                extraPrice: 10,
                options: [
                    { id: "frites", label: "Frites Maison" },
                    { id: "riz", label: "Riz" },
                    { id: "salade", label: "Petite Salade" },
                    { id: "zaalouk", label: "Zaalouk / Taktouka" }
                ]
            }
        }
    },

    // ==========================================
    // 🍹 JUS & DESSERTS
    // ==========================================
    {
        id: 501,
        category: "Boissons",
        name: "Jus Frais",
        description: "Fruits frais pressés minute.",
        basePrice: 10, // Lowest price (Orange)
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800",
        prepTime: "5 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Saveur",
                type: "radio",
                options: [
                    { id: "orange", label: "Orange (13 DH)", price: 3 },
                    { id: "banane", label: "Jus de Banane (13 DH)", price: 3 },
                    { id: "pomme", label: "Jus de Pomme (13 DH)", price: 3 },
                    { id: "citron", label: "Jus de Citron (13 DH)", price: 3 },
                    { id: "fraise", label: "Jus de Fraise (15 DH)", price: 5 },
                    { id: "avocat", label: "Jus d'Avocat (17 DH)", price: 7 },
                    { id: "avocat_sec", label: "Avocat + Fruits Secs (20 DH)", price: 10 },
                    { id: "panache", label: "Panaché (15 DH)", price: 5 },
                    { id: "dragon", label: "Jus de Dragon (30 DH)", price: 20 },
                    { id: "peche", label: "Jus de Pêche (15 DH)", price: 5 }
                ],
                default: "orange"
            },
            sugar: {
                label: "Préférence Sucre",
                type: "radio",
                options: [
                    { id: "avec", label: "Avec Sucre (Normal)" },
                    { id: "sans", label: "Sans Sucre (Naturel)" },
                    { id: "peu", label: "Un peu de sucre" }
                ],
                default: "avec"
            }
        }
    },
    {
        id: 502,
        category: "Desserts",
        name: "Les Crêpes Sucrées",
        description: "Gourmandise faite maison.",
        basePrice: 10,
        image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800",
        prepTime: "10 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Garniture",
                type: "radio",
                options: [
                    { id: "sucre", label: "Sucre (10 DH)", price: 0 },
                    { id: "miel", label: "Miel (10 DH)", price: 0 },
                    { id: "amlou", label: "Amlou (12 DH)", price: 2 },
                    { id: "nutella", label: "Nutella (15 DH)", price: 5 },
                    { id: "nutella_banane", label: "Nutella Banane (20 DH)", price: 10 }
                ],
                default: "sucre"
            }
        }
    },

    // ==========================================
    // ☕ BOISSONS CHAUDES
    // ==========================================
    {
        id: 601,
        category: "Boissons",
        name: "Cafétéria",
        description: "Boissons chaudes premium.",
        basePrice: 9,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
        prepTime: "5 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix",
                type: "radio",
                options: [
                    { id: "cafe", label: "Café (9 DH)", price: 0 },
                    { id: "lait", label: "Lait Chaud (9 DH)", price: 0 },
                    { id: "nousnous", label: "Nouss Nouss (9 DH)", price: 0 }
                ],
                default: "cafe"
            },
            sugar: {
                label: "Sucre",
                type: "radio",
                options: [
                    { id: "normal", label: "Sucre Normal" },
                    { id: "sans", label: "Sans Sucre" },
                    { id: "apart", label: "Sucre à part" }
                ],
                default: "normal"
            }
        }
    },
    {
        id: 602,
        category: "Boissons",
        name: "Thé Marocain (Barrad)",
        description: "Thé traditionnel servi avec herbes fraîches.",
        basePrice: 15,
        image: "/image/Tea.jpeg",
        prepTime: "5 min",
        available: true,
        customizable: true,
        customization: {
            flavor: {
                label: "Nessma (Choix)",
                type: "radio",
                options: [
                    { id: "menthe", label: "Na3na3 (Menthe)" },
                    { id: "chiba", label: "Chiba (Absinthe)" },
                    { id: "fliyo", label: "Fliyo" },
                    { id: "lwiza", label: "Lwiza (Verveine)" },
                    { id: "mansour", label: "Ssalmia" },
                    { id: "mkhallat", label: "Mkhallat (Mélange)" }
                ],
                default: "menthe"
            },
            sugar: {
                label: "Hlawa (Sucre)",
                type: "radio",
                options: [
                    { id: "normal", label: "Hlou (Normal)" },
                    { id: "medium", label: "N9ess (Moins sucré)" },
                    { id: "messous", label: "Messous (Sans Sucre)" },
                    { id: "apart", label: "Sucre à part" }
                ],
                default: "normal"
            }
        }
    }
];

export const restaurantCategories = [
    { id: "all", label: "Tout" },
    { id: "Ftour", label: "Ftour (Ptit Déj)" },
    { id: "Snacks", label: "Snacks & Pizza" },
    { id: "Plats", label: "Plats & Beldi" },
    { id: "Boissons", label: "Jus & Café" },
    { id: "Desserts", label: "Desserts" }
];
