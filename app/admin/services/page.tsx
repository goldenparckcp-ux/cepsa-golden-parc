"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Droplets, Phone, Car } from 'lucide-react';

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

export default function ServicesDashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookings, setBookings] = useState<ServiceBooking[]>([]);

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/data?type=services', { cache: 'no-store' });
            if (res.ok) {
                const allData: ServiceBooking[] = await res.json();

                // CLIENT-SIDE FILTERING (Lavage Only)
                const filtered = allData.filter((b: ServiceBooking) => {
                    const typeMatch = (b.service_type || '').toLowerCase() === 'lavage';
                    const bDate = b.booking_date || b.date || b.start_date || b.scheduled_at || b.scheduled_date || '';
                    const dateMatch = bDate.startsWith(selectedDate);
                    return typeMatch && dateMatch;
                }).sort((a: ServiceBooking, b: ServiceBooking) => (a.time_slot || '').localeCompare(b.time_slot || ''));

                setBookings(filtered);
            }
        } catch (err) {
            console.error("API error:", err);
        }
    }, [selectedDate]);

    useEffect(() => {
        const init = async () => {
            await fetchBookings();
        };
        init();

        const sub = supabase.channel('services_dash')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings' }, () => fetchBookings())
            .subscribe();

        const interval = setInterval(fetchBookings, 5000);
        return () => {
            sub.unsubscribe();
            clearInterval(interval);
        };
    }, [fetchBookings]);

    const updateStatus = async (id: string, status: string) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));

        await fetch('/api/admin/data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type: 'services', status })
        });
        fetchBookings();
    };

    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-6 font-sans">

            <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-[#1E293B] p-6 rounded-3xl border border-white/10 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 rounded-2xl bg-red-500/20 text-red-400">
                        <Droplets className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">LAVAGE AUTO</h1>
                        <p className="text-gray-400 font-medium text-sm">Planning & Opérations</p>
                    </div>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {timeSlots.map(slot => {
                        const booking = bookings.find(b => {
                            if (!b.time_slot) return false;
                            return b.time_slot.startsWith(slot) || slot.startsWith(b.time_slot) || b.time_slot.replace(/^0/, '') === slot.replace(/^0/, '');
                        });

                        return (
                            <div
                                key={slot}
                                className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col justify-between min-h-[160px] ${booking
                                    ? booking.status === 'completed' ? 'bg-[#1E293B]/50 border-gray-700/50 opacity-60' // Done
                                        : booking.status === 'in_progress' ? 'bg-red-900/10 border-red-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' // Active
                                            : 'bg-cyan-900/10 border-red-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' // Scheduled
                                    : 'bg-[#1E293B] border-white/5 hover:border-white/10' // Empty
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`text-lg font-black ${booking ? 'text-white' : 'text-gray-600'}`}>{slot}</div>
                                    {booking && (
                                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-red-500 text-white">
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
                                                <button onClick={() => updateStatus(booking.id, 'in_progress')} className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-black shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition">COMMENCER</button>
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

        </div>
    );
}
