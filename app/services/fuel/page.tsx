"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Fuel } from 'lucide-react';
import { COLORS } from '@/lib/theme';

export default function FuelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.bgDark }}>
            <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 text-white mb-6">
                <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center justify-center text-center mt-10">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                    <Fuel className="w-12 h-12 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Station Service 24/7</h1>
                <p className="text-gray-400 mb-8 max-w-sm">
                    Carburant de qualité supérieure. Service rapide et professionnel sur piste.
                </p>

                <div className="w-full max-w-sm bg-[#1E293B] rounded-2xl p-6 border border-white/10">
                    <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2">Nos Carburants</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-bold">Gasoil 10ppm</span>
                            <span className="text-green-400 font-bold">Disponible</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-bold">Sans Plomb 95</span>
                            <span className="text-green-400 font-bold">Disponible</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-bold">Sans Plomb 98</span>
                            <span className="text-green-400 font-bold">Disponible</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl max-w-sm text-sm text-blue-200">
                    💡 Payez directement sur piste par Carte ou Espèces.
                </div>
            </div>
        </div>
    );
}
