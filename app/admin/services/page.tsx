"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, ChevronLeft, ChevronRight, Clock, Droplets, Wrench, Phone, CheckCircle, Car } from 'lucide-react';

export default function ServicesDashboard() {
    const [tab, setTab] = useState<'lavage' | 'mecanique'>('lavage');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookings, setBookings] = useState<any[]>([]);

    const fetchBookings = async () => {
        let query = supabase.from('service_bookings').select('*');

        if (tab === 'lavage') {
            query = query
                .eq('service_type', 'lavage')
                .eq('scheduled_date', selectedDate)
                .order('time_slot', { ascending: true });
        } else {
            // For mecanique, maybe show all upcoming? or just selected date? 
            // Prompt says "Date Selector" for Lavage but just "Bookings Grid" for Mecanique, but consistency suggests date filter or list.
            // I'll show all scheduled/in-progress for mecanique sorted by date to be safe, or filter by date.
            // Prompt "LavageSection" has date selector. "MecaniqueSection" has "BookingsGrid".
            // I'll keep date selector for Lavage, and maybe all active for Mecanique.
            query = query.eq('service_type', 'mecanique').order('scheduled_time', { ascending: true });
        }

        const { data } = await query;
        if (data) setBookings(data);
    };

    useEffect(() => {
        fetchBookings();
        const sub = supabase.channel('services_dash').on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings' }, fetchBookings).subscribe();
        return () => { sub.unsubscribe(); };
    }, [tab, selectedDate]);

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('service_bookings').update({ status }).eq('id', id);
        setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    };

    // Lavage Timeline (08:00 to 20:00)
    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">

            <header className="flex items-center justify-between mb-8 bg-gray-800 p-4 rounded-2xl border border-gray-700">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🚗</span>
                    <div>
                        <h1 className="text-2xl font-bold">Services Auto</h1>
                        <p className="text-gray-400 text-sm">Gestion Lavage & Mécanique</p>
                    </div>
                </div>

                <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700">
                    <button
                        onClick={() => setTab('lavage')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${tab === 'lavage' ? 'bg-cyan-500 text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Droplets className="w-4 h-4" /> Lavage
                    </button>
                    <button
                        onClick={() => setTab('mecanique')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${tab === 'mecanique' ? 'bg-orange-500 text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Wrench className="w-4 h-4" /> Mécanique
                    </button>
                </div>
            </header>

            {tab === 'lavage' && (
                <div className="animate-fade-in">
                    {/* Date Navigation */}
                    <div className="flex items-center justify-center gap-6 mb-8">
                        <button onClick={() => changeDate(-1)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold min-w-[200px] text-center">
                            {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h2>
                        <button onClick={() => changeDate(1)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {timeSlots.map(slot => {
                            const booking = bookings.find(b => b.time_slot === slot);
                            return (
                                <div
                                    key={slot}
                                    className={`relative p-4 rounded-2xl border transition-all ${booking
                                            ? booking.status === 'completed' ? 'bg-gray-800 border-gray-700 opacity-60'
                                                : booking.status === 'in_progress' ? 'bg-blue-900/20 border-blue-500/50'
                                                    : 'bg-cyan-900/20 border-cyan-500/50'
                                            : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="absolute top-4 right-4 text-sm font-black text-gray-500">{slot}</div>

                                    {booking ? (
                                        <div className="mt-2">
                                            <div className="text-lg font-bold text-white mb-1 truncate pr-8">{booking.service_name}</div>
                                            <div className="text-sm font-mono text-cyan-400 mb-2">{booking.booking_number}</div>

                                            <div className="space-y-1 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                                    <Car className="w-3 h-3" /> {booking.vehicle_info}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                                    <Phone className="w-3 h-3" /> {booking.customer_phone}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {booking.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => updateStatus(booking.id, 'in_progress')}
                                                        className="flex-1 py-2 bg-blue-600 rounded-lg text-xs font-bold"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {booking.status === 'in_progress' && (
                                                    <button
                                                        onClick={() => updateStatus(booking.id, 'completed')}
                                                        className="flex-1 py-2 bg-green-600 rounded-lg text-xs font-bold"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                {booking.status === 'completed' && (
                                                    <div className="w-full py-2 bg-gray-700 rounded-lg text-xs font-bold text-center text-gray-400">
                                                        Terminé
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center min-h-[120px]">
                                            <span className="text-gray-600 text-sm font-medium">Disponible</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 'mecanique' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {bookings.map(booking => (
                        <div key={booking.id} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 relative overflow-hidden">
                            {booking.appointment_type === 'urgence' && (
                                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                    Urgence
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-orange-400">#{booking.booking_number}</h3>
                                    <div className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(booking.scheduled_time).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="bg-gray-900 p-3 rounded-xl border border-gray-700">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Services</div>
                                    <div className="flex flex-wrap gap-2">
                                        {booking.services?.map((s: string) => (
                                            <span key={s} className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <Car className="w-4 h-4 text-gray-500" />
                                    <span>{booking.vehicle_info}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span>{booking.customer_phone}</span>
                                </div>

                                {booking.notes && (
                                    <div className="bg-yellow-900/20 border border-yellow-700/30 p-3 rounded-xl text-xs text-yellow-200 italic">
                                        "{booking.notes}"
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {booking.status === 'scheduled' && (
                                    <button
                                        onClick={() => updateStatus(booking.id, 'in_progress')}
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg transition"
                                    >
                                        Commencer
                                    </button>
                                )}
                                {booking.status === 'in_progress' && (
                                    <button
                                        onClick={() => updateStatus(booking.id, 'completed')}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold shadow-lg transition"
                                    >
                                        Terminer
                                    </button>
                                )}
                                {booking.status === 'completed' && (
                                    <button className="w-full py-3 bg-gray-700 text-gray-400 rounded-xl font-bold cursor-default">
                                        Terminé
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
