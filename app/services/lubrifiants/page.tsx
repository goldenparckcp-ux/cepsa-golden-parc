"use client";

import React, { useState } from "react";
import { ChevronLeft, Info, Search, Droplet, Shield, Zap, Wrench, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/state/LanguageContext";

// Catalogue Mockup
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
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<typeof LUBRICANTS_CATALOG[0] | null>(null);

    const filteredCatalog = LUBRICANTS_CATALOG.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <main className="min-h-screen bg-[#070A13] pb-24 font-sans text-white">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#070A13]/90 backdrop-blur-xl border-b border-white/5 pt-4 pb-4 px-4 shadow-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase">{t('lube.catalog.title')}</h1>
                        <p className="text-gray-400 text-xs">{t('lube.catalog.sub')}</p>
                    </div>
                    <div className="w-12 h-12" /> {/* Spacer */}
                </div>
            </div>

            {/* Hero Banner */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-white/10">
                <Image
                    src="https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=1200&q=80"
                    alt="Lubrifiants Hero"
                    fill
                    className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-600/20 text-red-500 text-[10px] font-black px-3 py-1.5 rounded-full w-fit mb-4 border border-red-500/30 flex items-center gap-2">
                        <Wrench className="w-3 h-3" /> EXPERTISE CEPSA
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black mb-2">
                        {t('lube.catalog.hero')}
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-400 max-w-lg">
                        {t('lube.catalog.desc')}
                    </motion.p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 max-w-7xl mx-auto mt-8 mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                    <input 
                        type="text"
                        placeholder={t('lube.search')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:border-red-500 focus:bg-[#1E293B] transition-all shadow-xl"
                    />
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="px-4 max-w-7xl mx-auto">
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredCatalog.map((product, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.1 }}
                                key={product.id}
                                className="bg-[#111827] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col group hover:border-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className="h-56 relative overflow-hidden bg-[#1E293B]">
                                    <Image 
                                        src={product.image} 
                                        alt={product.name} 
                                        fill 
                                        className="object-cover opacity-50 group-hover:scale-110 group-hover:opacity-70 transition-all duration-700 mix-blend-luminosity"
                                    />
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                        <Droplet className="w-3 h-3 text-red-500" /> {product.type}
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-xl px-4 py-2 rounded-xl shadow-lg">
                                        {product.price} DH
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black mb-2 text-white group-hover:text-red-400 transition-colors">{product.name}</h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">{product.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-auto">
                                        <Info className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm font-bold text-gray-500">{t('lube.details')}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 md:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ y: "100%" }} 
                            animate={{ y: 0 }} 
                            exit={{ y: "100%" }} 
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-[#070A13] border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl z-10"
                        >
                            {/* Drag Handle for mobile */}
                            <div className="w-full flex justify-center pt-4 pb-2 sm:hidden absolute top-0 z-20">
                                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                            </div>

                            <div className="h-64 relative shrink-0">
                                <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-red-600/20 backdrop-blur-md text-red-500 text-xs font-black px-3 py-1.5 rounded-full border border-red-500/30 w-fit mb-3">
                                        {selectedProduct.type}
                                    </div>
                                    <h2 className="text-3xl font-black text-white">{selectedProduct.name}</h2>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t('lube.price_station')}</span>
                                    <span className="text-4xl font-black text-white">{selectedProduct.price} DH</span>
                                </div>

                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-500" /> {t('lube.desc')}
                                </h3>
                                <p className="text-gray-400 leading-relaxed mb-8">{selectedProduct.description}</p>

                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-gray-500" /> {t('lube.benefits')}
                                </h3>
                                <div className="flex flex-wrap gap-3 mb-8">
                                    {selectedProduct.features.map(feat => (
                                        <div key={feat} className="bg-[#111827] border border-white/5 px-4 py-2 rounded-xl text-sm font-bold text-gray-300 flex items-center gap-2 shadow-inner">
                                            <Zap className="w-4 h-4 text-amber-500" /> {feat}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex items-start gap-4 mb-4 mt-8">
                                    <Check className="w-6 h-6 text-green-500 shrink-0" />
                                    <div>
                                        <h4 className="text-green-400 font-bold mb-1">{t('lube.avail')}</h4>
                                        <p className="text-green-500/70 text-sm">{t('lube.avail.desc')}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-[#111827] border-t border-white/5">
                                <button onClick={() => setSelectedProduct(null)} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-black text-white transition-all">
                                    {t('lube.close')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
