"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Waves, CheckCircle, Clock } from 'lucide-react';

export default function PoolStaffDashboard() {
    const [bookings, setBookings] = useState<any[]>([]);

    const fetchBookings = async () => {
        const { data } = await supabase
            .from('pool_bookings')
            .select('*')
            .order('booking_date', { ascending: true });
        if (data) setBookings(data);
    };

    useEffect(() => {
        fetchBookings();
        const sub = supabase.channel('pool_dash').on('postgres_changes', { event: '*', schema: 'public', table: 'pool_bookings' }, fetchBookings).subscribe();
        return () => { sub.unsubscribe(); };
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const update: any = { status };
        if (status === 'checked_in') update.checked_in_at = new Date().toISOString();
        if (status === 'completed') update.completed_at = new Date().toISOString();

        await supabase.from('pool_bookings').update(update).eq('id', id);
        fetchBookings();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex items-center justify-between mb-8 bg-gray-800 p-4 rounded-2xl border border-gray-700">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🏊</span>
                    <div>
                        <h1 className="text-2xl font-bold">Piscine Dashboard</h1>
                        <p className="text-gray-400 text-sm">Contrôle d'accès</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map(b => (
                    <div key={b.id} className={`bg-gray-800 rounded-3xl p-6 border-2 transition-all ${b.status === 'checked_in' ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]' :
                            b.status === 'completed' ? 'border-gray-700 opacity-60' : 'border-blue-500'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-mono font-bold text-lg">#{b.booking_number}</h3>
                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {b.booking_date} · {b.time_slot}
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${b.status === 'checked_in' ? 'bg-cyan-500 text-white' :
                                    b.status === 'completed' ? 'bg-gray-600 text-gray-300' : 'bg-blue-500 text-white'
                                }`}>
                                {b.status}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="bg-gray-900 border border-gray-700 p-3 rounded-xl">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-2">Invités</div>
                                <div className="flex justify-between font-mono text-sm">
                                    <span>Adultes: {b.adults}</span>
                                    <span>Enfants: {b.children}</span>
                                </div>
                            </div>
                            <div className="bg-gray-900 border border-gray-700 p-3 rounded-xl flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase font-bold">Total</span>
                                <span className="text-cyan-400 font-bold">{b.total_price} DH</span>
                            </div>
                            <div className="text-sm font-bold text-center border border-gray-700 rounded-xl p-2 bg-gray-900/50">
                                📱 {b.customer_phone}
                            </div>
                        </div>

                        {b.status === 'active' && (
                            <button
                                onClick={() => updateStatus(b.id, 'checked_in')}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold shadow-lg transition"
                            >
                                Valider Entrée
                            </button>
                        )}

                        {b.status === 'checked_in' && (
                            <button
                                onClick={() => updateStatus(b.id, 'completed')}
                                className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition"
                            >
                                Sortie / Terminé
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
