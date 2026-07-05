"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Home, HelpCircle, Phone, MapPin, Clock, Bed, Utensils, Waves, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/state/LanguageContext";

type FAQItem = {
    q: string;
    a: string;
    category: "general" | "hotel" | "restaurant" | "pool" | "lube";
};

const FAQ_ITEMS: FAQItem[] = [
    // General
    {
        q: "Où se situe la station Golden Parc exactement ?",
        a: "Golden Parc Cepsa est idéalement située sur la Route Nationale 15 (RN15) à Outat El Haj. C'est l'escale parfaite et reposante pour faire le plein, manger ou dormir sur le trajet entre le Nord et le Sud du Maroc.",
        category: "general"
    },
    {
        q: "Quels sont les horaires d'ouverture de la station-service ?",
        a: "La station-service Cepsa (distribution de carburant) et son shop/boutique de dépannage sont ouverts 24h/24 et 7j/7 sans aucune interruption.",
        category: "general"
    },
    {
        q: "Comment contacter l'assistance en cas de besoin ?",
        a: "Vous pouvez joindre notre réception et assistance client 24h/24 au numéro de téléphone direct : 06 61 69 01 79.",
        category: "general"
    },
    // Hotel
    {
        q: "Quels types de chambres proposez-vous à l'Hôtel L'Escale ?",
        a: "Nous proposons trois types d'hébergement modernes : la Chambre Standard (lit double, douche italienne), la Suite Deluxe (espace salon privé, finitions premium) et la Suite Familiale (lits jumeaux, kitchenette, espace jeux pour enfants). Toutes nos chambres disposent de la climatisation silencieuse.",
        category: "hotel"
    },
    {
        q: "Qu'est-ce que la formule 'Sieste' (Day Use) ?",
        a: "La formule 'Sieste' permet de réserver une chambre en journée pour une courte durée (jusqu'à 6 heures) à un tarif réduit. C'est la solution idéale pour les voyageurs fatigués qui souhaitent se doucher et dormir quelques heures avant de reprendre la route en toute sécurité.",
        category: "hotel"
    },
    {
        q: "Les équipements comme le Wi-Fi ou la TV sont-ils inclus ?",
        a: "Oui, toutes les réservations incluent un accès gratuit au Wi-Fi haut débit par fibre optique, une télévision HD avec chaînes satellites, une douche italienne avec eau chaude, du linge de lit de qualité et un mini-bar.",
        category: "hotel"
    },
    {
        q: "Comment annuler ou modifier ma réservation d'hôtel ?",
        a: "Vous pouvez annuler ou modifier vos nuitées et siestes directement sur votre profil en ligne (onglet 'Mon Profil') jusqu'à 24 heures avant l'heure d'arrivée prévue.",
        category: "hotel"
    },
    // Restaurant
    {
        q: "Quels sont les horaires d'ouverture du restaurant ?",
        a: "Le Restaurant Golden Parc et son café premium sont ouverts tous les jours de 06:00 du matin à minuit (00:00).",
        category: "restaurant"
    },
    {
        q: "Quel type de cuisine proposez-vous ?",
        a: "Notre chef propose des grillades traditionnelles cuites au feu de bois, des tajines marocains authentiques, des pizzas savoureuses, des viennoiseries et pains frais faits sur place dans notre espace boulangerie, ainsi qu'une sélection de cafés de spécialité.",
        category: "restaurant"
    },
    {
        q: "Puis-je commander à manger en indiquant mon emplacement exact ?",
        a: "Oui ! C'est l'un de nos services exclusifs. Depuis l'onglet 'Restaurant', vous pouvez passer commande et spécifier votre emplacement sur le complexe : votre numéro de table au café, votre pompe à essence, la piscine ou directement votre numéro de chambre d'hôtel.",
        category: "restaurant"
    },
    {
        q: "Quels sont les moyens de paiement acceptés pour la nourriture ?",
        a: "Pour le restaurant, aucun pré-paiement en ligne n'est obligatoire si vous êtes sur place. Vous réglez directement le serveur lors de la livraison, en espèces ou par carte bancaire (TPE mobile). Si vous commandez 'En Route', un paiement de garantie par carte est requis.",
        category: "restaurant"
    },
    // Pool
    {
        q: "Quels sont les horaires d'ouverture et tarifs de la piscine ?",
        a: "La piscine extérieure est accessible pendant la saison estivale de 09:00 à 19:00. Les tarifs d'entrée journaliers sont de 50 DH pour les adultes et 30 DH pour les enfants.",
        category: "pool"
    },
    {
        q: "Comment sont organisées les journées à la piscine (Mixte, Familles, Femmes) ?",
        a: "Pour le confort et le respect de l'intimité de chacun, nous avons mis en place des journées thématiques : le Lundi est exclusivement réservé aux familles ; le Jeudi est exclusivement réservé aux femmes ; tous les autres jours (mardi, mercredi, vendredi, samedi, dimanche) sont ouverts en accès mixte.",
        category: "pool"
    },
    {
        q: "Les chaises longues et parasols sont-ils payants ?",
        a: "Non, les chaises longues, transats et parasols installés autour du bassin sont mis gratuitement à la disposition de tous nos clients munis d'un ticket de piscine valide (dans la limite des places disponibles).",
        category: "pool"
    },
    // Lube / Services
    {
        q: "Quels sont les horaires du comptoir d'entretien et de vidange ?",
        a: "Notre espace d'entretien auto et de vente de lubrifiants Cepsa est ouvert tous les jours de 08:00 à 20:00.",
        category: "lube"
    },
    {
        q: "Puis-je faire ma vidange sur place avec des huiles officielles ?",
        a: "Tout à fait. Nous disposons d'un comptoir officiel distribuant la gamme complète de lubrifiants CEPSA de haute qualité. Nos techniciens qualifiés peuvent effectuer votre vidange express et les contrôles associés directement en station.",
        category: "lube"
    },
    {
        q: "Est-ce que vous proposez encore le service de lavage de voiture ?",
        a: "Non. Le service de lavage auto classique a été définitivement arrêté sur notre complexe afin de recentrer nos équipes et nos installations sur les services d'entretien mécanique rapide, la vidange et la vente de lubrifiants officiels Cepsa.",
        category: "lube"
    }
];

export default function FAQPage() {
    const router = useRouter();
    const { language } = useTranslation();
    const [contactSettings, setContactSettings] = useState<any>(null);

    React.useEffect(() => {
        const fetchContact = async () => {
            const { data } = await supabase.from('home_promos').select('*').eq('sort_order', -999).single();
            if (data) setContactSettings(data);
        };
        fetchContact();
    }, []);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Filters FAQ based on category and search query
    const filteredFAQs = useMemo(() => {
        return FAQ_ITEMS.filter((item) => {
            const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
            const matchesSearch =
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    const categories = [
        { id: "all", label: "Toutes", icon: HelpCircle },
        { id: "general", label: "Station & Infos", icon: MapPin },
        { id: "hotel", label: "Hôtel L'Escale", icon: Bed },
        { id: "restaurant", label: "Restaurant", icon: Utensils },
        { id: "pool", label: "Piscine", icon: Waves },
        { id: "lube", label: "Entretien Auto", icon: Wrench }
    ];

    return (
        <main className="min-h-screen bg-[#0B0F19] text-white pt-24 md:pt-32 pb-40 relative overflow-hidden font-sans">
            {/* Background Light Effects */}
            <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Back button */}
                <button
                    onClick={() => router.push("/")}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
                >
                    <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Retour à l'accueil
                </button>

                {/* Header */}
                <div className="mb-12 text-center md:text-left">
                    <div className="inline-flex bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-black px-4 py-2 rounded-xl uppercase tracking-wider mb-4">
                        Centre d'aide
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
                        Foire Aux <span className="text-red-600">Questions</span>
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                        Trouvez des réponses instantanées à toutes vos questions concernant notre hôtel, restaurant, piscine, tarifs et services de la station.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-10 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher une question (ex: horaires, réservation, piscine...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-16 bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl pl-14 pr-6 text-white placeholder-gray-500 outline-none focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(220,38,38,0.15)] transition-all font-medium text-sm md:text-base"
                    />
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setOpenIndex(null); // Close active accordion
                                }}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs md:text-sm font-bold border transition-all shrink-0 active:scale-95 ${
                                    isSelected
                                        ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20"
                                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* FAQ List Accordion */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((item, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.2 }}
                                    key={item.q}
                                    className="bg-[#111827]/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-white/10"
                                >
                                    <button
                                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                        className="w-full p-6 text-left flex justify-between items-center text-white font-bold hover:bg-white/5 transition-colors focus:outline-none"
                                    >
                                        <span className="text-base md:text-lg pr-4 font-black tracking-tight">{item.q}</span>
                                        <span
                                            className={`text-2xl transition-transform duration-300 shrink-0 ${
                                                openIndex === idx ? "rotate-45 text-red-500" : "text-gray-400"
                                            }`}
                                        >
                                            +
                                        </span>
                                    </button>
                                    <div
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            openIndex === idx
                                                ? "max-h-[300px] border-t border-white/5 opacity-100"
                                                : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <p className="p-6 text-gray-300 text-sm md:text-base leading-relaxed font-semibold">
                                            {item.a}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-[#111827]/20 border border-white/5 rounded-3xl">
                                <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">Aucune question ne correspond à votre recherche.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory("all");
                                    }}
                                    className="mt-4 text-red-500 font-extrabold text-sm hover:underline"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Section */}
                <div className="mt-16 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="mb-6 md:mb-0 text-center md:text-left relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
                        <p className="text-gray-400 text-sm font-medium">Notre équipe est disponible pour vous aider 24h/24, 7j/7.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
                        <a
                            href="tel:0661690179"
                            className="flex items-center justify-center gap-2 py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-colors shadow-lg shadow-red-600/10 active:scale-95 text-sm"
                        >
                            <Phone className="w-4 h-4" /> Appeler le 06 61 69 01 79
                        </a>
                        <a
                            href="https://maps.app.goo.gl/wWx1BeVM899uyPJ58"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-4 px-6 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white font-black rounded-2xl transition-colors active:scale-95 text-sm"
                        >
                            <MapPin className="w-4 h-4" /> Itinéraire GPS
                        </a>
                    </div>
                </div>
            </div>
            
            {/* JSON-LD pour Google AI Overviews & SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": FAQ_ITEMS.map((item) => ({
                            "@type": "Question",
                            "name": item.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": item.a
                            }
                        }))
                    })
                }}
            />
        </main>
    );
}
