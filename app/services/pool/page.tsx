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
    const { t, language } = useTranslation();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [category, setCategory] = useState('mixed');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Separate Counters
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const [heroSlides, setHeroSlides] = useState<{
        id: string;
        title: string;
        subtitle: string;
        badge_text: string;
        cta_text: string;
        image_url: string;
    }[]>([]);

    const fetchHero = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('hero_sliders')
                .select('*')
                .eq('page', 'pool')
                .eq('is_active', true)
                .order('order_index', { ascending: true });
            
            if (data && data.length > 0) setHeroSlides(data);
        } catch {
            // silently fail
        }
    }, []);

    useEffect(() => { fetchHero(); }, [fetchHero]);

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
    const [pendingPayment, setPendingPayment] = useState<{ id: string, amount: number, num: string, paymentType?: 'full_discounted' | 'deposit' | 'full' } | null>(null);

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

            const isCard = bookingData.paymentMethod === 'card';
            const finalPrice = isCard ? Math.round(bookingData.totalPrice * 0.90) : bookingData.totalPrice;

            const { data, error } = await supabase.from('pool_bookings').insert({
                booking_number: bookingNum,
                customer_phone: profile.phone,
                booking_date: bookingData.date,
                time_slot: bookingData.timeSlot,
                ambiance: bookingData.category,
                adults: bookingData.adults,
                children: bookingData.children,
                total_price: finalPrice,
                status: 'pending',
                user_id: user.id
            }).select().single();

            if (!error && data) {
                if (isCard) {
                    setPendingPayment({
                        id: data.id,
                        amount: finalPrice,
                        num: bookingNum,
                        paymentType: 'full_discounted'
                    });
                } else {
                    setShowSuccess(bookingNum);
                }
                localStorage.removeItem('pendingPoolBooking');
            }
            setLoading(false);
        };
        attemptAutoBook();
    }, []);

    // Carousel Auto-Scroll
    useEffect(() => {
        const interval = setInterval(() => {
            const container = document.getElementById("pool-carousel-container");
            if (!container) return;

            const maxScroll = container.scrollWidth - container.clientWidth;
            if (container.scrollLeft >= maxScroll - 5) {
                container.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                container.scrollBy({ left: container.clientWidth, behavior: "smooth" });
            }
        }, 4500);

        return () => clearInterval(interval);
    }, []);

    const handleBooking = useCallback(async () => {
        if (!selectedOption) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        const isCard = paymentMethod === 'card';
        const finalPrice = isCard ? Math.round(totalPrice * 0.90) : totalPrice;

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
                totalPrice,
                paymentMethod
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
            total_price: finalPrice,
            status: 'pending',
            user_id: user.id
        }).select().single();

        if (error || !data) {
            alert("Erreur: " + error?.message);
        } else {
            if (isCard) {
                setPendingPayment({
                    id: data.id,
                    amount: finalPrice,
                    num: bookingNum,
                    paymentType: 'full_discounted'
                });
            } else {
                setShowSuccess(bookingNum);
            }
        }
        setLoading(false);
    }, [selectedOption, activeOption, category, date, adults, children, totalPrice, paymentMethod, router, t]);
    return (
        <div className="min-h-screen pt-16 md:pt-20 pb-52 bg-[#0B0F19]">

            {/* Header */}
            <div className="sticky top-[64px] md:top-[80px] z-20 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/5 p-4 pt-6 md:px-8">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold rtl:rotate-180" aria-label="Retour">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-black text-white uppercase tracking-wider">{t('pool.title')}</h1>
                </div>
            </div>

            <div className="p-3 md:p-6 space-y-8 max-w-5xl mx-auto relative z-10">
                {/* Cyan glowing effect for pool vibe */}
                <div className="absolute top-[15%] right-[20%] w-[350px] h-[350px] bg-cyan-600/5 rounded-full blur-[130px] pointer-events-none -z-10" />
                <div className="absolute bottom-[25%] left-[10%] w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                {/* POOL HERO CAROUSEL */}
                <div className="relative w-full h-[200px] sm:h-[260px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                    <div 
                        id="pool-carousel-container"
                        onScroll={(e) => {                            const target = e.target as HTMLElement;
                            const scrollLeft = target.scrollLeft;
                            const width = target.clientWidth;
                            const index = Math.round(scrollLeft / width);
                            const dots = document.querySelectorAll('.pool-dot');
                            dots.forEach((dot, idx) => {
                                if (idx === index) {
                                    dot.classList.add('bg-cyan-500', 'w-6');
                                    dot.classList.remove('bg-white/30', 'w-2');
                                } else {
                                    dot.classList.remove('bg-cyan-500', 'w-6');
                                    dot.classList.add('bg-white/30', 'w-2');
                                }
                            });
                        }}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-0 scrollbar-hide w-full h-full scroll-smooth"
                    >
                        {(heroSlides.length > 0 ? heroSlides : [
                            {
                                id: 'fallback-1',
                                title: t('pool.hero.title'),
                                subtitle: 'Espace aquatique de détente et fraîcheur au Golden Park',
                                badge_text: t('pool.hero.badge'),
                                cta_text: '',
                                image_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80'
                            },
                            {
                                id: 'fallback-2',
                                title: 'Journée Femmes',
                                subtitle: 'Profitez d\'une intimité et d\'une ambiance exclusive chaque mercredi & vendredi',
                                badge_text: '100% SÉCURISÉ & PRIVÉ',
                                cta_text: '',
                                image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
                            },
                            {
                                id: 'fallback-3',
                                title: 'Espace Familles',
                                subtitle: 'Partagez des moments exceptionnels en famille au bord de l\'eau',
                                badge_text: 'ESPACE CHALEUREUX',
                                cta_text: '',
                                image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
                            }
                        ]).map((slide, idx) => (
                            <div 
                                key={slide.id || idx}
                                className="relative w-full h-full shrink-0 snap-center flex items-center justify-between px-6 md:px-12 select-none"
                                style={{ minWidth: '100%' }}
                            >
                                {/* Background Image */}
                                <Image
                                    src={slide.image_url}
                                    alt={slide.title}
                                    fill
                                    priority={idx === 0}
                                    className="object-cover absolute inset-0 -z-10 brightness-[0.65] saturate-150 transition-transform duration-[20s] ease-linear hover:scale-110 pointer-events-none"
                                />
                                {/* Full dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/40 -z-10" />

                                {/* Content */}
                                <div className="relative z-10 w-full flex items-center justify-between gap-4 h-full pb-6">
                                    <div className="flex flex-col gap-1.5 flex-1 min-w-0 text-left justify-end h-full">
                                        <span className="bg-cyan-500/20 border border-cyan-500 text-cyan-400 text-[8px] sm:text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 w-fit shadow-lg backdrop-blur-sm">
                                            💦 {slide.badge_text}
                                        </span>
                                        <h2 className="text-white text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight drop-shadow-lg">
                                            {slide.title}
                                        </h2>
                                        <p className="text-white/80 text-[9px] sm:text-[10px] md:text-xs font-medium line-clamp-2 drop-shadow leading-relaxed max-w-[280px] sm:max-w-[400px]">
                                            {slide.subtitle}
                                        </p>
                                    </div>
                                    {slide.cta_text && (
                                        <div className="flex flex-col items-end justify-end h-full shrink-0">
                                            <button
                                                className="py-2.5 px-4 bg-cyan-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all whitespace-nowrap"
                                            >
                                                {slide.cta_text}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {heroSlides.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                            {heroSlides.map((_, idx) => (
                                <span 
                                    key={idx} 
                                    className={`pool-dot h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-cyan-500 w-6' : 'bg-white/30 w-2'}`} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 1. Ambiance / Category Selector */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('pool.ambiance.title')}</h3>
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        {/* Famille */}
                        <button
                            onClick={() => setCategory('family')}
                            className={`p-3 py-4 rounded-[1.8rem] border flex flex-col items-center gap-3 transition-all duration-300 relative ${category === 'family'
                                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-xl shadow-cyan-500/10'
                                : 'bg-[#111827]/30 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className="text-2xl md:text-3xl mb-1">👨‍👩‍👧‍👦</span>
                            <span className="text-xs md:text-sm font-black uppercase tracking-wider text-center">{t('pool.ambiance.family')}</span>
                            <div className="bg-cyan-600 text-white text-[9px] md:text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                                {t('pool.ambiance.family_day')}
                            </div>
                            {category === 'family' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 absolute top-3 right-3" />}
                        </button>

                        {/* Mixte */}
                        <button
                            onClick={() => setCategory('mixed')}
                            className={`p-3 py-4 rounded-[1.8rem] border flex flex-col items-center gap-3 transition-all duration-300 relative ${category === 'mixed'
                                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-xl shadow-cyan-500/10'
                                : 'bg-[#111827]/30 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className="text-2xl md:text-3xl mb-1">👫</span>
                            <span className="text-xs md:text-sm font-black uppercase tracking-wider text-center">{t('pool.ambiance.mixed')}</span>
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[9px] md:text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                                {t('pool.ambiance.mixed_day')}
                            </div>
                            {category === 'mixed' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 absolute top-3 right-3" />}
                        </button>

                        {/* Femmes */}
                        <button
                            onClick={() => setCategory('women')}
                            className={`p-3 py-4 rounded-[1.8rem] border flex flex-col items-center gap-3 transition-all duration-300 relative ${category === 'women'
                                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-xl shadow-cyan-500/10'
                                : 'bg-[#111827]/30 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className="text-2xl md:text-3xl mb-1">💃</span>
                            <span className="text-xs md:text-sm font-black uppercase tracking-wider text-center">{t('pool.ambiance.women')}</span>
                            <div className="bg-purple-600 text-white text-[9px] md:text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                                {t('pool.ambiance.women_day')}
                            </div>
                            {category === 'women' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 absolute top-3 right-3" />}
                        </button>
                    </div>
                </div>

                {/* 2. Time Slot Options (Detailed Pricing) */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('pool.formula.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {POOL_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedOption(opt.id)}
                                className={`w-full p-5 rounded-[2rem] border flex flex-col items-start justify-between gap-4 transition-all duration-300 text-left rtl:text-right group min-h-[150px] ${selectedOption === opt.id
                                    ? 'bg-cyan-500/10 border-cyan-500 shadow-xl shadow-cyan-500/10'
                                    : 'bg-[#111827]/30 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="w-full">
                                    <div className={`font-black flex items-center justify-between gap-2 mb-2 ${selectedOption === opt.id ? 'text-cyan-400' : 'text-white'}`}>
                                        <div className="flex items-center gap-2">
                                            {opt.id === 'morning' ? <Sun className="w-5 h-5 text-yellow-500" /> : opt.id === 'afternoon' ? <Sun className="w-5 h-5 text-orange-500 animate-spin-slow" /> : <Ticket className="w-5 h-5 text-cyan-400" />}
                                            <span className="text-lg uppercase tracking-tight">{t(opt.labelKey)}</span>
                                        </div>
                                        {selectedOption === opt.id && <CheckCircle2 className="w-5 h-5 text-cyan-400 animate-scale-in" />}
                                    </div>
                                    <div className="text-xs text-gray-400 font-semibold mb-4">{opt.hours}</div>

                                    <div className="flex gap-2">
                                        <span className="bg-white/5 border border-white/5 text-gray-300 text-[10px] px-2.5 py-1 rounded-lg font-bold">{t('pool.price.adult')} {opt.priceAdult} DH</span>
                                        <span className="bg-white/5 border border-white/5 text-gray-300 text-[10px] px-2.5 py-1 rounded-lg font-bold">{t('pool.price.child')} {opt.priceChild} DH</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mode de Paiement Selector */}
                <div className="bg-[#111827]/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-2xl">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {language === 'ar' ? 'طريقة الدفع' : 'Mode de Paiement'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cash Option */}
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`relative p-5 rounded-[1.5rem] border flex flex-col items-center gap-2 transition-all duration-300 text-center ${paymentMethod === 'cash'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                : 'bg-[#0B0F19]/60 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className="text-2xl">💵</span>
                            <span className="text-xs font-black uppercase tracking-wider">
                                {language === 'ar' ? 'نقداً (في المحطة)' : 'Sur Place (Cash)'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                                {language === 'ar' ? 'السعر العادي' : 'Prix normal'}
                            </span>
                            {paymentMethod === 'cash' && (
                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            )}
                        </button>

                        {/* Card/PayPal Option */}
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`relative p-5 rounded-[1.5rem] border flex flex-col items-center gap-2 transition-all duration-300 text-center ${paymentMethod === 'card'
                                ? 'bg-red-500/10 border-red-500 text-red-400 shadow-lg shadow-red-500/10'
                                : 'bg-[#0B0F19]/60 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white font-black text-[9px] px-2.5 py-1 rounded-full shadow-lg shadow-red-600/30 animate-pulse z-10">
                                -10%
                            </span>
                            <span className="text-2xl">💳</span>
                            <span className="text-xs font-black uppercase tracking-wider">
                                {language === 'ar' ? 'دفع إلكتروني' : 'En ligne (-10%)'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                                {language === 'ar' ? 'تخفيض فوري 10%' : '10% de remise incluse'}
                            </span>
                            {paymentMethod === 'card' && (
                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* 3. Date & Guests Counters */}
                <div className="bg-[#111827]/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-6 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-wider">{t('pool.date_label')}</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                aria-label="Date de réservation"
                                className="w-full bg-[#0B0F19]/80 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500 transition-colors font-bold text-sm h-[50px] appearance-none"
                            />
                        </div>

                        {/* Adultes Counter */}
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 uppercase flex items-center gap-1 tracking-wider">
                                <Users className="w-3.5 h-3.5 text-cyan-400" /> {t('pool.guests.adults')} ({activeOption?.priceAdult || '--'} DH)
                            </label>
                            <div className="flex items-center bg-[#0B0F19]/80 border border-white/10 rounded-xl overflow-hidden h-[50px] flex-row-reverse rtl:flex-row shadow-inner">
                                <button onClick={() => setAdults(adults + 1)} className="px-5 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl font-bold">+</button>
                                <span className="flex-1 text-center font-bold text-white text-lg">{adults}</span>
                                <button onClick={() => setAdults(Math.max(1, adults - 1))} className="px-5 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl font-bold">-</button>
                            </div>
                        </div>

                        {/* Enfants Counter */}
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 uppercase flex items-center gap-1 tracking-wider">
                                <Baby className="w-3.5 h-3.5 text-cyan-400" /> {t('pool.guests.children')} ({activeOption?.priceChild || '--'} DH)
                            </label>
                            <div className="flex items-center bg-[#0B0F19]/80 border border-white/10 rounded-xl overflow-hidden h-[50px] flex-row-reverse rtl:flex-row shadow-inner">
                                <button onClick={() => setChildren(children + 1)} className="px-5 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl font-bold">+</button>
                                <span className="flex-1 text-center font-bold text-white text-lg">{children}</span>
                                <button onClick={() => setChildren(Math.max(0, children - 1))} className="px-5 text-gray-400 hover:text-white hover:bg-white/5 h-full text-xl font-bold">-</button>
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
                        className="w-full bg-[#111827]/80 backdrop-blur-md flex-row-reverse rtl:flex-row border border-white/10 p-2.5 pl-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed hover:border-cyan-500/30"
                    >
                        {/* Price Right */}
                        <div className="flex items-center gap-2 pl-2">
                            <span className="text-white font-black text-lg">
                                {paymentMethod === 'card' ? Math.round(totalPrice * 0.90) : totalPrice}{' '}
                                <span className="text-xs font-bold text-gray-400">DH</span>
                                {paymentMethod === 'card' && totalPrice > 0 && (
                                    <span className="text-[10px] text-red-500 font-bold ml-1.5 bg-red-500/10 px-1.5 py-0.5 rounded animate-pulse">
                                        -10%
                                    </span>
                                )}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:text-black transition-colors rotate-180 rtl:rotate-0">←</div>
                        </div>

                        {/* Badge / Price Left */}
                        <div className="flex flex-row-reverse rtl:flex-row items-center gap-3">
                            <div className="text-right rtl:text-left">
                                <div className="text-white font-extrabold text-xs uppercase tracking-wider leading-tight">{t('pool.book.btn')}</div>
                                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                    {activeOption ? activeOption.hours : t('pool.book.choose')}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/25">
                                {adults + children}
                            </div>
                        </div>
                    </button>
                </div>
            </div>


            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in">
                    <div className="bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl relative">
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/5">
                            <Ticket className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{t('pool.success.title')}</h2>
                        <p className="text-sm text-gray-400 mb-6 font-medium leading-relaxed">
                            {t('pool.success.desc').replace('{count}', (adults + children).toString())}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-600 hover:to-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition-all"
                            >
                                {t('pool.btn.view')}
                            </button>
                            <button
                                onClick={() => setShowSuccess(null)}
                                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-wider text-gray-400 hover:bg-white/10"
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
                    paymentType={pendingPayment.paymentType}
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
