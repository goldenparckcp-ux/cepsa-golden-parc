"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Waves, Fuel, ChevronRight, Zap } from 'lucide-react';

interface ServicesMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ServicesMenuModal({ isOpen, onClose }: ServicesMenuModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const services = [
        {
            id: 'lavage',
            name: 'Lavage Auto',
            icon: Droplets,
            description: 'Express • Complet • Vapeur',
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            route: '/services/lavage'
        },
        // Carburant removed as requested
        {
            id: 'pool',
            name: 'Espace Détente',
            icon: Waves,
            description: 'Piscine • Spa • Relaxation',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            route: '/services/pool'
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
                        <h2 className="text-white text-2xl font-black tracking-tight">Nos Services</h2>
                        <p className="text-xs text-gray-400 font-medium">Cepsa Golden Parc</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Fuel Price Widget (Premium Ticker) */}
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1E293B]">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                    <Fuel className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-gray-400">Carburant</div>
                                    <div className="text-sm font-bold text-white">Prix du Jour</div>
                                </div>
                            </div>
                            <div className="flex gap-4 text-right">
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold">Gasoil</div>
                                    <div className="text-lg font-black text-amber-400">12.50 <span className="text-[10px]">DH</span></div>
                                </div>
                                <div className="w-px bg-white/10 h-8 self-center" />
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold">Sans Plomb</div>
                                    <div className="text-lg font-black text-green-400">14.20 <span className="text-[10px]">DH</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

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

                        {/* Coming Soon Placeholder */}
                        <div className="rounded-2xl p-4 border border-dashed border-white/10 bg-white/5 flex items-center gap-4 opacity-50">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-400">Plus de services...</h3>
                                <p className="text-[10px] text-gray-600">Bientôt disponible</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Info */}
                <div className="p-6 border-t border-white/5 bg-[#0A0F1C]">
                    <p className="text-gray-500 text-center text-xs font-medium flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Services disponibles 24/7 sur place
                    </p>
                </div>

            </div>
        </div>
    );
};
