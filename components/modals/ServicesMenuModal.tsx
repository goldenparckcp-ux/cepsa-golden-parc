"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

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
            icon: '🚿',
            description: 'Express • Complet • Vapeur',
            gradient: 'from-blue-500 to-cyan-500',
            route: '/services/lavage'
        },
        {
            id: 'mecanique',
            name: 'Mécanique',
            icon: '🔧',
            description: 'Vidange • Pneus • Freins',
            gradient: 'from-orange-500 to-red-500',
            route: '/services/mecanique'
        },
        {
            id: 'carburant',
            name: 'Carburant',
            icon: '⛽',
            description: 'Gasoil • Sans Plomb',
            gradient: 'from-green-500 to-emerald-500',
            route: '#' // Placeholder
        },
        {
            id: 'pool',
            name: 'Espace Détente',
            icon: '🏊',
            description: 'Piscine • Spa • Relaxation',
            gradient: 'from-purple-500 to-pink-500',
            route: '/services/pool'
        }
    ];

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in"
            onClick={onClose}
            style={{ zIndex: 100 }} // Ensure it's above everything
        >
            <div
                className="bg-[#0A1929] rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up border-t border-white/10"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="sticky top-0 bg-[#0A1929]/95 backdrop-blur-md p-6 border-b border-white/10 flex items-center justify-between z-10">
                    <h2 className="text-white text-2xl font-bold">Nos Services</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Services Grid */}
                <div className="p-6 grid grid-cols-2 gap-4">
                    {services.map(service => (
                        <div
                            key={service.id}
                            onClick={() => {
                                router.push(service.route);
                                onClose();
                            }}
                            className="cursor-pointer transform hover:scale-[1.03] active:scale-95 transition-all duration-200"
                        >
                            <div className={`bg-gradient-to-br ${service.gradient} rounded-2xl p-5 h-full flex flex-col items-center text-center shadow-lg border border-white/10`}>

                                {/* Icon */}
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 shadow-inner">
                                    <span className="text-3xl">{service.icon}</span>
                                </div>

                                {/* Name */}
                                <h3 className="text-white font-bold text-base mb-1 leading-tight">
                                    {service.name}
                                </h3>

                                {/* Description */}
                                <p className="text-white/90 text-[10px] mb-3 font-medium leading-normal opacity-90">
                                    {service.description}
                                </p>

                                {/* Arrow */}
                                <div className="mt-auto text-white/50 text-xl font-light">→</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="p-6 border-t border-white/5 bg-black/20">
                    <p className="text-gray-400 text-center text-xs font-medium">
                        💡 Tous nos services sont disponibles 24/7
                    </p>
                </div>

            </div>
        </div>
    );
};
