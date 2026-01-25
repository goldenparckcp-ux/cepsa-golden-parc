"use client";

import React, { useState } from 'react';
import { Wrench, Calendar, MessageSquare, Clock, User, AlertTriangle } from 'lucide-react';

const MOCK_RDV = [
    {
        id: 'MECA-501',
        client: 'Hassan El Amrani',
        phone: '0661xxxxxx',
        car: 'Peugeot 208',
        plate: '4588-A-40',
        type: 'Vidange Complet',
        time: '09:00 - 10:00',
        observation: '',
        status: 'confirmed'
    },
    {
        id: 'MECA-502',
        client: 'Karim Tazi',
        phone: '0663xxxxxx',
        car: 'Golf 8',
        plate: '11223-H-1',
        type: 'Diagnostic Auto',
        time: '14:00 - 14:30',
        observation: 'Bruit bizarre coté droit quand je freine.',
        status: 'confirmed'
    },
];

export default function MecaniqueAdmin() {
    const [rdvs, setRdvs] = useState(MOCK_RDV);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Wrench className="text-orange-500 w-8 h-8" /> Atelier Mécanique
                </h1>
                <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-200 font-bold text-sm">Aujourd'hui</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rdvs.map(rdv => (
                    <div key={rdv.id} className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 relative group hover:border-orange-500/50 transition-colors">

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">{rdv.type}</div>
                                <h3 className="text-2xl font-black text-white">{rdv.car}</h3>
                                <div className="text-gray-400 font-mono text-sm mt-1 bg-white/5 inline-block px-2 rounded border border-white/5">{rdv.plate}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">{rdv.time.split(' - ')[0]}</div>
                                <div className="text-xs text-gray-500 font-bold">Jusqu'à {rdv.time.split(' - ')[1]}</div>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl mb-4 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm">{rdv.client}</div>
                                <div className="text-gray-500 text-xs">{rdv.phone}</div>
                            </div>
                        </div>

                        {/* Observation Alert */}
                        {rdv.observation && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-red-200 font-bold text-xs uppercase mb-1">Observation Client</div>
                                    <p className="text-red-100/80 text-sm italic">"{rdv.observation}"</p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">
                                Détails
                            </button>
                            <button className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20">
                                Commencer
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
