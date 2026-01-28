"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Waves, CheckCircle, Clock, Users, Phone, Calendar, Droplets } from 'lucide-react';

// Pricing Constants (for verification/display if needed)
// const POOL_PRICING = { ... };

export default function PoolStaffDashboard() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState('today'); // today, upcoming, all
    const [stats, setStats] = useState({ visitors: 0, revenue: 0, active: 0 });

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/admin/data?type=pool', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();

                // Sort by booking_date ASC (Client side because API returns created_at DESC)
                const sorted = data.sort((a: any, b: any) => (a.booking_date || '').localeCompare(b.booking_date || ''));
                setBookings(sorted);

                // Calculate Stats for Today
                const today = new Date().toISOString().split('T')[0];
                const todayBookings = data.filter((b: any) => b.booking_date === today && b.status !== 'cancelled');

                setStats({
                    visitors: todayBookings.reduce((acc: number, b: any) => acc + (b.adults || 0) + (b.children || 0), 0),
                    revenue: todayBookings.reduce((acc: number, b: any) => acc + (b.total_price || 0), 0),
                    active: todayBookings.filter((b: any) => b.status === 'checked_in').length
                });
            }
        } catch (err) {
            console.error("API error:", err);
        }
    };

    useEffect(() => {
        fetchBookings();
        const sub = supabase.channel('pool_dash')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pool_bookings' }, fetchBookings)
            .subscribe();

        // Polling (5s)
        const interval = setInterval(fetchBookings, 5000);
        return () => { sub.unsubscribe(); clearInterval(interval); };
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const update: any = { status };
        if (status === 'checked_in') update.checked_in_at = new Date().toISOString();
        if (status === 'completed') update.completed_at = new Date().toISOString();

        // Optimistic update
        setBookings(bookings.map(b => b.id === id ? { ...b, ...update, status } : b));

        await fetch('/api/admin/data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type: 'pool', ...update })
        });
        fetchBookings();
    };


    // Filter Logic
    const getFilteredBookings = () => {
        const today = new Date().toISOString().split('T')[0];
        return bookings.filter(b => {
            if (filter === 'today') return b.booking_date === today;
            if (filter === 'upcoming') return b.booking_date > today;
            return true; // all
        });
    };

    const filtered = getFilteredBookings();

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-6 font-sans">

            {/* Header & KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-2 bg-[#1E293B] p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-500/20 p-3 rounded-xl text-red-400">
                            <Waves className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">PISCINE</h1>
                            <p className="text-gray-400 font-medium">Contrôle d'Accès</p>
                        </div>
                    </div>
                    <div className="flex bg-[#0F172A] rounded-lg p-1 border border-white/5">
                        {['today', 'upcoming', 'all'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition ${filter === f ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                {f === 'today' ? "Aujourd'hui" : f === 'upcoming' ? 'Futur' : 'Tout'}
                            </button>
                        ))}
                    </div>
                </div>

                <KPICard icon={<Users />} label="Visiteurs (Ce jour)" value={stats.visitors} color="text-red-400" bg="bg-red-500/10" />
                <KPICard icon={<Droplets />} label="Actifs (Baignade)" value={stats.active} color="text-green-400" bg="bg-green-500/10" />
            </div>

            {/* Bookings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500 font-medium bg-[#1E293B]/50 rounded-3xl border border-white/5 border-dashed">
                        Aucune réservation trouvée pour ce filtre.
                    </div>
                )}

                {filtered.map(b => (
                    <div key={b.id} className={`relative bg-[#1E293B] rounded-3xl p-6 border-2 transition-all group ${b.status === 'checked_in' ? 'border-red-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]' :
                        b.status === 'completed' ? 'border-gray-800 opacity-60' : 'border-red-500/30 hover:border-red-500'
                        }`}>

                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-mono font-black text-xl text-white tracking-tight">#{b.booking_number}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase">
                                    <Calendar className="w-3 h-3" /> {new Date(b.booking_date).toLocaleDateString()}
                                    <span>•</span>
                                    <span>{b.time_slot === 'morning' ? 'Matin' : b.time_slot === 'afternoon' ? 'Aprèm' : 'Journée'}</span>
                                </div>
                            </div>
                            <StatusBadge status={b.status} />
                        </div>

                        {/* Details */}
                        <div className="space-y-4 mb-6">
                            {/* Ambiance */}
                            <div className="flex items-center justify-between bg-[#0F172A] p-3 rounded-xl border border-white/5">
                                <span className="text-xs font-bold text-gray-400 uppercase">Ambiance</span>
                                <span className={`text-sm font-bold capitalize px-2 py-1 rounded ${b.ambiance === 'famille' ? 'bg-red-500/20 text-red-400' :
                                    b.ambiance === 'femmes' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-green-500/20 text-green-400'
                                    }`}>
                                    {b.ambiance || 'Standard'}
                                </span>
                            </div>

                            {/* Guests */}
                            <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-xs text-gray-500 font-bold mb-1">Adultes</div>
                                    <div className="font-mono font-bold text-white text-lg">{b.adults || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-bold mb-1">Enfants</div>
                                    <div className="font-mono font-bold text-white text-lg">{b.children || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-bold mb-1">Bébés</div>
                                    <div className="font-mono font-bold text-white text-lg">{b.infants || 0}</div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="flex items-center gap-3 pl-2">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase">Client</div>
                                    <div className="text-sm font-bold text-gray-300 font-mono tracking-wide">
                                        {b.customer_phone || b.customer_email || b.email || 'Non renseigné'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-white/5">
                            {(b.status === 'pending' || b.status === 'confirmed') && (
                                <button
                                    onClick={() => updateStatus(b.id, 'checked_in')}
                                    className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> CHECK-IN
                                </button>
                            )}

                            {b.status === 'checked_in' && (
                                <button
                                    onClick={() => updateStatus(b.id, 'completed')}
                                    className="w-full py-3 bg-gray-700 hover:bg-red-900/50 hover:text-red-400 text-gray-300 rounded-xl font-bold transition flex items-center justify-center gap-2"
                                >
                                    CHECK-OUT
                                </button>
                            )}

                            {b.status === 'completed' && (
                                <div className="text-center text-xs font-bold text-gray-500 uppercase py-3 bg-[#0F172A] rounded-xl border border-white/5">
                                    Visite Terminée
                                </div>
                            )}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}

function KPICard({ icon, label, value, color, bg }: any) {
    return (
        <div className={`p-6 rounded-2xl border border-white/5 flex flex-col justify-between ${bg}`}>
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xl ${color}`}>{icon}</span>
            </div>
            <div>
                <div className={`text-3xl font-black ${color}`}>{value}</div>
                <div className={`text-xs font-bold uppercase opacity-60 ${color}`}>{label}</div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: 'bg-red-500/20 text-red-400',
        active: 'bg-red-500/20 text-red-400',
        checked_in: 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30',
        completed: 'bg-gray-700/50 text-gray-500',
        cancelled: 'bg-red-500/20 text-red-500'
    };
    // @ts-ignore
    const style = styles[status] || styles.pending;

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${style}`}>
            {status === 'active' ? 'Confirmé' : status.replace('_', ' ')}
        </span>
    );
}
