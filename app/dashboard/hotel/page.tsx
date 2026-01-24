"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BedDouble, CheckCircle, Clock, Moon, Phone, User, Key, LogOut } from 'lucide-react';

export default function HotelDashboard() {
    const [reservations, setReservations] = useState<any[]>([]);

    const fetchReservations = async () => {
        const { data } = await supabase
            .from('hotel_reservations')
            .select('*')
            .order('check_in_time', { ascending: true });
        if (data) setReservations(data);
    };

    useEffect(() => {
        fetchReservations();
        const sub = supabase.channel('hotel_dash').on('postgres_changes', { event: '*', schema: 'public', table: 'hotel_reservations' }, fetchReservations).subscribe();
        return () => { sub.unsubscribe(); };
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const update: any = { status };
        if (status === 'checked_in') update.checked_in_at = new Date().toISOString();
        if (status === 'checked_out') update.checked_out_at = new Date().toISOString();

        await supabase.from('hotel_reservations').update(update).eq('id', id);
        fetchReservations();
    };

    // Stats
    const occupied = reservations.filter(r => r.status === 'checked_in').length;
    const reserved = reservations.filter(r => r.status === 'reserved').length;
    const completed = reservations.filter(r => r.status === 'checked_out').length;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">

            <header className="flex items-center justify-between mb-8 bg-gray-800 p-4 rounded-2xl border border-gray-700">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🛌</span>
                    <div>
                        <h1 className="text-2xl font-bold">Hôtel Dashboard</h1>
                        <p className="text-gray-400 text-sm">Réception & Chambres</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-amber-500/20 px-6 py-2 rounded-xl text-center border border-amber-500/40">
                        <div className="text-2xl font-bold text-amber-500">{reserved}</div>
                        <div className="text-xs uppercase font-bold text-amber-500/80">Réservations</div>
                    </div>
                    <div className="bg-purple-500/20 px-6 py-2 rounded-xl text-center border border-purple-500/40">
                        <div className="text-2xl font-bold text-purple-500">{occupied}</div>
                        <div className="text-xs uppercase font-bold text-purple-500/80">Occupées</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {reservations.map(res => (
                    <div key={res.id} className={`relative bg-gray-800 rounded-3xl p-6 border-2 transition-all ${res.status === 'checked_in' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]' :
                            res.status === 'checked_out' ? 'border-gray-700 opacity-60' : 'border-amber-500'
                        }`}>

                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-700">
                                <span className="text-xs text-gray-500 uppercase font-bold block">Chambre</span>
                                <span className="text-2xl font-black text-white">{res.room_number}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${res.status === 'checked_in' ? 'bg-purple-500 text-white' :
                                    res.status === 'checked_out' ? 'bg-gray-600 text-gray-300' : 'bg-amber-500 text-black'
                                }`}>
                                {res.status}
                            </span>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Client</div>
                                    <div className="text-xs text-gray-400 font-mono">{res.customer_phone}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Arrivée</div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(res.check_in_time).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900/50 p-3 rounded-xl flex items-center justify-between border border-gray-700">
                                <div className="flex items-center gap-2">
                                    {res.duration === 'full_night' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Clock className="w-4 h-4 text-orange-400" />}
                                    <span className="text-sm font-bold capitalize">{res.duration === 'full_night' ? 'Nuit' : 'Repos'}</span>
                                </div>
                                <span className="text-sm font-bold">{res.room_type}</span>
                            </div>
                        </div>

                        {res.status === 'reserved' && (
                            <button
                                onClick={() => updateStatus(res.id, 'checked_in')}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition"
                            >
                                <Key className="w-5 h-5" /> Check-in
                            </button>
                        )}

                        {res.status === 'checked_in' && (
                            <button
                                onClick={() => updateStatus(res.id, 'checked_out')}
                                className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition"
                            >
                                <LogOut className="w-5 h-5" /> Check-out
                            </button>
                        )}

                    </div>
                ))}
            </div>
        </div>
    );
}
