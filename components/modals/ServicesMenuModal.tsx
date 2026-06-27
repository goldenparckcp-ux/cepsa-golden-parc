"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Waves, ShoppingBag, ChevronRight } from 'lucide-react';
import { useTranslation } from "@/lib/state/LanguageContext";

interface ServicesMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ServicesMenuModal({ isOpen, onClose }: ServicesMenuModalProps) {
    const router = useRouter();
    const { t } = useTranslation();

    if (!isOpen) return null;

    const services = [
        // Carburant removed as requested
        {
            id: 'pool',
            name: t('menu.services.detente.title') || 'Espace Détente',
            icon: Waves,
            description: t('menu.services.detente.desc') || 'Piscine • Spa • Relaxation',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            route: '/services/pool'
        },
        {
            id: 'boutique',
            name: t('menu.services.boutique.title') || 'Boutique & Lubrifiants',
            icon: ShoppingBag,
            description: t('menu.services.boutique.desc') || 'Snacks • Huiles • Accessoires',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            route: '/services/lubrifiants'
        }
    ];

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end justify-center z-[70] animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-[#0F172A] rounded-t-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="sticky top-0 bg-[#0F172A]/90 backdrop-blur-xl p-6 border-b border-white/10 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-white text-2xl font-black tracking-tight">
                            {t('menu.services.title') || "Nos Services"}
                        </h2>
                        <p className="text-xs text-gray-400 font-medium">Golden Parc Station GPS</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Services Grid (Premium Design) */}
                    <div className="grid grid-cols-1 gap-3">
                        {services.map(service => (
                            <button
                                key={service.id}
                                onClick={() => {
                                    router.push(service.route);
                                    onClose();
                                }}
                                className={`group relative overflow-hidden rounded-2xl p-4 border ${service.border} ${service.bg} hover:bg-opacity-20 transition-all duration-300 text-left`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl ${service.bg} border border-white/5 flex items-center justify-center shadow-inner`}>
                                        <service.icon className={`w-7 h-7 ${service.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">
                                            {service.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">
                                            {service.description}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                    </div>
                                </div>
                            </button>
                        ))}

                    </div>

                </div>

                {/* Footer Info */}
                <div className="p-6 border-t border-white/5 bg-[#0A0F1C]">
                    <p className="text-gray-500 text-center text-xs font-medium flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {t('menu.services.footer') || "Services disponibles 24/7 sur place"}
                    </p>
                </div>

            </div>
        </div>
    );
};
