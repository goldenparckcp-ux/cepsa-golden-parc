"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, ChevronLeft, ChevronRight, Droplets, Wrench, Phone, Car, AlertTriangle } from 'lucide-react';

export default function ServicesDashboard() {
    const [tab, setTab] = useState<'lavage' | 'mecanique'>('lavage');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    interface ServiceBooking {
        id: string;
        service_type?: string;
        booking_date?: string;
        date?: string;
        start_date?: string;
        scheduled_at?: string;
        scheduled_date?: string;
        time_slot?: string;
        service_name?: string;
        vehicle_info?: string;
        customer_phone?: string;
        customer_email?: string;
        email?: string;
        status?: string;
        appointment_type?: string;
        notes?: string;
        vehicle_type?: string;
        license_plate?: string;
        matricule?: string;
        created_at?: string;
    }

    const [bookings, setBookings] = useState<ServiceBooking[]>([]);

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/data?type=services', { cache: 'no-store' });
            if (res.ok) {
                const allData = await res.json();

                // CLIENT-SIDE FILTERING
                let filtered: ServiceBooking[] = [];
                if (tab === 'lavage') {
                    filtered = allData.filter((b: ServiceBooking) => {
                        // Type Check (loose)
                        const typeMatch = (b.service_type || '').toLowerCase() === 'lavage';

                        // Date Check (robust)
                        // definedDate might be "2024-01-28", "2024-01-28T10:00:00", etc.
                        const bDate = b.booking_date || b.date || b.start_date || b.scheduled_at || b.scheduled_date || '';
                        const dateMatch = bDate.startsWith(selectedDate);

                        return typeMatch && dateMatch;
                    }).sort((a: ServiceBooking, b: ServiceBooking) => (a.time_slot || '').localeCompare(b.time_slot || ''));
                } else {
                    // Mecanique: All upcoming
                    filtered = allData.filter((b: ServiceBooking) => (b.service_type || '').toLowerCase() === 'mecanique')
                        .sort((a: ServiceBooking, b: ServiceBooking) => (a.scheduled_at || '').localeCompare(b.scheduled_at || ''));
                }

                setBookings(filtered);
            }
        } catch (err) {
            console.error("API error:", err);
        }
    }, [tab, selectedDate]);

    useEffect(() => {
        fetchBookings();
        const sub = supabase.channel('services_dash')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings' }, () => fetchBookings())
            .subscribe();

        // Polling (5s)
        const interval = setInterval(fetchBookings, 5000);
        return () => { sub.unsubscribe(); clearInterval(interval); };
    }, [fetchBookings]);

    const updateStatus = async (id: string, status: string) => {
        // Optimistic
        setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));

        await fetch('/api/admin/data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type: 'services', status })
        });
        fetchBookings();
    };

    // Timeline Slots for Lavage
    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-6 font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-[#1E293B] p-6 rounded-3xl border border-white/10 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`p-3 rounded-2xl ${tab === 'lavage' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {tab === 'lavage' ? <Droplets className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">ATELIER AUTO</h1>
                        <p className="text-gray-400 font-medium text-sm">Planning & Opérations</p>
                    </div>
                </div>

                <div className="flex bg-[#0F172A] p-1.5 rounded-xl border border-white/5 w-full md:w-auto">
                    <button
                        onClick={() => setTab('lavage')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${tab === 'lavage' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Droplets className="w-4 h-4" /> Lavage
                    </button>
                    <button
                        onClick={() => setTab('mecanique')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${tab === 'mecanique' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Wrench className="w-4 h-4" /> Mécanique
                    </button>
                </div>
            </div>

            {/* LAVAGE VIEW */}
            {tab === 'lavage' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Date Nav */}
                    <div className="flex items-center justify-center gap-8 mb-8 bg-[#1E293B] p-4 rounded-full border border-white/10 w-fit mx-auto">
                        <button onClick={() => changeDate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition" aria-label="Previous day">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-black min-w-[200px] text-center capitalize">
                            {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
                        </h2>
                        <button onClick={() => changeDate(1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition" aria-label="Next day">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Timeline Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {timeSlots.map(slot => {
                            // Robust Time Slot Matching
                            // Matches "09:00" with "9:00", "09:00:00", etc.
                            const booking = bookings.find(b => {
                                if (!b.time_slot) return false;
                                return b.time_slot.startsWith(slot) || slot.startsWith(b.time_slot) || b.time_slot.replace(/^0/, '') === slot.replace(/^0/, '');
                            });

                            return (
                                <div
                                    key={slot}
                                    className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col justify-between min-h-[160px] ${booking
                                        ? booking.status === 'completed' ? 'bg-[#1E293B]/50 border-gray-700/50 opacity-60' // Done
                                            : booking.status === 'in_progress' ? 'bg-blue-900/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' // Active
                                                : 'bg-cyan-900/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' // Scheduled
                                        : 'bg-[#1E293B] border-white/5 hover:border-white/10' // Empty
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className={`text-lg font-black ${booking ? 'text-white' : 'text-gray-600'}`}>{slot}</div>
                                        {booking && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${booking.status === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-cyan-500 text-white'
                                                }`}>
                                                {booking.status === 'in_progress' ? 'EN COURS' : booking.status === 'completed' ? 'TERMINÉ' : 'EN ATTENTE'}
                                            </span>
                                        )}
                                    </div>

                                    {booking ? (
                                        <div className="mt-3">
                                            <div className="text-sm font-bold text-gray-200 truncate">{booking.service_name || 'Lavage Standard'}</div>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                <Car className="w-3 h-3" /> {booking.vehicle_info || 'Non spécifié'}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                                <Phone className="w-3 h-3" /> {booking.customer_phone || booking.customer_email || booking.email || 'Non renseigné'}
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
                                                {(booking.status === 'scheduled' || booking.status === 'pending') && (
                                                    <button onClick={() => updateStatus(booking.id, 'in_progress')} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-black shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition">COMMENCER</button>
                                                )}
                                                {booking.status === 'in_progress' && (
                                                    <button onClick={() => updateStatus(booking.id, 'completed')} className="flex-1 py-2 bg-gray-700 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-xs font-black shadow-lg transition">TERMINER</button>
                                                )}
                                                {booking.status === 'completed' && <div className="w-full text-center text-xs font-bold text-green-500">✅ Terminé</div>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center flex-1 opacity-20 hover:opacity-40 transition">
                                            <span className="text-2xl font-black text-gray-500">+</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* MECANIQUE VIEW */}
            {tab === 'mecanique' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {bookings.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500 font-medium">Aucun rendez-vous mécanique trouvé.</div>
                    )}

                    {bookings.map(booking => {
                        // Safe Date Parsing
                        const dateStr = booking.scheduled_at || booking.scheduled_date || booking.date || booking.booking_date || booking.created_at || '';
                        const dateObj = new Date(dateStr);
                        const isValidDate = !isNaN(dateObj.getTime()) && dateObj.getFullYear() > 1970;
                        const finalDate = isValidDate ? dateObj.toLocaleDateString('fr-FR') : 'Date à confirmer';

                        // Safe Status
                        const statusLabel = booking.status === 'in_progress' ? 'EN COURS' : booking.status === 'completed' ? 'TERMINÉ' : 'EN ATTENTE';
                        const statusStyle = booking.status === 'in_progress' ? 'bg-orange-500 text-black animate-pulse' : 'bg-orange-500/10 text-orange-400';

                        return (
                            <div key={booking.id} className="bg-[#1E293B] rounded-3xl border-2 border-orange-500/20 hover:border-orange-500/50 p-6 relative overflow-hidden transition-all group">
                                {booking.appointment_type === 'urgence' && (
                                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-lg">
                                        Urgence
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-black text-xl text-white">#{booking.id.slice(0, 4)}</h3>
                                        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mt-1 uppercase">
                                            <Calendar className="w-3 h-3" />
                                            {finalDate}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${statusStyle}`}>
                                        {statusLabel}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase font-black mb-2">Prestation</div>
                                        <div className="font-bold text-gray-200 text-sm">
                                            {booking.service_name || 'Entretien Général'}
                                        </div>
                                        {booking.notes && (
                                            <div className="mt-2 text-xs text-yellow-500 italic flex gap-1">
                                                <AlertTriangle className="w-3 h-3" /> &ldquo;{booking.notes}&rdquo;
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 text-sm pl-1">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <span className="font-mono font-bold">{booking.customer_phone || booking.customer_email || booking.email || 'Non renseigné'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Car className="w-4 h-4 text-gray-500" />
                                                <span className="font-bold">
                                                    {booking.vehicle_info || 'Véhicule Inconnu'}
                                                    {booking.vehicle_type && <span className="opacity-50 ml-1">({booking.vehicle_type})</span>}
                                                </span>
                                            </div>
                                            {/* Matricule Row */}
                                            <div className="flex items-center gap-3 text-gray-300 ml-7">
                                                <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest border border-white/5 text-gray-400">
                                                    {booking.license_plate || booking.matricule || 'Matricule ?'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-white/5">
                                    {(booking.status === 'scheduled' || booking.status === 'pending') && (
                                        <button onClick={() => updateStatus(booking.id, 'in_progress')} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-black shadow-lg shadow-orange-900/20 active:scale-[0.98] transition">COMMENCER</button>
                                    )}
                                    {booking.status === 'in_progress' && (
                                        <button onClick={() => updateStatus(booking.id, 'completed')} className="flex-1 py-3 bg-gray-700 hover:bg-red-900/50 hover:text-red-400 rounded-xl font-black shadow-lg transition">TERMINER</button>
                                    )}
                                    {booking.status === 'completed' && (
                                        <button className="w-full py-3 bg-gray-700/50 text-gray-500 rounded-xl font-bold cursor-not-allowed">Archivé</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
