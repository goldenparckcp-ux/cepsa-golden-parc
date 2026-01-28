"use client";

import React, { useState, useEffect } from "react";
import { Droplets, Clock, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

const OPTIONS = [
    { id: "basic", label: "Lavage Rapide", price: 40, duration: "30 min", slots: 1 },
    { id: "complet", label: "Lavage Complet + Moteur", price: 80, duration: "1h", slots: 2 },
    { id: "premium", label: "Premium (Polissage)", price: 250, duration: "2h", slots: 4 },
];

const VEHICLE_TYPES = [
    { id: 'citadine', label: 'Citadine', multiplier: 1, icon: '🚗' },
    { id: 'berline', label: 'Berline', multiplier: 1.25, icon: '🚙' },
    { id: 'suv', label: '4x4 / SUV', multiplier: 1.5, icon: '🚜' },
    { id: 'camion', label: 'Utilitaire', multiplier: 2, icon: '🚛' }
];

// Generate Time Slots (09:00 to 20:00, 30min step)
const TIME_SLOTS: string[] = [];
for (let h = 9; h <= 20; h++) {
    TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== 20) TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:30`);
}

export default function LavagePage() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [carType, setCarType] = useState('citadine');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState("09:00");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    // Blocking Logic State
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [endTime, setEndTime] = useState<string | null>(null);

    const activeService = {
        name: "Lavage & Soin",
        image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800",
        options: OPTIONS
    };

    const selectedTypeInfo = VEHICLE_TYPES.find(t => t.id === carType) || VEHICLE_TYPES[0];
    const optionData = activeService.options.find(o => o.id === selectedOption);
    const baseOptionPrice = optionData?.price || 0;
    const selectedPrice = Math.round(baseOptionPrice * selectedTypeInfo.multiplier);

    // Helper: Calculate End Time based on slots
    const calculateEndTime = (start: string, slots: number) => {
        const [h, m] = start.split(':').map(Number);
        const totalMinutes = h * 60 + m + (slots * 30);
        const endH = Math.floor(totalMinutes / 60);
        const endM = totalMinutes % 60;
        return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    };

    // Update EndTime when Time or Option changes
    useEffect(() => {
        if (time && optionData) {
            setEndTime(calculateEndTime(time, optionData.slots));
        } else {
            setEndTime(null);
        }
    }, [time, optionData]);

    // --- REAL-TIME SLOT BLOCKING ---
    useEffect(() => {
        const fetchBookings = async () => {
            setBookedSlots([]);

            const { data, error } = await supabase
                .from('service_bookings')
                .select('time_slot')
                .eq('service_type', 'lavage')
                .eq('scheduled_date', date)
                .neq('status', 'cancelled');

            if (data) {
                const busy: string[] = [];
                data.forEach((booking: any) => {
                    if (booking.time_slot && booking.time_slot.includes(' - ')) {
                        const [startStr, endStr] = booking.time_slot.split(' - ');
                        const [sH, sM] = startStr.split(':').map(Number);
                        const [eH, eM] = endStr.split(':').map(Number);
                        const startMins = sH * 60 + sM;
                        const endMins = eH * 60 + eM;

                        for (let t = startMins; t < endMins; t += 30) {
                            const h = Math.floor(t / 60);
                            const m = t % 60;
                            const slotStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                            if (!busy.includes(slotStr)) busy.push(slotStr);
                        }
                    } else if (booking.time_slot) {
                        if (!busy.includes(booking.time_slot)) busy.push(booking.time_slot);
                    }
                });
                setBookedSlots(busy);
            }
        };

        fetchBookings();
    }, [date]);

    // --- Helpers for UI ---

    const isSlotInPast = (t: string) => {
        const today = new Date();
        const selectedDate = new Date(date);
        if (selectedDate.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)) return false;
        if (selectedDate.getTime() === today.getTime()) {
            const now = new Date();
            const [h, m] = t.split(':').map(Number);
            const slotTime = new Date();
            slotTime.setHours(h, m, 0, 0);
            return slotTime < now;
        }
        return true;
    };

    const isSlotBusy = (t: string) => bookedSlots.includes(t);

    const canSelectSlot = (startT: string) => {
        if (!optionData) return !isSlotBusy(startT) && !isSlotInPast(startT);

        const slotsNeeded = optionData.slots;
        const [h, m] = startT.split(':').map(Number);
        const startMins = h * 60 + m;

        for (let i = 0; i < slotsNeeded; i++) {
            const currentMins = startMins + (i * 30);
            const cH = Math.floor(currentMins / 60);
            const cM = currentMins % 60;
            const slotStr = `${cH.toString().padStart(2, '0')}:${cM.toString().padStart(2, '0')}`;

            if (isSlotBusy(slotStr) || isSlotInPast(slotStr) || (cH > 20) || (cH === 20 && cM > 0)) return false;
        }
        return true;
    };

    // --- AUTO-BOOKING LOGIC ---
    useEffect(() => {
        const attemptAutoBook = async () => {
            const pending = localStorage.getItem('pendingLavageBooking');
            if (!pending) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            if (!profile?.phone) return;

            const bookingData = JSON.parse(pending);
            setLoading(true);
            const bookingNum = `WASH-${Date.now().toString().slice(-6)}`;

            const { error } = await supabase.from('service_bookings').insert({
                booking_number: bookingNum,
                customer_phone: profile.phone,
                service_type: 'lavage',
                service_name: `${bookingData.optionId} (${bookingData.carType})`,
                scheduled_date: bookingData.date,
                time_slot: bookingData.time_range,
                price: bookingData.price,
                status: 'pending',
                user_id: user.id
            });

            if (!error) {
                setShowSuccess(bookingNum);
                localStorage.removeItem('pendingLavageBooking');
            }
            setLoading(false);
        };
        attemptAutoBook();
    }, []);

    const handleBooking = async () => {
        try {
            if (!selectedOption || !endTime) return;
            setLoading(true);

            const timeRange = `${time} - ${endTime}`;
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                const bookingData = {
                    optionId: selectedOption,
                    carType,
                    date,
                    time,
                    time_range: timeRange,
                    duration_slots: optionData?.slots,
                    price: selectedPrice
                };
                localStorage.setItem('pendingLavageBooking', JSON.stringify(bookingData));
                router.push('/profile?redirect=/services/lavage');
                return;
            }

            let userPhoneFromProfile = null;
            const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            userPhoneFromProfile = data?.phone || user.user_metadata?.phone;

            const bookingNum = `WASH-${Date.now().toString().slice(-6)}`;

            const { error } = await supabase.from('service_bookings').insert({
                booking_number: bookingNum,
                customer_phone: userPhoneFromProfile || null,
                service_type: 'lavage',
                service_name: `${selectedOption} (${carType})`,
                scheduled_date: date,
                time_slot: timeRange,
                price: selectedPrice,
                status: 'pending',
                user_id: user.id
            });

            if (error) {
                alert("Erreur: " + error.message);
            } else {
                setShowSuccess(bookingNum);
            }
        } catch (err: any) {
            console.error("Booking Error:", err);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-40 bg-[#0F172A]" style={{ backgroundColor: COLORS.bgDark }}>

            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 p-4 pt-6 md:px-8">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Lavage Auto</h1>
                </div>
            </div>

            <div className="p-5 md:p-8 space-y-6 max-w-5xl mx-auto">

                {/* Hero Image */}
                <div className="relative h-48 md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img src={activeService.image} className="w-full h-full object-cover transform md:hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                        <div className="bg-blue-600 text-white text-[10px] md:text-xs font-black px-2 py-0.5 md:px-3 md:py-1 rounded inline-block mb-1 shadow-lg">SOIN & SPRAY</div>
                        <h2 className="text-xl md:text-4xl font-black text-white">{activeService.name}</h2>
                    </div>
                </div>

                {/* 1. Vehicle Type Selector */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Type de Véhicule</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {VEHICLE_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setCarType(type.id)}
                                className={`p-3 md:p-6 rounded-xl border flex flex-col items-center gap-2 transition-all ${carType === type.id
                                    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20'
                                    : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                    }`}
                            >
                                <span className="text-2xl md:text-4xl">{type.icon}</span>
                                <span className={`text-xs md:text-sm font-bold ${carType === type.id ? 'text-white' : 'text-gray-300'}`}>{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Options Grid */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Choisir une Formule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {activeService.options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedOption(opt.id)}
                                className={`w-full p-4 md:p-6 rounded-xl border flex flex-col items-start justify-between transition-all gap-4 min-h-[140px] ${selectedOption === opt.id
                                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                                    : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                    }`}
                            >
                                <div>
                                    <div className={`font-bold text-lg md:text-xl mb-2 ${selectedOption === opt.id ? 'text-blue-400' : 'text-white'}`}>{opt.label}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {opt.duration}
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-white mt-auto">
                                    {Math.round(opt.price * selectedTypeInfo.multiplier)} DH
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Date & Time (Multi-Slot Logic with Real-Time Blocking) */}
                <div className="bg-[#1E293B] p-4 md:p-8 rounded-xl border border-white/10 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Date Rendez-vous</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors font-bold h-[50px]"
                            />
                        </div>
                        <div>
                            {/* Placeholder for future expansion or just layout balance on desktop */}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Heure de Départ</label>

                        {!selectedOption ? (
                            <div className="text-sm text-yellow-500 mb-2 font-medium bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                ⚠ Veuillez choisir une formule ci-dessus d'abord.
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                                {TIME_SLOTS.map(t => {
                                    const busy = isSlotBusy(t);
                                    const past = isSlotInPast(t); // Check past
                                    const fit = canSelectSlot(t); // Check fits duration
                                    const disabled = busy || past || !fit;

                                    return (
                                        <button
                                            key={t}
                                            disabled={disabled}
                                            onClick={() => setTime(t)}
                                            className={`px-3 py-2 md:px-4 md:py-3 rounded-lg text-sm font-bold border transition-all relative overflow-hidden ${time === t
                                                ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-105'
                                                : disabled
                                                    ? 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed opacity-50' // BUSY/PAST STYLE (Subtle Grey)
                                                    : 'border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/30'
                                                }`}
                                        >
                                            {t}
                                            {busy && <div className="absolute inset-0 flex items-center justify-center bg-transparent"><div className="w-full h-[1px] bg-red-500 rotate-45 transform origin-center" /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {selectedOption && time && endTime && (
                            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-2 animate-fade-in">
                                <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-blue-200">Durée du Service : {optionData?.duration}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                        Réservation de <span className="text-white font-bold underline">{time} à {endTime}</span> ({optionData?.slots} slots).
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* FLOATING PILL FOOTER (Food Cart Style) */}
            <div className="fixed bottom-[90px] left-0 right-0 z-[100] animate-slide-up px-4 md:px-0">
                <div className="max-w-xl mx-auto">
                    <button
                        onClick={handleBooking}
                        disabled={!selectedOption || loading || !endTime}
                        className="w-full bg-[#1e293b] border border-white/10 p-2 pl-3 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 hover:bg-[#253248]"
                    >
                        {/* Badge / Price Left */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                1
                            </div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm leading-tight">Réserver Lavage</div>
                                <div className="text-gray-400 text-[10px] font-medium">
                                    {date} {time ? `• ${time}` : ''}
                                </div>
                            </div>
                        </div>

                        {/* Price Right */}
                        <div className="flex items-center gap-2 pr-2">
                            <span className="text-white font-black text-lg">{selectedPrice} <span className="text-xs font-bold text-gray-400">DH</span></span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:text-white transition-colors">→</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Curtain for Scroll Mask */}
            <div className="fixed inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-[#0F172A] to-transparent z-30 pointer-events-none" />


            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Lavage Confirmé!</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Votre réservation <span className="text-white font-bold">#{showSuccess}</span> a été enregistrée.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full py-4 bg-blue-600 rounded-xl font-bold text-white shadow-lg"
                            >
                                Mes Réservations
                            </button>
                            <button
                                onClick={() => setShowSuccess(null)}
                                className="w-full py-4 bg-white/5 rounded-xl font-bold text-gray-400 hover:bg-white/10"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
