"use client";

import React, { useState } from 'react';
import { Waves, QrCode, Ticket, Users, Check } from 'lucide-react';

const MOCK_TICKETS = [
    { id: 'POOL-8821', name: 'Sara Bennani', type: 'Famille', guests: '2 Adultes, 2 Enfants', time: '14:30', status: 'valid' },
    { id: 'POOL-8822', name: 'Omar Kabbaj', type: 'Mixte', guests: '2 Adultes', time: '14:35', status: 'valid' },
];

export default function PoolAdmin() {
    const [tickets, setTickets] = useState(MOCK_TICKETS);
    const [scanResult, setScanResult] = useState<string | null>(null);

    const handleScan = () => {
        // Simulation of QR Scan
        setScanResult('Scan Réussi ! Ticket #POOL-9999 Validé.');
        setTimeout(() => setScanResult(null), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Waves className="text-cyan-400 w-8 h-8" /> Entrées Piscine
                </h1>
                <button
                    onClick={handleScan}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                >
                    <QrCode className="w-5 h-5" /> SCAN TICKET
                </button>
            </div>

            {/* Scan Feedback */}
            {scanResult && (
                <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-xl font-bold text-center animate-in zoom-in">
                    {scanResult}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-gray-400 text-xs font-bold uppercase">Personnes Sur Place</h3>
                    <div className="text-3xl font-black text-white mt-1">42 <span className="text-sm font-medium text-gray-500">/ 100</span></div>
                    <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-cyan-500 h-full w-[42%]"></div>
                    </div>
                </div>
                <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-gray-400 text-xs font-bold uppercase">Chiffre Journée</h3>
                    <div className="text-3xl font-black text-white mt-1">3,450 DH</div>
                </div>
                <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-gray-400 text-xs font-bold uppercase">Créneau Actuel</h3>
                    <div className="text-xl font-black text-white mt-1">Après-Midi</div>
                    <div className="text-cyan-400 text-xs font-bold">14:00 - 19:00</div>
                </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-[#1E293B] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 font-bold text-white">Dernières Entrées</div>
                <div className="divide-y divide-white/5">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <div className="text-white font-bold">{ticket.name}</div>
                                    <div className="text-gray-500 text-xs flex items-center gap-2">
                                        <span className="bg-white/10 px-1.5 rounded text-gray-300">{ticket.id}</span>
                                        • {ticket.guests}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-mono font-bold">{ticket.time}</div>
                                <div className="text-green-500 text-xs font-bold flex items-center justify-end gap-1">
                                    <Check className="w-3 h-3" /> Validé
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
