"use client";

import React, { useState, useEffect } from "react";
import { Waves, Calendar, ChevronLeft, CheckCircle2, Ticket, Sun, Moon, Users, Baby } from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

const POOL_OPTIONS = [
    {
        id: 'morning',
        label: 'Matinée (09h-13h)',
        priceAdult: 50,
        priceChild: 25,
        hours: "09:00 - 13:00",
        desc: 'Fraîcheur matinale.'
    },
    {
        id: 'afternoon',
        label: 'Après-Midi (14h-19h)',
        priceAdult: 50,
        priceChild: 25,
        hours: "14:00 - 19:00",
        desc: 'Soleil et détente.'
    },
    {
        id: 'full_day',
        label: 'Journée Complète (09h-19h)',
        priceAdult: 90,
        priceChild: 40,
        hours: "09:00 - 19:00",
        desc: 'Profitez sans limite (Best Rate).'
    }
];

const CATEGORIES = [
    { id: 'family', label: 'Famille', icon: '👨‍👩‍👧‍👦' },
    { id: 'mixed', label: 'Mixte', icon: '👫' },
    { id: 'women', label: 'Femmes', icon: '💃' },
];

export default function PoolPage() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [category, setCategory] = useState('mixed');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Separate Counters
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    const activeOption = POOL_OPTIONS.find(o => o.id === selectedOption);

    // Dynamic Pricing Calculation
    const totalPrice = activeOption
        ? (activeOption.priceAdult * adults) + (activeOption.priceChild * children)
        : 0;

    // --- AUTO-BOOKING ---
    useEffect(() => {
        const attemptAutoBook = async () => {
            // ... existing auto-book logic ...
            const pending = localStorage.getItem('pendingPoolBooking');
            if (!pending) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            if (!profile?.phone) return;

            const bookingData = JSON.parse(pending);
            setLoading(true);
            const bookingNum = `POOL-${Date.now().toString().slice(-6)}`;

            const serviceName = `Piscine ${bookingData.optionLabel} (${bookingData.category}) [${bookingData.adults}A + ${bookingData.children}E]`;

            const { error } = await supabase.from('pool_bookings').insert({
                booking_number: bookingNum,
                customer_phone: profile.phone,
                booking_date: bookingData.date,
                time_slot: bookingData.timeSlot,
                ambiance: bookingData.category,
                adults: bookingData.adults,
                children: bookingData.children,
                total_price: bookingData.totalPrice,
                status: 'pending',
                user_id: user.id
            });

            if (!error) {
                setShowSuccess(bookingNum);
                localStorage.removeItem('pendingPoolBooking');
            }
            setLoading(false);
        };
        attemptAutoBook();
    }, []);

    const handleBooking = async () => {
        if (!selectedOption) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Only redirect if NOT logged in
            const bookingData = {
                optionId: selectedOption,
                optionLabel: activeOption?.label,
                category,
                date,
                timeSlot: activeOption?.hours,
                adults,
                children,
                totalPrice
            };
            localStorage.setItem('pendingPoolBooking', JSON.stringify(bookingData));
            router.push('/profile?redirect=/services/pool');
            setLoading(false);
            return;
        }

        // Fetch phone if available, but don't block
        let userPhoneFromProfile = null;
        const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
        userPhoneFromProfile = data?.phone || user.user_metadata?.phone;

        const bookingNum = `POOL-${Date.now().toString().slice(-6)}`;

        const { error } = await supabase.from('pool_bookings').insert({
            booking_number: bookingNum,
            customer_phone: userPhoneFromProfile || null,
            booking_date: date,
            time_slot: activeOption?.hours,
            ambiance: category,
            adults: adults,
            children: children,
            total_price: totalPrice,
            status: 'pending',
            user_id: user.id
        });

        if (error) {
            alert("Erreur: " + error.message);
        } else {
            setShowSuccess(bookingNum);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pb-40 bg-[#0F172A]" style={{ backgroundColor: COLORS.bgDark }}>

            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 p-4 pt-6 md:px-8">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Piscine & Détente</h1>
                </div>
            </div>

            <div className="p-5 md:p-8 space-y-6 max-w-5xl mx-auto">

                {/* Hero Image */}
                <div className="relative h-48 md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <img
                        src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                        <div className="bg-cyan-500 text-black text-[10px] md:text-xs font-black px-2 py-0.5 md:px-3 md:py-1 rounded inline-block mb-1 shadow-lg">SUMMER VIBES</div>
                        <h2 className="text-xl md:text-4xl font-black text-white">Pool Access</h2>
                    </div>
                </div>

                {/* 1. Ambiance / Category Selector */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Ambiance</h3>
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        {/* Famille */}
                        <button
                            onClick={() => setCategory('family')}
                            className={`p-2 py-3 md:py-6 rounded-xl border flex flex-col items-center gap-2 transition-all relative ${category === 'family'
                                ? 'bg-cyan-600 border-cyan-500 shadow-lg shadow-cyan-500/20'
                                : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                }`}
                        >
                            <span className="text-xl md:text-3xl mb-1">👨‍👩‍👧‍👦</span>
                            <span className={`text-[10px] md:text-sm font-bold leading-tight text-center ${category === 'family' ? 'text-white' : 'text-gray-300'}`}>Famille</span>
                            <div className="bg-blue-600 text-white text-[9px] md:text-xs font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-md">
                                📅 LUNDI
                            </div>
                            {category === 'family' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white absolute top-2 right-2" />}
                        </button>

                        {/* Mixte */}
                        <button
                            onClick={() => setCategory('mixed')}
                            className={`p-2 py-3 md:py-6 rounded-xl border flex flex-col items-center gap-2 transition-all relative ${category === 'mixed'
                                ? 'bg-cyan-600 border-cyan-500 shadow-lg shadow-cyan-500/20'
                                : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                }`}
                        >
                            <span className="text-xl md:text-3xl mb-1">👫</span>
                            <span className={`text-[10px] md:text-sm font-bold leading-tight text-center ${category === 'mixed' ? 'text-white' : 'text-gray-300'}`}>Mixte</span>
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[9px] md:text-xs font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-md">
                                ✨ AUTRES JOURS
                            </div>
                            {category === 'mixed' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white absolute top-2 right-2" />}
                        </button>

                        {/* Femmes */}
                        <button
                            onClick={() => setCategory('women')}
                            className={`p-2 py-3 md:py-6 rounded-xl border flex flex-col items-center gap-2 transition-all relative ${category === 'women'
                                ? 'bg-cyan-600 border-cyan-500 shadow-lg shadow-cyan-500/20'
                                : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                }`}
                        >
                            <span className="text-xl md:text-3xl mb-1">💃</span>
                            <span className={`text-[10px] md:text-sm font-bold leading-tight text-center ${category === 'women' ? 'text-white' : 'text-gray-300'}`}>Femmes</span>
                            <div className="bg-purple-600 text-white text-[9px] md:text-xs font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-md">
                                📅 JEUDI
                            </div>
                            {category === 'women' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white absolute top-2 right-2" />}
                        </button>
                    </div>
                </div>

                {/* 2. Time Slot Options (Detailed Pricing) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Formule & Horaire</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {POOL_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedOption(opt.id)}
                                className={`w-full p-4 md:p-6 rounded-xl border flex flex-col items-start justify-between gap-4 transition-all text-left group min-h-[140px] ${selectedOption === opt.id
                                    ? 'bg-cyan-600/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                    : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                    }`}
                            >
                                <div className="w-full">
                                    <div className={`font-bold flex items-center justify-between gap-2 mb-2 ${selectedOption === opt.id ? 'text-cyan-400' : 'text-white'}`}>
                                        <div className="flex items-center gap-2">
                                            {opt.id === 'morning' ? <Sun className="w-5 h-5 text-yellow-500" /> : opt.id === 'afternoon' ? <Sun className="w-5 h-5 text-orange-500" /> : <Ticket className="w-5 h-5 text-purple-500" />}
                                            <span className="text-lg">{opt.label.split('(')[0]}</span>
                                        </div>
                                        {selectedOption === opt.id && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                                    </div>
                                    <div className="text-xs text-gray-400 mb-4">{opt.hours}</div>

                                    <div className="flex gap-2">
                                        <span className="bg-white/5 border border-white/5 text-gray-300 text-xs px-2 py-1 rounded">Adulte: {opt.priceAdult}DH</span>
                                        <span className="bg-white/5 border border-white/5 text-gray-300 text-xs px-2 py-1 rounded">Enfant: {opt.priceChild}DH</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Date & Guests Counters */}
                <div className="bg-[#1E293B] p-6 rounded-xl border border-white/10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-cyan-500 transition-colors font-bold text-sm h-[50px]"
                            />
                        </div>

                        {/* Adultes Counter */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase flex items-center gap-1">
                                <Users className="w-3 h-3" /> Adultes ({activeOption?.priceAdult || '--'} DH)
                            </label>
                            <div className="flex items-center bg-[#0F172A] border border-white/10 rounded-lg overflow-hidden h-[50px]">
                                <button onClick={() => setAdults(Math.max(1, adults - 1))} className="px-4 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl">-</button>
                                <span className="flex-1 text-center font-bold text-white text-lg">{adults}</span>
                                <button onClick={() => setAdults(adults + 1)} className="px-4 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl">+</button>
                            </div>
                        </div>

                        {/* Enfants Counter */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase flex items-center gap-1">
                                <Baby className="w-3 h-3" /> Enfants ({activeOption?.priceChild || '--'} DH)
                            </label>
                            <div className="flex items-center bg-[#0F172A] border border-white/10 rounded-lg overflow-hidden h-[50px]">
                                <button onClick={() => setChildren(Math.max(0, children - 1))} className="px-4 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl">-</button>
                                <span className="flex-1 text-center font-bold text-white text-lg">{children}</span>
                                <button onClick={() => setChildren(children + 1)} className="px-4 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl">+</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* FLOATING PILL FOOTER (Cyan) */}
            <div className="fixed bottom-[90px] left-0 right-0 z-40 animate-slide-up px-4 md:px-0">
                <div className="max-w-xl mx-auto">
                    <button
                        onClick={handleBooking}
                        disabled={!selectedOption || loading}
                        className="w-full bg-[#1e293b] border border-white/10 p-2 pl-3 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed hover:bg-[#253248]"
                    >
                        {/* Badge / Price Left */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/20">
                                {adults + children}
                            </div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm leading-tight">Réserver Ticket</div>
                                <div className="text-gray-400 text-[10px] font-medium">
                                    {activeOption ? activeOption.hours : 'Choisir créneau'}
                                </div>
                            </div>
                        </div>

                        {/* Price Right */}
                        <div className="flex items-center gap-2 pr-2">
                            <span className="text-white font-black text-lg">{totalPrice} <span className="text-xs font-bold text-gray-400">DH</span></span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:text-black transition-colors">→</div>
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
                        <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="w-10 h-10 text-cyan-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Ticket Validé!</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Votre réservation pour <span className="text-white font-bold">{adults + children} personne(s)</span> est confirmée.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full py-4 bg-cyan-600 rounded-xl font-bold text-white shadow-lg"
                            >
                                Voir mon Ticket
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
