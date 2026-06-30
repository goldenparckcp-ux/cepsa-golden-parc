"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Info, Search, Droplet, Shield, Zap, Wrench, Check, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/state/LanguageContext";
import { supabase } from "@/lib/supabase";

// Catalogue Mockup Fallback
const LUBRICANTS_CATALOG = [
    {
        id: "cepsa-xtar-5w30",
        name: "Cepsa Xtar 5W30",
        type: "Synthétique",
        description: "Huile moteur 100% synthétique de très haute technologie, conçue pour les moteurs modernes de dernière génération. Offre une protection maximale contre l'usure.",
        price: 350,
        image: "https://images.unsplash.com/photo-1621255554101-78c43fb3f538?auto=format&fit=crop&w=600&q=80",
        features: ["Protection Max", "Éco-Carburant", "Longue Durée"]
    },
    {
        id: "cepsa-genuine-10w40",
        name: "Cepsa Genuine 10W40",
        type: "Semi-Synthétique",
        description: "Huile semi-synthétique polyvalente pour une large gamme de véhicules. Garantit un excellent nettoyage du moteur et une bonne stabilité thermique.",
        price: 220,
        image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=600&q=80",
        features: ["Nettoyage", "Polyvalent", "Protection"]
    },
    {
        id: "cepsa-tracteur-15w40",
        name: "Cepsa Avant 15W40",
        type: "Minérale",
        description: "Huile minérale robuste, idéale pour les véhicules lourds, agricoles et anciens moteurs. Très grande résistance thermique.",
        price: 180,
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80",
        features: ["Robuste", "Haute Pression", "Engins Lourds"]
    },
    {
        id: "cepsa-transmission",
        name: "Cepsa Transmission 80W90",
        type: "Huile de Boîte",
        description: "Lubrifiant extrême pression pour boîtes de vitesses manuelles et ponts. Protection optimale des engrenages.",
        price: 150,
        image: "https://images.unsplash.com/photo-1635048424329-a9ebfb3d12c6?auto=format&fit=crop&w=600&q=80",
        features: ["Anti-usure", "Extrême Pression"]
    }
];

export default function LubricantsCatalog() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [lubricantsList, setLubricantsList] = useState<any[]>(LUBRICANTS_CATALOG);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [heroSlides, setHeroSlides] = useState<any[]>([]);

    useEffect(() => {
        const fetchLubricants = async () => {
            try {
                const { data, error } = await supabase
                    .from("lubricant_items")
                    .select("*")
                    .eq("is_available", true)
                    .order("sort_order", { ascending: true });
                if (!error && data && data.length > 0) {
                    const mapped = data.map(item => ({
                        ...item,
                        image: item.image_url || item.image
                    }));
                    setLubricantsList(mapped);
                }
            } catch (err) {
                console.warn("Using local lubricants fallback:", err);
            }
        };

        const fetchHero = async () => {
            try {
                const { data, error } = await supabase
                    .from('hero_sliders')
                    .select('*')
                    .eq('page', 'lubricants')
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });
                if (data && data.length > 0) {
                    setHeroSlides(data);
                }
            } catch {
                // Ignore error
            }
        };

        fetchLubricants();
        fetchHero();
    }, []);

    const categories = ["all", ...Array.from(new Set(lubricantsList.map(p => p.type)))];

    const filteredCatalog = lubricantsList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || p.type === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen pt-16 md:pt-20 bg-[#0B0F19] pb-24 font-sans text-white relative overflow-hidden">
            {/* Ultra-Premium Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse duration-10000" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse duration-7000" />



            {/* HERO CAROUSEL */}
            {heroSlides.length > 0 ? (
                <div className="p-3 md:p-6 max-w-7xl mx-auto mb-2 relative z-10">
                    <div className="relative w-full h-[300px] sm:h-[400px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                        <div 
                            onScroll={(e) => {
                                const target = e.target as HTMLElement;
                                const index = Math.round(target.scrollLeft / target.clientWidth);
                                const dots = document.querySelectorAll('.lube-dot');
                                dots.forEach((dot, idx) => {
                                    if (idx === index) {
                                        dot.classList.add('bg-red-500', 'w-6');
                                        dot.classList.remove('bg-white/30', 'w-2');
                                    } else {
                                        dot.classList.remove('bg-red-500', 'w-6');
                                        dot.classList.add('bg-white/30', 'w-2');
                                    }
                                });
                            }}
                            className="flex overflow-x-auto snap-x snap-mandatory gap-0 scrollbar-hide w-full h-full scroll-smooth"
                        >
                            {heroSlides.map((slide, idx) => (
                                <div key={slide.id || idx} className="relative w-full h-full shrink-0 snap-center flex flex-col justify-end p-6 md:p-12 select-none" style={{ minWidth: '100%' }}>
                                    <Image src={slide.image_url} alt={slide.title} fill priority={idx === 0} className="object-cover absolute inset-0 -z-10 brightness-[0.5] saturate-150 transition-transform duration-[20s] ease-linear hover:scale-110 pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent -z-10" />
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full w-fit mb-4 flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                                        <Wrench className="w-3.5 h-3.5" /> {slide.badge_text || 'EXPERTISE PREMIUM'}
                                    </motion.div>
                                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black mb-3 uppercase tracking-tighter leading-none drop-shadow-2xl">
                                        {slide.title}
                                    </motion.h2>
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-400 max-w-xl font-medium leading-relaxed text-sm md:text-base">
                                        {slide.subtitle}
                                    </motion.p>
                                </div>
                            ))}
                        </div>
                        {heroSlides.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                                {heroSlides.map((_, idx) => (
                                    <span key={idx} className={`lube-dot h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-red-500 w-6' : 'bg-white/30 w-2'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden border-b border-white/5 group">
                    <Image
                        src="https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=1200&q=80"
                        alt="Lubrifiants Hero"
                        fill
                        className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-1000 group-hover:scale-105 transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full w-fit mb-4 flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                            <Wrench className="w-3.5 h-3.5" /> {language === 'ar' ? 'جودة عالية' : 'EXPERTISE PREMIUM'}
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black mb-3 uppercase tracking-tighter leading-none drop-shadow-2xl">
                            {t('lube.catalog.hero')}
                        </motion.h2>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-400 max-w-xl font-medium leading-relaxed text-sm md:text-base">
                            {t('lube.catalog.desc')}
                        </motion.p>
                    </div>
                </div>
            )}

            {/* Sleek Search Bar & Categories */}
            <div className="px-4 max-w-7xl mx-auto mt-8 mb-10 relative z-20">
                <div className="max-w-3xl mx-auto relative group mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-focus-within:opacity-100" />
                    <div className="relative flex items-center">
                        <Search className="absolute left-6 w-5 h-5 text-gray-400" />
                        <input 
                            type="text"
                            placeholder={t('lube.search')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold text-white outline-none focus:border-red-500/50 transition-all shadow-2xl placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 scrollbar-hide pb-4 px-2">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedCategory(cat)}
                            className={`shrink-0 snap-start px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md ${
                                selectedCategory === cat 
                                    ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-red-500/30 scale-105"
                                    : "bg-[#1E293B]/80 text-gray-400 hover:bg-[#1E293B] hover:text-white border border-white/5"
                            }`}
                        >
                            {cat === "all" ? (language === "ar" ? "الكل" : "Tous") : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Premium Symmetrical Grid */}
            <div className="px-4 max-w-7xl mx-auto">
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    <AnimatePresence>
                        {filteredCatalog.map((product, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                                key={product.id}
                                className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col group hover:border-red-500/40 hover:shadow-[0_20px_50px_rgba(220,38,38,0.15)] transition-all duration-500 cursor-pointer relative"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className="relative overflow-hidden bg-[#0a0d14] h-56">
                                    <Image 
                                        src={product.image} 
                                        alt={product.name} 
                                        fill 
                                        className="object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/20 to-transparent" />
                                    
                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg">
                                        <Droplet className="w-3 h-3 text-red-500" /> {product.type}
                                    </div>
                                    
                                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-lg px-4 py-2 rounded-xl shadow-xl flex items-center gap-1">
                                        {product.price} <span className="text-[10px] text-white/80 mt-1">DH</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-[30px] pointer-events-none group-hover:bg-red-500/10 transition-colors" />
                                    <div>
                                        <h3 className="text-xl font-black mb-2 text-white group-hover:text-red-400 transition-colors uppercase tracking-tight leading-tight">{product.name}</h3>
                                        <p className="text-gray-400 text-xs leading-relaxed mb-4 font-medium line-clamp-2">{product.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 group-hover:text-white transition-colors">{t('lube.details')}</span>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                            <ArrowRight className="w-4 h-4 text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Ultra-Premium Product Detail Sheet */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 md:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                        />
                        <motion.div 
                            initial={{ y: "100%", scale: 0.95 }} 
                            animate={{ y: 0, scale: 1 }} 
                            exit={{ y: "100%", scale: 0.95 }} 
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[95vh] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-10"
                        >
                            <div className="h-72 relative shrink-0">
                                <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
                                
                                <button 
                                    onClick={() => setSelectedProduct(null)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors z-20"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-red-500/30 w-fit mb-4 uppercase tracking-widest shadow-lg">
                                        {selectedProduct.type}
                                    </div>
                                    <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-xl">{selectedProduct.name}</h2>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
                                
                                <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/10">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 font-black uppercase tracking-widest text-[9px] mb-1">{t('lube.price_station')}</span>
                                        <span className="text-5xl font-black text-white tracking-tighter">{selectedProduct.price}<span className="text-xl text-gray-400 ml-2 font-bold tracking-normal">DH</span></span>
                                    </div>
                                </div>

                                <div className="space-y-10 relative z-10">
                                    <div>
                                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                <Info className="w-4 h-4 text-gray-400" />
                                            </div>
                                            {t('lube.desc')}
                                        </h3>
                                        <p className="text-gray-400 leading-relaxed font-medium text-sm pl-11">{selectedProduct.description}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-gray-400" />
                                            </div>
                                            {t('lube.benefits')}
                                        </h3>
                                        <div className="flex flex-wrap gap-3 pl-11">
                                            {selectedProduct.features.map((feat: string) => (
                                                <div key={feat} className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-300 flex items-center gap-2.5 shadow-lg">
                                                    <Zap className="w-3.5 h-3.5 text-amber-500" /> {feat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 p-6 rounded-3xl flex items-start gap-5">
                                        <div className="p-3 bg-green-500/20 rounded-2xl">
                                            <Check className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-green-400 font-black text-sm uppercase tracking-widest mb-1.5">{t('lube.avail')}</h4>
                                            <p className="text-green-500/70 text-xs font-bold leading-relaxed">{t('lube.avail.desc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
