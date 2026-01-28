"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BedDouble, Clock, Moon, User, Key, LogOut, Calendar } from 'lucide-react';

export default function HotelDashboard() {
    interface Reservation {
        id: string;
        status: string;
        created_at: string;
        total_price?: number;
        room_number?: string;
        room_id?: string;
        room?: string;
        check_in_at?: string;
        check_in?: string;
        start_date?: string;
        date?: string;
        check_out_at?: string;
        check_out?: string;
        end_date?: string;
        full_name?: string;
        name?: string;
        customer_phone?: string;
        phone?: string;
        room_type?: string;
        type?: string;
    }

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filter, setFilter] = useState('all'); // today, future, all

    const fetchReservations = React.useCallback(async () => {
        try {
            const res = await fetch('/api/admin/data?type=hotel', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setReservations(data);
            }
        } catch (err) {
            console.error("API error:", err);
        }
    }, []);


    useEffect(() => {
        void Promise.resolve().then(() => fetchReservations());
        // Keep best-effort realtime
        const sub = supabase.channel('hotel_dash')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'hotel_reservations' }, () => fetchReservations())
            .subscribe();

        // Add Polling (5s) because RLS likely blocks realtime
        const interval = setInterval(fetchReservations, 5000);
        return () => { sub.unsubscribe(); clearInterval(interval); };
    }, [fetchReservations]);

    const updateStatus = async (id: string, status: string, assignedRoom?: string) => {
        const update: Partial<Reservation> = { status };
        if (status === 'checked_in') {
            update.check_in_at = new Date().toISOString();
            if (assignedRoom) update.room_number = assignedRoom;
        }
        if (status === 'checked_out') update.check_out_at = new Date().toISOString();

        // Optimistic
        setReservations(reservations.map(r => r.id === id ? { ...r, ...update, status } : r));

        await fetch('/api/admin/data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type: 'hotel', ...update })
        });
        fetchReservations();
    };

    // Helper to resolve potential column mismatches
    const getCheckIn = (r: Reservation) => r.check_in_at || r.check_in || r.start_date || r.date || null;
    const getCheckOut = (r: Reservation) => r.check_out_at || r.check_out || r.end_date || null;
    const getRoomNum = (r: Reservation) => r.room_number || r.room_id || r.room || '?';
    const getStatus = (r: Reservation) => r.status || 'reserved';

    // Filter Logic
    const getFilteredReservations = () => {
        const today = new Date().toISOString().split('T')[0];
        return reservations.filter(r => {
            const checkIn = getCheckIn(r);
            if (filter === 'all') return true;
            if (!checkIn) return false;

            const rDate = checkIn.split('T')[0];
            if (filter === 'today') return rDate === today;
            if (filter === 'future') return rDate > today;
            return true;
        });
    };

    const filtered = getFilteredReservations();

    // --- SMART ROOM ASSIGNMENT LOGIC ---
    const ROOMS = Array.from({ length: 10 }, (_, i) => (101 + i).toString());

    // 1. Find all currently occupied rooms
    const occupiedRooms = new Set(reservations
        .filter(r => getStatus(r) === 'checked_in')
        .map(r => getRoomNum(r)?.toString())
        .filter(Boolean)
    );

    // 2. Identify available rooms
    const availableRooms = ROOMS.filter(r => !occupiedRooms.has(r));

    // 3. Map assignments for pending reservations
    // We sort pending reservations to assign consistently
    const pendingReservations = reservations
        .filter(r => (getStatus(r) === 'reserved' || getStatus(r) === 'pending') && !getRoomNum(r))
        .sort((a, b) => (getCheckIn(a) || '').localeCompare(getCheckIn(b) || ''));

    const assignments = new Map();
    pendingReservations.forEach((r, idx) => {
        if (idx < availableRooms.length) {
            assignments.set(r.id, availableRooms[idx]);
        }
    });

    // Stats
    const occupiedCount = reservations.filter(r => getStatus(r) === 'checked_in').length;

    const reservedToday = reservations.filter(r => {
        const checkIn = getCheckIn(r);
        const st = getStatus(r);
        const isPending = st === 'reserved' || st === 'pending';
        return isPending && checkIn && checkIn.split('T')[0] === new Date().toISOString().split('T')[0];
    }).length;

    // Helper to calculate duration text
    const getDurationText = (start: string | null, end: string | null) => {
        if (!start || !end) return 'Durée inconnue';
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        const diffHours = (e - s) / (1000 * 60 * 60);

        if (diffHours >= 20) {
            const nights = Math.max(1, Math.round(diffHours / 24));
            return `${nights} Nuit${nights > 1 ? 's' : ''}`;
        }
        return `${Math.max(1, Math.round(diffHours))} Heure${Math.round(diffHours) > 1 ? 's' : ''}`;
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-6 font-sans">
            {/* ... Header & Stats ... */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* ... (Keep existing Header code) ... */}
                <div className="md:col-span-2 bg-[#1E293B] p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400">
                            <BedDouble className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">RÉCEPTION HÔTEL</h1>
                            <p className="text-gray-400 font-medium text-sm">Gestion des Chambres (10 Suites)</p>
                        </div>
                    </div>

                    <div className="flex bg-[#0F172A] p-1 rounded-xl border border-white/5 w-full md:w-auto">
                        {['today', 'future', 'all'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${filter === f ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                {f === 'today' ? "Aujourd'hui" : f === 'future' ? 'À Venir' : 'Tout'}
                            </button>
                        ))}
                    </div>
                </div>

                <KPICard value={reservedToday} label="Arrivées prévues" indent="Ce soir" color="text-amber-500" bg="bg-amber-500/10" />
                <KPICard value={occupiedCount} label="Chambres Occupées" indent={`${10 - occupiedCount} Libres`} color="text-purple-500" bg="bg-purple-500/10" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500 font-medium bg-[#1E293B]/50 rounded-3xl border border-white/5 border-dashed">
                        Aucune réservation pour ce filtre.
                    </div>
                )}

                {filtered.map(res => {
                    const status = getStatus(res);
                    // Normalize status for logic: 'pending' same as 'reserved' for us here
                    const isPending = status === 'reserved' || status === 'pending';
                    const originalRoomNum = getRoomNum(res);
                    const checkIn = getCheckIn(res);
                    const checkOut = getCheckOut(res);
                    const durationText = getDurationText(checkIn, checkOut);
                    const isNight = durationText.includes('Nuit');

                    // Smart Room Assignment
                    const suggestedRoom = assignments.get(res.id);
                    const displayRoom = originalRoomNum || suggestedRoom || '?';
                    const isSuggestion = !originalRoomNum && suggestedRoom;

                    // Display Status Translation
                    let statusDisplay = status;
                    let statusColor = 'bg-amber-500 text-black';

                    if (status === 'checked_in') {
                        statusDisplay = 'OCUPPÉ';
                        statusColor = 'bg-purple-500 text-white animate-pulse';
                    } else if (status === 'checked_out') {
                        statusDisplay = 'TERMINÉ';
                        statusColor = 'bg-gray-700 text-gray-400';
                    } else if (isPending) {
                        statusDisplay = 'EN ATTENTE';
                        statusColor = 'bg-amber-500 text-black';
                    }

                    return (
                        <div key={res.id} className={`relative bg-[#1E293B] rounded-3xl p-6 border-2 transition-all group ${status === 'checked_in' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]' :
                            status === 'checked_out' ? 'border-gray-800 opacity-60' : 'border-amber-500/30 hover:border-amber-500'
                            }`}>

                            {/* Top Badge (Room & Status) */}
                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-4 py-2 rounded-xl border min-w-[80px] text-center ${isSuggestion ? 'bg-indigo-600/20 border-indigo-500 animate-pulse' : 'bg-[#0F172A] border-white/5'}`}>
                                    <span className={`text-[10px] uppercase font-black block mb-1 ${isSuggestion ? 'text-indigo-300' : 'text-gray-500'}`}>{isSuggestion ? 'Suggéré' : 'Chambre'}</span>
                                    <span className={`text-2xl font-black ${isSuggestion ? 'text-indigo-400' : 'text-white'}`}>{displayRoom}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColor}`}>
                                    {statusDisplay}
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4 mb-6">
                                {/* Customer */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-sm text-gray-200">{res.full_name || res.name || 'Client'}</div>
                                        <div className="text-xs text-gray-400 font-mono font-bold">{res.customer_phone || res.phone || 'Non renseigné'}</div>
                                    </div>
                                </div>

                                {/* Check-In */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-[10px] uppercase text-emerald-500 tracking-wider">Arrivée (Check-in)</div>
                                        <div className="text-sm font-black text-gray-200">
                                            {checkIn ? new Date(checkIn).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--/-- --:--'}
                                        </div>
                                    </div>
                                </div>

                                {/* Check-Out */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                                        <LogOut className="w-5 h-5 text-rose-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-[10px] uppercase text-rose-500 tracking-wider">Départ (Check-out)</div>
                                        <div className="text-sm font-black text-gray-200">
                                            {checkOut ? new Date(checkOut).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--/-- --:--'}
                                        </div>
                                    </div>
                                </div>

                                {/* Duration & Type Tag */}
                                <div className="bg-[#0F172A] p-3 rounded-xl flex items-center justify-between border border-white/5 mt-2">
                                    <div className="flex items-center gap-2">
                                        {isNight ? <Moon className="w-4 h-4 text-indigo-400" /> : <Clock className="w-4 h-4 text-orange-400" />}
                                        <span className={`text-xs font-black uppercase ${isNight ? 'text-indigo-300' : 'text-orange-300'}`}>
                                            {durationText}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 px-2 py-1 rounded bg-white/5">{res.room_type || res.type || 'Standard'}</span>
                                </div>
                            </div>


                            {/* Buttons */}
                            <div className="pt-2 border-t border-white/5 space-y-2">
                                {/* Fix for Checked In but No Room */}
                                {status === 'checked_in' && displayRoom === '?' && (
                                    <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/30 mb-2">
                                        <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Chambre Manquante</div>
                                        <div className="flex gap-2">
                                            <select
                                                aria-label="Assign Room"
                                                title="Assign Room"
                                                className="w-full bg-[#0F172A] text-white text-xs font-bold p-2 rounded border border-white/10 outline-none"
                                                onChange={(e) => updateStatus(res.id, 'checked_in', e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Choisir...</option>
                                                {availableRooms.map(r => (
                                                    <option key={r} value={r}>Chambre {r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {isPending && (
                                    <button
                                        onClick={() => updateStatus(res.id, 'checked_in', isSuggestion ? suggestedRoom : undefined)}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white shadow-lg shadow-purple-900/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
                                    >
                                        <Key className="w-5 h-5" />
                                        {isSuggestion ? `JOINDRE CHAMBRE ${suggestedRoom}` : 'CHECK-IN ASSIGNER'}
                                    </button>
                                )}

                                {status === 'checked_in' && (
                                    <button
                                        onClick={() => updateStatus(res.id, 'checked_out')}
                                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
                                    >
                                        <LogOut className="w-5 h-5" /> CHECK-OUT
                                    </button>
                                )}

                                {status === 'checked_out' && (
                                    <div className="w-full text-center text-xs font-bold text-gray-500 uppercase py-3">
                                        Séjour Terminé
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface KPICardProps {
    value: number | string;
    label: string;
    indent: string;
    color: string;
    bg: string;
}

function KPICard({ value, label, indent, color, bg }: KPICardProps) {
    return (
        <div className={`p-6 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center ${bg}`}>
            <div className={`text-4xl font-black mb-1 ${color}`}>{value}</div>
            <div className={`text-sm font-bold uppercase opacity-80 ${color}`}>{label}</div>
            <div className={`text-[10px] font-bold uppercase opacity-60 mt-1 ${color}`}>{indent}</div>
        </div>
    );
}
