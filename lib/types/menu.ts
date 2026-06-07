// Auto-generated full menu consolidated (Glovo Style)
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
    name_ar?: string;
    description: string;
    description_ar?: string;
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
    { id: "FastFood", label: "Fast Food" },
    { id: "Plats", label: "Plats & Beldi" },
    { id: "Ftour", label: "Ftour (Ptit Déj)" },
    { id: "Salades", label: "Salades" },
    { id: "Desserts", label: "Desserts" },
    { id: "Boissons", label: "Boissons" }
];

export const COMPLETE_MENU: MenuItem[] = [
    {
        id: 1000,
        category: "FastFood",
        name: "Pizza Personnalisée",
        name_ar: "بيتزا مخصصة",
        description: "Créez votre pizza parfaite avec la pâte et les garnitures de votre choix.",
        description_ar: "اصنع البيتزا المثالية مع العجينة والإضافات التي تختارها.",
        basePrice: 20,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
        prepTime: "15 min",
        available: true,
        badge: "Populaire",
        isFeatured: true,
        customizable: true,
        customization: {
          type: {
                    label: "Recette",
                    type: "radio",
                    options: [
                              {
                                        id: "marg",
                                        label: "Margerite",
                                        price: 0
                              },
                              {
                                        id: "veg",
                                        label: "Végétarienne",
                                        price: 0
                              },
                              {
                                        id: "viande",
                                        label: "Viande Hachée",
                                        price: 10
                              },
                              {
                                        id: "dinde",
                                        label: "Dinde",
                                        price: 10
                              },
                              {
                                        id: "4from",
                                        label: "4 Fromages",
                                        price: 10
                              },
                              {
                                        id: "kabab",
                                        label: "Kabab",
                                        price: 10
                              },
                              {
                                        id: "fruit",
                                        label: "Fruit de Mér",
                                        price: 15
                              },
                              {
                                        id: "4saisons",
                                        label: "4 Saisons",
                                        price: 15
                              },
                              {
                                        id: "dindefume",
                                        label: "Dinde Fumé",
                                        price: 15
                              }
                    ],
                    default: "marg"
          },
          taille: {
                    label: "Taille",
                    type: "radio",
                    options: [
                              {
                                        id: "P",
                                        label: "Petite (P)",
                                        price: 0
                              },
                              {
                                        id: "M",
                                        label: "Moyenne (M)",
                                        price: 10
                              },
                              {
                                        id: "G",
                                        label: "Grande (G)",
                                        price: 20
                              }
                    ],
                    default: "P"
          }
}
    },
    {
        id: 1001,
        category: "FastFood",
        name: "Tacos Sur Mesure",
        name_ar: "طاكوس على المقاس",
        description: "Votre Tacos avec frites et sauce fromagère maison.",
        description_ar: "طاكوس مع بطاطس مقلية وصلصة الجبن المنزلية.",
        basePrice: 30,
        image: "/image/taxos.jpeg",
        prepTime: "10 min",
        available: true,
        badge: "Bestseller",
        isFeatured: true,
        customizable: true,
        customization: {
          viande: {
                    label: "Choix Viande",
                    type: "radio",
                    options: [
                              {
                                        id: "viande",
                                        label: "Viande Hachée",
                                        price: 0
                              },
                              {
                                        id: "dinde",
                                        label: "Dinde",
                                        price: 0
                              },
                              {
                                        id: "mixte",
                                        label: "Mixte",
                                        price: 5
                              },
                              {
                                        id: "nuggets",
                                        label: "Nuggets",
                                        price: 10
                              },
                              {
                                        id: "fruitmer",
                                        label: "Fruit de Mer",
                                        price: 15
                              }
                    ],
                    default: "dinde"
          },
          taille: {
                    label: "Taille du Tacos",
                    type: "radio",
                    options: [
                              {
                                        id: "M",
                                        label: "Taille M",
                                        price: 0
                              },
                              {
                                        id: "L",
                                        label: "Taille L",
                                        price: 10
                              },
                              {
                                        id: "XL",
                                        label: "Taille XL",
                                        price: 20
                              }
                    ],
                    default: "M"
          },
          gratine: {
                    label: "Supplément Gratiné",
                    type: "radio",
                    options: [
                              {
                                        id: "non",
                                        label: "Normal (Non Gratiné)",
                                        price: 0
                              },
                              {
                                        id: "grat_m",
                                        label: "Gratiné M",
                                        price: 5
                              },
                              {
                                        id: "grat_l",
                                        label: "Gratiné L",
                                        price: 7
                              },
                              {
                                        id: "grat_xl",
                                        label: "Gratiné XL",
                                        price: 10
                              }
                    ],
                    default: "non"
          },
          sauce: {
                    label: "Sauces internes (Max 2)",
                    type: "checkbox",
                    options: [
                              {
                                        id: "alg",
                                        label: "Algérienne"
                              },
                              {
                                        id: "sam",
                                        label: "Samourai"
                              },
                              {
                                        id: "and",
                                        label: "Andalouse"
                              },
                              {
                                        id: "big",
                                        label: "Biggy"
                              },
                              {
                                        id: "ketchup",
                                        label: "Ketchup"
                              }
                    ]
          },
          supplements: {
                    label: "Suppléments",
                    type: "checkbox",
                    options: [
                              {
                                        id: "frites",
                                        label: "Frites",
                                        price: 8
                              },
                              {
                                        id: "fromage",
                                        label: "Fromage",
                                        price: 3
                              },
                              {
                                        id: "oeuf",
                                        label: "Oeuf",
                                        price: 3
                              },
                              {
                                        id: "nuggets",
                                        label: "1 Nugget",
                                        price: 4
                              },
                              {
                                        id: "crabe",
                                        label: "Crabe",
                                        price: 5
                              }
                    ]
          }
}
    },
    {
        id: 1002,
        category: "FastFood",
        name: "Burger Maison",
        name_ar: "برغر منزلي",
        description: "Steak haché de boeuf, salade, tomate, oignons, sauce burger.",
        description_ar: "شريحة لحم بقري مفروم، سلطة، طماطم، بصل، وصلصة برغر.",
        basePrice: 20,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        prepTime: "10 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          type: {
                    label: "Type de Burger",
                    type: "radio",
                    options: [
                              {
                                        id: "burger",
                                        label: "Hamburger",
                                        price: 0
                              },
                              {
                                        id: "cheese",
                                        label: "Cheese Burger",
                                        price: 5
                              },
                              {
                                        id: "chicken",
                                        label: "Chicken Burger",
                                        price: 10
                              },
                              {
                                        id: "american",
                                        label: "American Burger",
                                        price: 15
                              }
                    ],
                    default: "burger"
          },
          combo: {
                    label: "Formule Menu",
                    type: "radio",
                    options: [
                              {
                                        id: "seul",
                                        label: "Seul",
                                        price: 0
                              },
                              {
                                        id: "menu",
                                        label: "Menu (Frites + Boisson)",
                                        price: 15
                              }
                    ],
                    default: "seul"
          },
          supplements: {
                    label: "Suppléments",
                    type: "checkbox",
                    options: [
                              {
                                        id: "frites",
                                        label: "Frites",
                                        price: 8
                              },
                              {
                                        id: "fromage",
                                        label: "Fromage",
                                        price: 3
                              },
                              {
                                        id: "oeuf",
                                        label: "Oeuf",
                                        price: 3
                              },
                              {
                                        id: "nuggets",
                                        label: "1 Nugget",
                                        price: 4
                              },
                              {
                                        id: "crabe",
                                        label: "Crabe",
                                        price: 5
                              }
                    ]
          }
}
    },
    {
        id: 1003,
        category: "FastFood",
        name: "Panini Pressé",
        name_ar: "بانيني",
        description: "Pain ciabatta, fromage fondant, garniture au choix.",
        description_ar: "خبز الشيباتا، جبن ذائب، حشوة من اختيارك.",
        basePrice: 15,
        image: "/image/panini.jpeg",
        prepTime: "5 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          viande: {
                    label: "Garniture",
                    type: "radio",
                    options: [
                              {
                                        id: "thon",
                                        label: "Thon",
                                        price: 0
                              },
                              {
                                        id: "viande",
                                        label: "Viande Hachée",
                                        price: 5
                              },
                              {
                                        id: "dinde",
                                        label: "Dinde",
                                        price: 5
                              },
                              {
                                        id: "mixte",
                                        label: "Mixte",
                                        price: 10
                              },
                              {
                                        id: "fruitmer",
                                        label: "Fruits De Mer",
                                        price: 10
                              },
                              {
                                        id: "nuggets",
                                        label: "Nuggets",
                                        price: 10
                              },
                              {
                                        id: "cordon",
                                        label: "Cordon Bleu",
                                        price: 10
                              }
                    ],
                    default: "thon"
          },
          combo: {
                    label: "Formule Menu",
                    type: "radio",
                    options: [
                              {
                                        id: "seul",
                                        label: "Seul",
                                        price: 0
                              },
                              {
                                        id: "menu",
                                        label: "Menu (Frites + Boisson)",
                                        price: 15
                              }
                    ],
                    default: "seul"
          }
}
    },
    {
        id: 1004,
        category: "FastFood",
        name: "Sandwich Classique",
        name_ar: "ساندويتش كلاسيكي",
        description: "Baguette croustillante, frites, salade, garniture au choix.",
        description_ar: "باكيط مقرمش، بطاطس مقلية، سلطة، حشوة من اختيارك.",
        basePrice: 10,
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
        prepTime: "5 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          viande: {
                    label: "Garniture",
                    type: "radio",
                    options: [
                              {
                                        id: "normal",
                                        label: "Normal (Sans viande)",
                                        price: 0
                              },
                              {
                                        id: "froid",
                                        label: "Froid (Cachir/Fromage)",
                                        price: 3
                              },
                              {
                                        id: "thon",
                                        label: "Thon",
                                        price: 5
                              },
                              {
                                        id: "viande",
                                        label: "Viande Hachée",
                                        price: 10
                              },
                              {
                                        id: "dinde",
                                        label: "Dinde",
                                        price: 10
                              },
                              {
                                        id: "mixte",
                                        label: "Mixte",
                                        price: 15
                              },
                              {
                                        id: "fruitmer",
                                        label: "Fruits De Mer",
                                        price: 15
                              }
                    ],
                    default: "viande"
          },
          combo: {
                    label: "Formule Menu",
                    type: "radio",
                    options: [
                              {
                                        id: "seul",
                                        label: "Seul",
                                        price: 0
                              },
                              {
                                        id: "menu",
                                        label: "Menu (Frites + Boisson)",
                                        price: 15
                              }
                    ],
                    default: "seul"
          }
}
    },
    {
        id: 1005,
        category: "FastFood",
        name: "Sandwich Pain Maison",
        name_ar: "ساندويتش بخبز الدار",
        description: "Notre spécialité pain maison extra moelleux.",
        description_ar: "تخصصنا بخبز منزلي ناعم جداً.",
        basePrice: 30,
        image: "/image/sandwich_pain_maison.png",
        prepTime: "10 min",
        available: true,
        badge: "Signature",
        isFeatured: false,
        customizable: true,
        customization: {
          viande: {
                    label: "Spécialité",
                    type: "radio",
                    options: [
                              {
                                        id: "chiken",
                                        label: "Chiken",
                                        price: 0
                              },
                              {
                                        id: "foud",
                                        label: "Foud Paris",
                                        price: 0
                              },
                              {
                                        id: "tandoori",
                                        label: "Chiken Tandoori",
                                        price: 0
                              },
                              {
                                        id: "mixparis",
                                        label: "Mix Paris",
                                        price: 0
                              },
                              {
                                        id: "mixroyale",
                                        label: "Mix Royale",
                                        price: 0
                              },
                              {
                                        id: "cordon",
                                        label: "Cordon Bleu",
                                        price: 0
                              }
                    ],
                    default: "chiken"
          },
          combo: {
                    label: "Formule Menu",
                    type: "radio",
                    options: [
                              {
                                        id: "seul",
                                        label: "Seul",
                                        price: 0
                              },
                              {
                                        id: "menu",
                                        label: "Menu (Frites + Boisson)",
                                        price: 15
                              }
                    ],
                    default: "seul"
          }
}
    },
    {
        id: 1006,
        category: "FastFood",
        name: "Pasticcio & Lasagnes",
        name_ar: "باستيشيو و لازانيا",
        description: "Plats au four gratinés.",
        description_ar: "أطباق مخبوزة ومحمرة في الفرن.",
        basePrice: 25,
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
        prepTime: "20 min",
        available: true,
        badge: "Gourmand",
        isFeatured: false,
        customizable: true,
        customization: {
          type: {
                    label: "Type de Plat",
                    type: "radio",
                    options: [
                              {
                                        id: "lasagne",
                                        label: "Lasagne",
                                        price: 0
                              },
                              {
                                        id: "pasticcio",
                                        label: "Pasticcio (Macaronis)",
                                        price: 10
                              }
                    ],
                    default: "pasticcio"
          },
          viande: {
                    label: "Garniture",
                    type: "radio",
                    options: [
                              {
                                        id: "dinde",
                                        label: "Dinde",
                                        price: 0
                              },
                              {
                                        id: "viande",
                                        label: "Viande Hachée",
                                        price: 0
                              },
                              {
                                        id: "mixte",
                                        label: "Mixte",
                                        price: 5
                              },
                              {
                                        id: "fruitmer",
                                        label: "Fruit de Mer",
                                        price: 10
                              },
                              {
                                        id: "kabab",
                                        label: "Kabab",
                                        price: 10
                              }
                    ],
                    default: "viande"
          }
}
    },
    {
        id: 1007,
        category: "FastFood",
        name: "Shawarma & Cheese Naan",
        name_ar: "شاورما و نان بالجبن",
        description: "Spécialités orientales, pain libanais ou indien au fromage.",
        description_ar: "تخصصات شرقية، خبز لبناني أو هندي بالجبن.",
        basePrice: 25,
        image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
        prepTime: "5 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          type: {
                    label: "Type de Pain",
                    type: "radio",
                    options: [
                              {
                                        id: "shawarma",
                                        label: "Shawarma Syrien",
                                        price: 0
                              },
                              {
                                        id: "naan",
                                        label: "Cheese Naan",
                                        price: 10
                              }
                    ],
                    default: "shawarma"
          },
          viande: {
                    label: "Garniture",
                    type: "radio",
                    options: [
                              {
                                        id: "normal",
                                        label: "Poulet",
                                        price: 0
                              },
                              {
                                        id: "viande",
                                        label: "V.Haché",
                                        price: 0
                              },
                              {
                                        id: "mixte",
                                        label: "Mixte",
                                        price: 5
                              }
                    ],
                    default: "normal"
          },
          combo: {
                    label: "Formule Menu",
                    type: "radio",
                    options: [
                              {
                                        id: "seul",
                                        label: "Seul",
                                        price: 0
                              },
                              {
                                        id: "menu",
                                        label: "Menu (Frites + Boisson)",
                                        price: 15
                              }
                    ],
                    default: "seul"
          }
}
    },
    {
        id: 1008,
        category: "Plats",
        name: "Tajine Marocain",
        name_ar: "طاجين مغربي",
        description: "Cuit lentement sur charbon (Fekhar).",
        description_ar: "مطهو ببطء على الفحم (طاجين الفخار).",
        basePrice: 35,
        image: "/image/tajin.jpeg",
        prepTime: "40 min",
        available: true,
        badge: "Beldi",
        isFeatured: true,
        customizable: true,
        customization: {
          variant: {
                    label: "Type de Tajine",
                    type: "radio",
                    options: [
                              {
                                        id: "poulet_citron",
                                        label: "Poulet Citron / Dghmira",
                                        price: 0
                              },
                              {
                                        id: "kefta",
                                        label: "Kefta Oeufs (Sauce Tomate)",
                                        price: 0
                              },
                              {
                                        id: "legume",
                                        label: "Légumes (Végétarien)",
                                        price: -5
                              },
                              {
                                        id: "viande_pruneau",
                                        label: "Viande Pruneaux",
                                        price: 30
                              }
                    ],
                    default: "poulet_citron"
          }
}
    },
    {
        id: 1009,
        category: "Plats",
        name: "Poulet Rôti (Djaj Mhamer)",
        name_ar: "دجاج محمر",
        description: "Poulet rôti à la marocaine avec frites et olives.",
        description_ar: "دجاج محمر على الطريقة المغربية مع البطاطس والزيتون.",
        basePrice: 40,
        image: "/image/djaj m7amar.jpeg",
        prepTime: "20 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          portion: {
                    label: "Portion",
                    type: "radio",
                    options: [
                              {
                                        id: "quart",
                                        label: "1/4 Poulet (Individuel)",
                                        price: 0
                              },
                              {
                                        id: "demi",
                                        label: "1/2 Poulet",
                                        price: 30
                              },
                              {
                                        id: "entier",
                                        label: "Poulet Entier (Famille)",
                                        price: 80
                              }
                    ],
                    default: "quart"
          }
}
    },
    {
        id: 1010,
        category: "Plats",
        name: "Couscous (Vendredi)",
        name_ar: "كسكس (الجمعة)",
        description: "Plat traditionnel marocain, servi uniquement le vendredi.",
        description_ar: "طبق مغربي تقليدي، يقدم يوم الجمعة فقط.",
        basePrice: 30,
        image: "/image/couscous.jpeg",
        prepTime: "30 min",
        available: true,
        badge: "Spécialité",
        isFeatured: false,
        customizable: true,
        customization: {
          variant: {
                    label: "Type",
                    type: "radio",
                    options: [
                              {
                                        id: "poulet",
                                        label: "Couscous Poulet",
                                        price: 0
                              },
                              {
                                        id: "viande",
                                        label: "Couscous Viande",
                                        price: 20
                              }
                    ],
                    default: "poulet"
          }
}
    },
    {
        id: 1011,
        category: "Plats",
        name: "Pâtes",
        name_ar: "معكرونة (پاستا)",
        description: "Spaghetti ou Penne servis avec votre sauce préférée.",
        description_ar: "سباغيتي أو بيني تقدم مع الصلصة المفضلة لديك.",
        basePrice: 30,
        image: "/image/les pate.jpeg",
        prepTime: "15 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          sauce: {
                    label: "Recette",
                    type: "radio",
                    options: [
                              {
                                        id: "bolo",
                                        label: "Bolognaise",
                                        price: 0
                              },
                              {
                                        id: "dinde",
                                        label: "Dinde Fumé & Crème Fraîche",
                                        price: 5
                              },
                              {
                                        id: "fruitmer",
                                        label: "Fruits de Mer",
                                        price: 10
                              }
                    ],
                    default: "bolo"
          },
          type: {
                    label: "Type de Pâtes",
                    type: "radio",
                    options: [
                              {
                                        id: "penne",
                                        label: "Penne"
                              },
                              {
                                        id: "spag",
                                        label: "Spaghetti"
                              }
                    ],
                    default: "penne"
          }
}
    },
    {
        id: 1012,
        category: "Ftour",
        name: "Omelette",
        name_ar: "أومليط",
        description: "Œufs de ferme préparés à votre goût.",
        description_ar: "بيض مزرعة محضر حسب ذوقك.",
        basePrice: 15,
        image: "/image/Omelette.jpeg",
        prepTime: "10 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          variant: {
                    label: "Type",
                    type: "radio",
                    options: [
                              {
                                        id: "nature",
                                        label: "Nature",
                                        price: 0
                              },
                              {
                                        id: "fromage",
                                        label: "Fromage",
                                        price: 5
                              },
                              {
                                        id: "khlii",
                                        label: "Khliî (Viande séchée)",
                                        price: 10
                              }
                    ],
                    default: "nature"
          }
}
    },
    {
        id: 1013,
        category: "Ftour",
        name: "Ftour Complet",
        name_ar: "فطور كامل",
        description: "Petit déjeuner complet traditionnel.",
        description_ar: "فطور تقليدي كامل.",
        basePrice: 35,
        image: "/image/ftor complet.jpeg",
        prepTime: "15 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: false,
        customization: undefined
    },
    {
        id: 1014,
        category: "Ftour",
        name: "Crêpes & Galettes Chaudes",
        name_ar: "فطائر ومسمن",
        description: "Assortiment de Baghrir, Msamen, Harcha.",
        description_ar: "تشكيلة من البغرير، المسمن، والحرشة.",
        basePrice: 10,
        image: "/image/msmn o 7rcha.jpeg",
        prepTime: "5 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          accompagnement: {
                    label: "Accompagnements",
                    type: "checkbox",
                    options: [
                              {
                                        id: "miel",
                                        label: "Miel & Beurre",
                                        price: 2
                              },
                              {
                                        id: "amlou",
                                        label: "Amlou (Amandes & Argan)",
                                        price: 5
                              },
                              {
                                        id: "nutella",
                                        label: "Nutella",
                                        price: 5
                              }
                    ]
          }
}
    },
    {
        id: 1015,
        category: "Salades",
        name: "Salade Fraîche",
        name_ar: "سلطة طازجة",
        description: "Légumes frais de saison.",
        description_ar: "خضروات موسمية طازجة.",
        basePrice: 25,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        prepTime: "10 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          type: {
                    label: "Variété",
                    type: "radio",
                    options: [
                              {
                                        id: "nicoise",
                                        label: "Niçoise",
                                        price: 0
                              },
                              {
                                        id: "mexicaine",
                                        label: "Mexicaine",
                                        price: 0
                              },
                              {
                                        id: "cesar",
                                        label: "César",
                                        price: 10
                              },
                              {
                                        id: "paris",
                                        label: "Paris",
                                        price: 15
                              }
                    ],
                    default: "nicoise"
          }
}
    },
    {
        id: 1016,
        category: "Boissons",
        name: "Jus Frais",
        name_ar: "عصير طازج",
        description: "Pressé minute, 100% fruits.",
        description_ar: "معصور طازج، 100٪ فواكه.",
        basePrice: 10,
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800",
        prepTime: "5 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          fruit: {
                    label: "Fruit",
                    type: "radio",
                    options: [
                              {
                                        id: "orange",
                                        label: "D'orange",
                                        price: 0
                              },
                              {
                                        id: "citron",
                                        label: "De Citron",
                                        price: 0
                              },
                              {
                                        id: "pomme",
                                        label: "De pomme",
                                        price: 0
                              },
                              {
                                        id: "banane",
                                        label: "De Banane",
                                        price: 0
                              },
                              {
                                        id: "tropical",
                                        label: "Tropical",
                                        price: 0
                              },
                              {
                                        id: "avocat",
                                        label: "De avocat",
                                        price: 6
                              },
                              {
                                        id: "panache",
                                        label: "Panaché (Orange)",
                                        price: 8
                              }
                    ],
                    default: "orange"
          },
          sucre: {
                    label: "Sucre",
                    type: "radio",
                    options: [
                              {
                                        id: "avec",
                                        label: "Avec Sucre"
                              },
                              {
                                        id: "sans",
                                        label: "Sans Sucre"
                              }
                    ],
                    default: "avec"
          }
}
    },
    {
        id: 1017,
        category: "Boissons",
        name: "Cafétéria",
        name_ar: "مقهى",
        description: "Boissons chaudes premium.",
        description_ar: "مشروبات ساخنة ممتازة.",
        basePrice: 10,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
        prepTime: "5 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          boisson: {
                    label: "Choix",
                    type: "radio",
                    options: [
                              {
                                        id: "cafe",
                                        label: "Café Espresso",
                                        price: 0
                              },
                              {
                                        id: "lait",
                                        label: "Lait Chaud",
                                        price: 0
                              },
                              {
                                        id: "nousnous",
                                        label: "Nouss Nouss",
                                        price: 0
                              },
                              {
                                        id: "the",
                                        label: "Thé à la Menthe",
                                        price: 5
                              }
                    ],
                    default: "cafe"
          }
}
    },
    {
        id: 1018,
        category: "Boissons",
        name: "Soda & Eau",
        name_ar: "مشروبات غازية وماء",
        description: "Boissons fraîches.",
        description_ar: "مشروبات باردة.",
        basePrice: 5,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800",
        prepTime: "2 min",
        available: true,
        badge: undefined,
        isFeatured: false,
        customizable: true,
        customization: {
          boisson: {
                    label: "Choix",
                    type: "radio",
                    options: [
                              {
                                        id: "eau_p",
                                        label: "Eau Minérale (Petite)",
                                        price: 0
                              },
                              {
                                        id: "eau_g",
                                        label: "Eau 50 Cl",
                                        price: 3
                              },
                              {
                                        id: "coca",
                                        label: "Soda Canette (Coca, etc.)",
                                        price: 5
                              }
                    ],
                    default: "eau_p"
          }
}
    },
    {
        id: 1019,
        category: "Desserts",
        name: "Salade de fruit",
        name_ar: "سلطة فواكه",
        description: "Cocktail de fruits de saison fraîchement coupés.",
        description_ar: "كوكتيل فواكه موسمية مقطعة طازجة.",
        basePrice: 40,
        image: "/image/salade_de_fruit.png",
        prepTime: "10 min",
        available: true,
        badge: "Frais",
        isFeatured: true,
        customizable: false,
        customization: undefined
    },
    {
        id: 1020,
        category: "Desserts",
        name: "Flan Amlou",
        name_ar: "فلان بأملو",
        description: "Flan onctueux parfumé à la pâte d'Amlou.",
        description_ar: "فلان ناعم بنكهة عجينة أملو.",
        basePrice: 15,
        image: "/image/flan_amlou.png",
        prepTime: "5 min",
        available: true,
        badge: "Local",
        isFeatured: false,
        customizable: false,
        customization: undefined
    },
    {
        id: 1021,
        category: "Desserts",
        name: "Za3za3",
        name_ar: "زعزع",
        description: "Cocktail avocat, fruits, crème et fruits secs.",
        description_ar: "كوكتيل أفوكادو، فواكه، كريمة وفواكه جافة.",
        basePrice: 25,
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
        prepTime: "10 min",
        available: true,
        badge: "Énergie",
        isFeatured: true,
        customizable: false,
        customization: undefined
    }
];
