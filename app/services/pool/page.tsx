"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, CheckCircle2, Ticket, Sun, Users, Baby } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { supabase } from '@/lib/supabase';
// Import PaymentModal properly
import PaymentModal from '@/components/PaymentModal';
import { useTranslation } from '@/lib/state/LanguageContext';

const POOL_OPTIONS = [
    {
        id: 'morning',
        labelKey: 'pool.formula.morning',
        priceAdult: 50,
        priceChild: 25,
        hours: "09:00 - 13:00",
        desc: 'Fraîcheur matinale.'
    },
    {
        id: 'afternoon',
        labelKey: 'pool.formula.afternoon',
        priceAdult: 50,
        priceChild: 25,
        hours: "14:00 - 19:00",
        desc: 'Soleil et détente.'
    },
    {
        id: 'full_day',
        labelKey: 'pool.formula.fullday',
        priceAdult: 90,
        priceChild: 40,
        hours: "09:00 - 19:00",
        desc: 'Profitez sans limite (Best Rate).'
    }
];



export default function PoolPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [category, setCategory] = useState('mixed');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Separate Counters
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [pendingPayment, setPendingPayment] = useState<{ id: string, amount: number, num: string } | null>(null);

    const activeOption = useMemo(() => POOL_OPTIONS.find(o => o.id === selectedOption), [selectedOption]);

    // Dynamic Pricing Calculation
    const totalPrice = useMemo(() => activeOption
        ? (activeOption.priceAdult * adults) + (activeOption.priceChild * children)
        : 0, [activeOption, adults, children]);

    // --- AUTO-BOOKING ---
    useEffect(() => {
        const attemptAutoBook = async () => {
            const pending = localStorage.getItem('pendingPoolBooking');
            if (!pending) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            if (!profile?.phone) return;

            const bookingData = JSON.parse(pending);
            setLoading(true);
            const bookingNum = `POOL-${Date.now().toString().slice(-6)}`;

            const { data, error } = await supabase.from('pool_bookings').insert({
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
            }).select().single();

            if (!error && data) {
                const arboun = Math.max(20, Math.round(bookingData.totalPrice * 0.30));
                setPendingPayment({
                    id: data.id,
                    amount: arboun,
                    num: bookingNum
                });
                localStorage.removeItem('pendingPoolBooking');
            }
            setLoading(false);
        };
        attemptAutoBook();
    }, []);

    const handleBooking = useCallback(async () => {
        if (!selectedOption) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Only redirect if NOT logged in
            const bookingData = {
                optionId: selectedOption,
                optionLabel: activeOption ? t(activeOption.labelKey) : '',
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
        const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
        userPhoneFromProfile = (profile as { phone: string } | null)?.phone || user.user_metadata?.phone;

        const bookingNum = `POOL-${Date.now().toString().slice(-6)}`;

        const { data, error } = await supabase.from('pool_bookings').insert({
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
        }).select().single();

        if (error || !data) {
            alert("Erreur: " + error?.message);
        } else {
            // Arboun minimum = 20 DH (30% deposit)
            const arboun = Math.max(20, Math.round(totalPrice * 0.30));
            setPendingPayment({
                id: data.id,
                amount: arboun,
                num: bookingNum
            });
        }
        setLoading(false);
    }, [selectedOption, activeOption, category, date, adults, children, totalPrice, router, t]);

    return (
        <div className="min-h-screen pb-40 bg-[#0F172A]">

            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 p-4 pt-6 md:px-8">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold rtl:rotate-180" aria-label="Retour">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">{t('pool.title')}</h1>
                </div>
            </div>

            <div className="p-3 md:p-4 space-y-4 max-w-5xl mx-auto">

                {/* Hero Image */}
                <div className="relative h-32 md:h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <Image
                        src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80"
                        alt={t('pool.title')}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 md:bottom-8 md:left-8 rtl:md:left-auto rtl:md:right-8">
                        <div className="bg-red-500 text-black text-[10px] md:text-xs font-black px-2 py-0.5 md:px-3 md:py-1 rounded inline-block mb-1 shadow-lg uppercase">{t('pool.hero.badge')}</div>
                        <h2 className="text-lg md:text-2xl font-black text-white">{t('pool.hero.title')}</h2>
                    </div>
                </div>

                {/* 1. Ambiance / Category Selector */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('pool.ambiance.title')}</h3>
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        {/* Famille */}
                        <button
                            onClick={() => setCategory('family')}
                            className={`p-2 py-2 md:py-3 rounded-xl border flex flex-col items-center gap-2 transition-all relative ${category === 'family'
                                ? 'bg-red-600 border-red-500 shadow-lg shadow-red-500/20'
                                : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                }`}
                        >
                            <span className="text-lg md:text-xl mb-1">👨‍👩‍👧‍👦</span>
                            <span className={`text-[10px] md:text-sm font-bold leading-tight text-center ${category === 'family' ? 'text-white' : 'text-gray-300'}`}>{t('pool.ambiance.family')}</span>
                            <div className="bg-red-600 text-white text-[9px] md:text-xs font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-md">
                                {t('pool.ambiance.family_day')}
                            </div>
                            {category === 'family' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white absolute top-2 right-2 rtl:right-auto rtl:left-2" />}
                        </button>

                        {/* Mixte */}
                        <button
                            onClick={() => setCategory('mixed')}
                            className={`p-2 py-2 md:py-3 rounded-xl border flex flex-col items-center gap-2 transition-all relative ${category === 'mixed'
                                ? 'bg-red-600 border-red-500 shadow-lg shadow-red-500/20'
                                : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                }`}
                        >
                            <span className="text-lg md:text-xl mb-1">👫</span>
                            <span className={`text-[10px] md:text-sm font-bold leading-tight text-center ${category === 'mixed' ? 'text-white' : 'text-gray-300'}`}>{t('pool.ambiance.mixed')}</span>
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[9px] md:text-xs font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-md">
                                {t('pool.ambiance.mixed_day')}
                            </div>
                            {category === 'mixed' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white absolute top-2 right-2 rtl:right-auto rtl:left-2" />}
                        </button>

                        {/* Femmes */}
                        <button
                            onClick={() => setCategory('women')}
                            className={`p-2 py-2 md:py-3 rounded-xl border flex flex-col items-center gap-2 transition-all relative ${category === 'women'
                                ? 'bg-red-600 border-red-500 shadow-lg shadow-red-500/20'
                                : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                }`}
                        >
                            <span className="text-lg md:text-xl mb-1">💃</span>
                            <span className={`text-[10px] md:text-sm font-bold leading-tight text-center ${category === 'women' ? 'text-white' : 'text-gray-300'}`}>{t('pool.ambiance.women')}</span>
                            <div className="bg-purple-600 text-white text-[9px] md:text-xs font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-md">
                                {t('pool.ambiance.women_day')}
                            </div>
                            {category === 'women' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white absolute top-2 right-2 rtl:right-auto rtl:left-2" />}
                        </button>
                    </div>
                </div>

                {/* 2. Time Slot Options (Detailed Pricing) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('pool.formula.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {POOL_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedOption(opt.id)}
                                className={`w-full p-3 md:p-4 rounded-xl border flex flex-col items-start justify-between gap-4 transition-all text-left rtl:text-right group min-h-[140px] ${selectedOption === opt.id
                                    ? 'bg-red-600/20 border-red-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                    : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                    }`}
                            >
                                <div className="w-full">
                                    <div className={`font-bold flex items-center justify-between gap-2 mb-2 ${selectedOption === opt.id ? 'text-red-400' : 'text-white'}`}>
                                        <div className="flex items-center gap-2">
                                            {opt.id === 'morning' ? <Sun className="w-5 h-5 text-yellow-500" /> : opt.id === 'afternoon' ? <Sun className="w-5 h-5 text-orange-500" /> : <Ticket className="w-5 h-5 text-purple-500" />}
                                            <span className="text-lg">{t(opt.labelKey)}</span>
                                        </div>
                                        {selectedOption === opt.id && <CheckCircle2 className="w-5 h-5 text-red-500" />}
                                    </div>
                                    <div className="text-xs text-gray-400 mb-4">{opt.hours}</div>

                                    <div className="flex gap-2">
                                        <span className="bg-white/5 border border-white/5 text-gray-300 text-xs px-2 py-1 rounded">{t('pool.price.adult')} {opt.priceAdult} DH</span>
                                        <span className="bg-white/5 border border-white/5 text-gray-300 text-xs px-2 py-1 rounded">{t('pool.price.child')} {opt.priceChild} DH</span>
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
                            <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">{t('pool.date_label')}</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                aria-label="Date de réservation"
                                className="w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-red-500 transition-colors font-bold text-sm h-[50px] appearance-none"
                            />
                        </div>

                        {/* Adultes Counter */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase flex items-center gap-1">
                                <Users className="w-3 h-3" /> {t('pool.guests.adults')} ({activeOption?.priceAdult || '--'} DH)
                            </label>
                            <div className="flex items-center bg-[#0F172A] border border-white/10 rounded-lg overflow-hidden h-[50px] flex-row-reverse rtl:flex-row">
                                <button onClick={() => setAdults(adults + 1)} className="px-4 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl">+</button>
                                <span className="flex-1 text-center font-bold text-white text-lg">{adults}</span>
                                <button onClick={() => setAdults(Math.max(1, adults - 1))} className="px-4 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl">-</button>
                            </div>
                        </div>

                        {/* Enfants Counter */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase flex items-center gap-1">
                                <Baby className="w-3 h-3" /> {t('pool.guests.children')} ({activeOption?.priceChild || '--'} DH)
                            </label>
                            <div className="flex items-center bg-[#0F172A] border border-white/10 rounded-lg overflow-hidden h-[50px] flex-row-reverse rtl:flex-row">
                                <button onClick={() => setChildren(children + 1)} className="px-4 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl">+</button>
                                <span className="flex-1 text-center font-bold text-white text-lg">{children}</span>
                                <button onClick={() => setChildren(Math.max(0, children - 1))} className="px-4 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl">-</button>
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
                        className="w-full bg-[#1e293b] flex-row-reverse rtl:flex-row border border-white/10 p-2 pl-3 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed hover:bg-[#253248]"
                    >
                        {/* Price Right */}
                        <div className="flex items-center gap-2 pl-2">
                            <span className="text-white font-black text-lg">{totalPrice} <span className="text-xs font-bold text-gray-400">DH</span></span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-red-500 group-hover:text-black transition-colors rotate-180 rtl:rotate-0">←</div>
                        </div>

                        {/* Badge / Price Left */}
                        <div className="flex flex-row-reverse rtl:flex-row items-center gap-3">
                            <div className="text-right rtl:text-left">
                                <div className="text-white font-bold text-sm leading-tight">{t('pool.book.btn')}</div>
                                <div className="text-gray-400 text-[10px] font-medium">
                                    {activeOption ? activeOption.hours : t('pool.book.choose')}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-black font-bold shadow-lg shadow-red-500/20">
                                {adults + children}
                            </div>
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
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">{t('pool.success.title')}</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            {t('pool.success.desc').replace('{count}', (adults + children).toString())}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full py-4 bg-red-600 rounded-xl font-bold text-white shadow-lg"
                            >
                                {t('pool.btn.view')}
                            </button>
                            <button
                                onClick={() => setShowSuccess(null)}
                                className="w-full py-4 bg-white/5 rounded-xl font-bold text-gray-400 hover:bg-white/10"
                            >
                                {t('hotel.btn.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {pendingPayment && (
                <PaymentModal
                    bookingId={pendingPayment.id}
                    amount={pendingPayment.amount}
                    serviceType="pool"
                    tableName="pool_bookings"
                    onSuccess={() => {
                        setPendingPayment(null);
                        setShowSuccess(pendingPayment.num);
                    }}
                    onClose={() => setPendingPayment(null)}
                />
            )}
        </div>
    );
}
