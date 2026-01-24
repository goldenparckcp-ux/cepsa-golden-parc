
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
    // 🌮 FAST FOOD & SNACKS (Grouped)
    // ==========================================
    {
        id: 301,
        category: "Snacks",
        name: "Tacos",
        description: "Lye Tacos avec sauce fromagère maison.",
        basePrice: 30,
        image: "https://images.unsplash.com/photo-1625937286074-98e98ce99dd6?w=800",
        prepTime: "15 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix Viande",
                type: "radio",
                options: [
                    { id: "poulet", label: "Poulet / Dinde", price: 0 },
                    { id: "hachee", label: "Viande Hachée", price: 5 },
                    { id: "mixte", label: "Mixte (Poulet + Viande)", price: 10 },
                    { id: "nuggets", label: "Tacos Nuggets", price: 0 }
                ],
                default: "poulet"
            },
            sauce: {
                label: "Sauces (Max 2)",
                type: "checkbox",
                freeCount: 2,
                extraPrice: 5,
                options: [
                    { id: "alg", label: "Algérienne" },
                    { id: "biggy", label: "Biggy" },
                    { id: "samurai", label: "Samurai" },
                    { id: "andalouse", label: "Andalouse" },
                    { id: "blanche", label: "Blanche" }
                ]
            }
        }
    },
    {
        id: 302,
        category: "Snacks",
        name: "Panini",
        description: "Pain croustillant servi chaud.",
        basePrice: 20,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
        prepTime: "10 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix",
                type: "radio",
                options: [
                    { id: "fromage", label: "Fromage", price: 0 },
                    { id: "poulet", label: "Poulet", price: 5 },
                    { id: "viande", label: "Viande Hachée", price: 5 },
                    { id: "thon", label: "Thon", price: 5 }
                ],
                default: "fromage"
            }
        }
    },
    {
        id: 303,
        category: "Snacks",
        name: "Pizza",
        description: "Pâte maison et mozzarella fraîche.",
        basePrice: 20,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
        prepTime: "20 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Choix Pizza",
                type: "radio",
                options: [
                    { id: "marg", label: "Margherita", price: 0 },
                    { id: "veg", label: "Végétarienne", price: 5 },
                    { id: "thon", label: "Thon", price: 5 },
                    { id: "poulet", label: "Poulet", price: 10 },
                    { id: "bolo", label: "Bolognaise", price: 15 },
                    { id: "mix", label: "Mixte", price: 15 },
                    { id: "mer", label: "Fruits de Mer", price: 30 }
                ],
                default: "marg"
            },
            size: {
                label: "Taille",
                type: "radio",
                options: [
                    { id: "s", label: "Individuelle", price: 0 },
                    { id: "l", label: "Familiale (+30 DH)", price: 30 }
                ],
                default: "s"
            }
        }
    },

    // ==========================================
    // ☕ MACHINE À CAFÉ & BOISSONS CHAUDES
    // ==========================================
    {
        id: 401,
        category: "Café",
        name: "Expresso (Grain)",
        description: "Café en grains fraîchement moulu.",
        basePrice: 10,
        image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800",
        prepTime: "2 min",
        available: true,
        customizable: true,
        customization: {
            intensity: {
                label: "Intensité",
                type: "radio",
                options: [
                    { id: "court", label: "Court (Serré)" },
                    { id: "long", label: "Long (Allongé)" }
                ],
                default: "court"
            },
            sugar: { label: "Sucre", type: "stepper", min: 0, max: 4, default: 0 }
        }
    },
    {
        id: 402,
        category: "Café",
        name: "Macchiato / Noisette",
        description: "Expresso avec une tache de lait.",
        basePrice: 12,
        image: "https://images.unsplash.com/photo-1485808191679-5f8c7c860695?w=800",
        prepTime: "3 min",
        available: true,
        customizable: true,
        customization: {
            sugar: { label: "Sucre", type: "stepper", min: 0, max: 4, default: 1 }
        }
    },
    {
        id: 403,
        category: "Café",
        name: "Cappuccino / Moccaccino",
        description: "Au lait mousseux ou chocolaté.",
        basePrice: 15,
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800",
        prepTime: "4 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Type",
                type: "radio",
                options: [
                    { id: "cap", label: "Cappuccino" },
                    { id: "moca", label: "Moccaccino (Choco)" }
                ],
                default: "cap"
            },
            sugar: { label: "Sucre", type: "stepper", min: 0, max: 4, default: 1 }
        }
    },
    {
        id: 404,
        category: "Café",
        name: "Chocolat Chaud",
        description: "Boisson lactée cacaotée.",
        basePrice: 12,
        image: "https://images.unsplash.com/photo-1542488246-ad86db6346b6?w=800",
        prepTime: "5 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Type",
                type: "radio",
                options: [
                    { id: "noir", label: "Chocolat Noir" },
                    { id: "lait", label: "Chocolat au Lait" }
                ],
                default: "lait"
            }
        }
    },
    {
        id: 405,
        category: "Café",
        name: "Thé (Machine)",
        description: "Infusion chaude.",
        basePrice: 10,
        image: "https://images.unsplash.com/photo-1576092768241-dec231847233?w=800",
        prepTime: "3 min",
        available: true,
        customizable: true,
        customization: {
            flavor: {
                label: "Parfum",
                type: "radio",
                options: [{ id: "menthe", label: "Menthe" }, { id: "citron", label: "Citron" }],
                default: "menthe"
            },
            sugar: { label: "Sucre", type: "stepper", min: 0, max: 4, default: 1 }
        }
    },
    {
        id: 406,
        category: "Snacks",
        name: "Potage (Soupe)",
        description: "Soupe chaude du jour (Machine).",
        basePrice: 10,
        image: "https://images.unsplash.com/photo-1547592166-23acbe346499?w=800",
        prepTime: "2 min",
        available: true
    },

    // ==========================================
    // 🥘 BELDI & TRADITIONAL (Grouped)
    // ==========================================
    {
        id: 101,
        category: "Beldi",
        name: "Couscous",
        description: "Traditionnel du Vendredi.",
        basePrice: 30,
        image: "https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=800",
        prepTime: "30 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Viande",
                type: "radio",
                options: [
                    { id: "poulet", label: "Poulet", price: 0 },
                    { id: "viande", label: "Viande Rouge (+15 DH)", price: 15 }
                ],
                default: "poulet"
            },
            lben: {
                label: "Boisson",
                type: "checkbox",
                options: [{ id: "lben", label: "Verre de Lben (+5 DH)", price: 5 }]
            }
        }
    },
    {
        id: 102,
        category: "Beldi",
        name: "Omelette",
        description: "Œufs frais préparés minute.",
        basePrice: 15,
        image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800",
        prepTime: "10 min",
        available: true,
        customizable: true,
        customization: {
            variant: {
                label: "Garniture",
                type: "radio",
                options: [
                    { id: "nature", label: "Nature", price: 0 },
                    { id: "fromage", label: "Fromage", price: 5 },
                    { id: "khlii", label: "Khlii (+10 DH)", price: 10 },
                    { id: "champignon", label: "Champignons", price: 5 }
                ],
                default: "nature"
            }
        }
    },

    // ==========================================
    // 🍰 DESSERTS (Grouped)
    // ==========================================
    {
        id: 501,
        category: "Desserts",
        name: "Crêpe Sucrée",
        description: "Faite maison à la commande.",
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
                    { id: "sucre", label: "Sucre / Miel", price: 0 },
                    { id: "amlou", label: "Amlou", price: 5 },
                    { id: "nutella", label: "Nutella", price: 10 },
                    { id: "banane", label: "Nutella Banane", price: 15 }
                ],
                default: "sucre"
            }
        }
    }
];

export const restaurantCategories = [
    { id: "all", label: "Tout" },
    { id: "Beldi", label: "Beldi & Plats" },
    { id: "Snacks", label: "Snacks/Pizza" },
    { id: "Café", label: "Cafétéria" },
    { id: "Desserts", label: "Desserts" }
];
