"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Waves, ShoppingBag, ChevronRight, HelpCircle } from 'lucide-react';
import { useTranslation } from "@/lib/state/LanguageContext";
import Image from 'next/image';

interface ServicesMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ServicesMenuModal({ isOpen, onClose }: ServicesMenuModalProps) {
    const router = useRouter();
    const { t, language } = useTranslation();

    if (!isOpen) return null;

    const services = [
        {
            id: 'pool',
            name: t('menu.services.detente.title') || 'Espace Détente',
            icon: Waves,
            description: t('menu.services.detente.desc') || 'Piscine • Spa • Relaxation',
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 hover:border-cyan-500/25',
            border: 'border-white/5',
            image: '/images/pool.jpg',
            route: '/services/pool'
        },
        {
            id: 'boutique',
            name: t('menu.services.boutique.title') || 'Boutique & Lubrifiants',
            icon: ShoppingBag,
            description: t('menu.services.boutique.desc') || 'Snacks • Huiles • Accessoires',
            color: 'text-red-400',
            bg: 'bg-red-500/10 hover:border-red-500/25',
            border: 'border-white/5',
            image: '/images/oil.jpg',
            route: '/services/lubrifiants'
        },
        {
            id: 'faq',
            name: 'FAQ & Assistance',
            icon: HelpCircle,
            description: 'Questions fréquentes • Support 24/7',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 hover:border-amber-500/25',
            border: 'border-white/5',
            image: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=1200',
            route: '/faq'
        }
    ];

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end justify-center z-[70] animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-[#0B0F19] rounded-t-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="sticky top-0 bg-[#0B0F19]/90 backdrop-blur-xl p-6 border-b border-white/5 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-white text-2xl font-black tracking-tight uppercase">
                            {t('menu.services.title') || "Nos Services"}
                        </h2>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Golden Parc Station GPS</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Services Grid (Premium Design with background images) */}
                    <div className="grid grid-cols-1 gap-4">
                        {services.map(service => (
                            <button
                                key={service.id}
                                onClick={() => {
                                    router.push(service.route);
                                    onClose();
                                }}
                                className={`group relative overflow-hidden rounded-2xl p-6 border ${service.border} ${service.bg} transition-all duration-300 text-left h-28 flex items-center shadow-lg active:scale-[0.99]`}
                            >
                                {/* Background Image Overlay */}
                                <div className="absolute inset-0 z-0">
                                    <Image 
                                        src={service.image} 
                                        alt={service.name} 
                                        fill 
                                        className="object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 pointer-events-none" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/80 to-transparent" />
                                </div>

                                <div className="flex items-center gap-4 relative z-10 w-full">
                                    <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                                        <service.icon className={`w-7 h-7 ${service.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                                            {service.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-semibold mt-1 truncate">
                                            {service.description}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                    </div>
                                </div>
                            </button>
                        ))}

                    </div>

                </div>

                {/* Footer Info */}
                <div className="p-6 border-t border-white/5 bg-[#0B0F19]/80 backdrop-blur-md">
                    <p className="text-gray-400 text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        {t('menu.services.footer') || "Services disponibles 24/7 sur place"}
                    </p>
                </div>

            </div>
        </div>
    );
}
