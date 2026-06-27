"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BedDouble, Calendar, ChevronLeft, CheckCircle2, Moon, Sun, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import PaymentModal from '@/components/PaymentModal';
import { useTranslation } from '@/lib/state/LanguageContext';
// Force TS index update

const ROOM_TYPES = [
    {
        id: 'standard',
        nameKey: 'hotel.room.standard',
        price: 300,
        siestePrice: 150,
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        featuresKeys: ['hotel.feat.wifi', 'hotel.feat.tv', 'hotel.feat.shower'],
        capacity: 2
    },
    {
        id: 'deluxe',
        nameKey: 'hotel.room.deluxe',
        price: 500,
        siestePrice: 250,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        featuresKeys: ['hotel.feat.view', 'hotel.feat.minibar', 'hotel.feat.salon', 'hotel.feat.bath'],
        capacity: 2
    },
    {
        id: 'family',
        nameKey: 'hotel.room.family',
        price: 700,
        siestePrice: 350,
        image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
        featuresKeys: ['hotel.feat.beds', 'hotel.feat.games', 'hotel.feat.kitchen', 'hotel.feat.terrace'],
        capacity: 4
    }
];

export default function HotelPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [bookingType, setBookingType] = useState<'night' | 'sieste'>('night');

    // Dates Logic
    const [dates, setDates] = useState(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return {
            checkIn: today.toISOString().split('T')[0],
            checkOut: tomorrow.toISOString().split('T')[0]
        };
    });
    const [dateError, setDateError] = useState<string | null>(null);

    const [siesteTime, setSiesteTime] = useState(() => ({
        date: new Date().toISOString().split('T')[0],
        hours: 3
    }));
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
    const [pendingPayment, setPendingPayment] = useState<{ id: string, amount: number, num: string, paymentType?: 'full_discounted' | 'deposit' | 'full' } | null>(null);

    const activeRoom = ROOM_TYPES.find(r => r.id === selectedRoom);

    // Hotel Hero Section
    const [heroData, setHeroData] = useState<{
        title: string;
        subtitle: string;
        badge_text: string;
        cta_text: string;
        image_url: string;
        is_active: boolean;
    } | null>(null);

    const fetchHero = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('hotel_hero')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (data) setHeroData(data);
        } catch {
            // hero table may not exist yet, silently fail
        }
    }, []);

    useEffect(() => { fetchHero(); }, [fetchHero]);

    // Calculate Nights
    const nights = useMemo(() => {
        if (!dates.checkIn || !dates.checkOut) return 0;
        const start = new Date(dates.checkIn);
        const end = new Date(dates.checkOut);
        if (end <= start) return 0;
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [dates]);

    // Dynamic Price Calculation
    const totalPrice = useMemo(() => {
        if (!activeRoom) return 0;
        if (bookingType === 'sieste') {
            return activeRoom.siestePrice;
        }
        return activeRoom.price * (nights || 1);
    }, [activeRoom, bookingType, nights]);

    // --- DATE HANDLERS ---
    const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCheckIn = e.target.value;
        const start = new Date(newCheckIn);
        const nextDay = new Date(start);
        nextDay.setDate(nextDay.getDate() + 1);
        const newCheckOut = nextDay.toISOString().split('T')[0];

        setDates({
            checkIn: newCheckIn,
            checkOut: newCheckOut
        });
        setDateError(null);
    };

    const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCheckOut = e.target.value;
        setDates(prev => ({ ...prev, checkOut: newCheckOut }));

        if (newCheckOut <= dates.checkIn) {
            setDateError(t('hotel.dates.error'));
        } else {
            setDateError(null);
        }
    };

    // --- AUTO-BOOKING LOGIC ---
    useEffect(() => {
        const attemptAutoBook = async () => {
            const pending = localStorage.getItem('pendingHotelBooking');
            if (!pending) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            if (!profile?.phone) return;

            const bookingData = JSON.parse(pending);
            setLoading(true);

            const bookingNum = `HOTEL-${Date.now().toString().slice(-6)}`;

            const isCard = bookingData.paymentMethod === 'card';
            const finalPrice = isCard ? Math.round(bookingData.totalPrice * 0.90) : bookingData.totalPrice;

            const { data, error } = await supabase.from('hotel_reservations').insert({
                booking_number: bookingNum,
                customer_phone: profile.phone,
                room_type: bookingData.roomType,
                booking_type: bookingData.bookingType,
                check_in: bookingData.bookingType === 'night' ? bookingData.checkIn : bookingData.siesteDate,
                check_out: bookingData.bookingType === 'night' ? bookingData.checkOut : bookingData.siesteDate,
                nights: bookingData.bookingType === 'night' ? bookingData.nights : 0,
                duration_hours: bookingData.bookingType === 'sieste' ? bookingData.siesteHours : null,
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
                localStorage.removeItem('pendingHotelBooking');
            }
            setLoading(false);
        };
        attemptAutoBook();
    }, []);

    const handleBooking = async () => {
        if (!selectedRoom || dateError) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        const isCard = paymentMethod === 'card';
        const finalPrice = isCard ? Math.round(totalPrice * 0.90) : totalPrice;

        let userPhoneFromProfile = null;
        if (user) {
            const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            userPhoneFromProfile = data?.phone;
        }

        const commonData = {
            roomType: selectedRoom,
            bookingType,
            totalPrice,
            paymentMethod
        };

        const specificData = bookingType === 'night' ? {
            checkIn: dates.checkIn,
            checkOut: dates.checkOut,
            nights
        } : {
            siesteDate: siesteTime.date,
            siesteHours: siesteTime.hours
        };

        const finalBookingData = { ...commonData, ...specificData };

        // Robust User/Phone check
        // Try profile phone, then metadata phone, then fallback/null
        const userPhone = userPhoneFromProfile || user?.user_metadata?.phone || null;

        if (!user) {
            localStorage.setItem('pendingHotelBooking', JSON.stringify(finalBookingData));
            router.push('/profile?redirect=/hotel');
            setLoading(false);
            return;
        }

        const bookingNum = `HOTEL-${Date.now().toString().slice(-6)}`;

        const { data, error } = await supabase.from('hotel_reservations').insert({
            booking_number: bookingNum,
            customer_phone: userPhone,
            room_type: selectedRoom,
            booking_type: bookingType,
            check_in: bookingType === 'night' ? dates.checkIn : siesteTime.date,
            check_out: bookingType === 'night' ? dates.checkOut : siesteTime.date,
            nights: bookingType === 'night' ? nights : 0,
            duration_hours: bookingType === 'sieste' ? siesteTime.hours : null,
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
    };

    return (
        <div className="min-h-screen pt-16 md:pt-20 pb-52 bg-[#0F172A]">

            {/* Header */}
            <div className="sticky top-[64px] md:top-[80px] z-20 bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 p-4 pt-6 md:px-8">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold rtl:rotate-180" aria-label="Retour">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">{t('hotel.title')}</h1>
                </div>
            </div>

            <div className="p-3 md:p-4 space-y-4 max-w-6xl mx-auto">

                {/* HERO BANNER */}
                {(heroData || true) && (
                    <div className="relative w-full h-[200px] sm:h-[240px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                        {/* Background Image */}
                        <Image
                            src={heroData?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
                            alt="Hotel Golden Park"
                            fill
                            priority
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        />
                        {/* Full dark overlay like restaurant */}
                        <div className="absolute inset-0 bg-black/55" />
                        {/* Glow FX */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

                        {/* Content — centered vertically, spread horizontally like resto */}
                        <div className="absolute inset-0 flex items-center justify-between px-5 md:px-8 gap-4">
                            {/* Left: badge + title + subtitle */}
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 w-fit shadow-lg">
                                    🏨 {heroData?.badge_text || 'OFFRE SPÉCIALE'}
                                </span>
                                <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight drop-shadow-md">
                                    {heroData?.title || 'Votre Séjour de Rêve'}
                                </h2>
                                <p className="text-white/75 text-[10px] sm:text-xs font-medium line-clamp-2 drop-shadow leading-relaxed max-w-[280px]">
                                    {heroData?.subtitle || 'Détente et confort absolu au cœur du Golden Park'}
                                </p>
                            </div>

                            {/* Right: CTA button */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <button
                                    onClick={() => {
                                        document.getElementById('hotel-room-gallery')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="py-3 px-5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    <BedDouble className="w-3.5 h-3.5" />
                                    <span>{heroData?.cta_text || 'Réserver'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODE SWITCHER */}
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto w-full">
                    <div className="relative bg-[#0F172A] p-1.5 rounded-2xl border border-white/10 flex w-full shadow-xl">
                        {/* Glowing slider */}
                        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-500 ease-in-out shadow-lg
                            ${bookingType === 'night'
                                ? 'ltr:left-1.5 rtl:right-1.5 bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/40'
                                : 'ltr:left-[calc(50%+4px)] rtl:right-[calc(50%+4px)] bg-gradient-to-br from-sky-400 to-blue-600 shadow-blue-500/40'
                            }`}
                        />
                        {/* Night Button */}
                        <button
                            onClick={() => setBookingType('night')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl relative z-10 font-bold text-sm transition-all duration-300
                                ${bookingType === 'night' ? 'text-black' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Moon className={`w-4 h-4 transition-transform duration-300 ${bookingType === 'night' ? 'scale-110' : ''}`} />
                            <span>{t('hotel.night_mode')}</span>
                        </button>
                        {/* Sieste Button */}
                        <button
                            onClick={() => setBookingType('sieste')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl relative z-10 font-bold text-sm transition-all duration-300
                                ${bookingType === 'sieste' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Sun className={`w-4 h-4 transition-transform duration-300 ${bookingType === 'sieste' ? 'scale-110 rotate-12' : ''}`} />
                            <span>{t('hotel.siesta_mode')}</span>
                        </button>
                    </div>
                    {/* Subtitle hint */}
                    <p className="text-xs text-gray-500 font-medium">
                        {bookingType === 'night' ? '🌙 Réservation complète pour la nuit' : '☀️ Repos de quelques heures en journée'}
                    </p>
                </div>

                {/* Room Gallery */}
                <div id="hotel-room-gallery">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('hotel.choose_room')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {ROOM_TYPES.map(room => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoom(room.id)}
                                className={`rounded-2xl overflow-hidden border transition-all duration-300 relative group cursor-pointer h-full flex flex-col ${selectedRoom === room.id
                                    ? 'border-amber-500 ring-4 ring-amber-500/20 transform md:-translate-y-2'
                                    : 'border-white/10 hover:border-white/30 hover:shadow-2xl'
                                    }`}
                            >
                                <div className="h-32 md:h-40 relative w-full">
                                    <Image src={room.image} alt={t(room.nameKey)} fill title={t(room.nameKey)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                        <h3 className="text-lg font-black text-white leading-tight">{t(room.nameKey)}</h3>
                                        <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-amber-500 font-bold flex flex-col items-end shrink-0">
                                            {/* Dynamic Price Display */}
                                            {bookingType === 'night'
                                                ? <>{room.price} DH <span className="text-[10px] text-white/70 font-medium">/{t('hotel.per_night')}</span></>
                                                : <>{room.siestePrice} DH <span className="text-[10px] text-white/70 font-medium">/{t('hotel.per_siesta')}</span></>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 bg-[#1E293B] flex-1 transition-colors ${selectedRoom === room.id ? 'bg-amber-900/10' : ''}`}>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {room.featuresKeys.map(key => (
                                            <span key={key} className="text-[10px] bg-white/5 border border-white/5 rounded-md px-2 py-1 text-gray-300">
                                                {t(key)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedRoom === room.id && (
                                    <div className="absolute top-3 right-3 bg-amber-500 text-black p-1 rounded-full shadow-lg animate-scale-in z-10">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mode de Paiement Selector */}
                <div className="bg-[#1E293B] p-6 rounded-xl border border-white/10 space-y-4 max-w-4xl mx-auto w-full">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        {language === 'ar' ? 'طريقة الدفع' : 'Mode de Paiement'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cash Option */}
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`relative p-4 rounded-xl border flex flex-col items-center gap-2 transition-all text-center ${paymentMethod === 'cash'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                : 'bg-[#0F172A] border-white/10 text-gray-500 hover:bg-white/5'
                                }`}
                        >
                            <span className="text-xl">💵</span>
                            <span className="text-xs font-bold">
                                {language === 'ar' ? 'نقداً (في المحطة)' : 'Sur Place (Cash)'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {language === 'ar' ? 'السعر العادي' : 'Prix normal'}
                            </span>
                            {paymentMethod === 'cash' && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            )}
                        </button>

                        {/* Card/PayPal Option */}
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`relative p-4 rounded-xl border flex flex-col items-center gap-2 transition-all text-center ${paymentMethod === 'card'
                                ? 'bg-red-600/10 border-red-500 text-red-400'
                                : 'bg-[#0F172A] border-white/10 text-gray-500 hover:bg-white/5'
                                }`}
                        >
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow animate-pulse z-10">
                                -10%
                            </span>
                            <span className="text-xl">💳</span>
                            <span className="text-xs font-bold">
                                {language === 'ar' ? 'دفع إلكتروني' : 'En ligne (-10%)'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {language === 'ar' ? 'تخفيض فوري 10%' : '10% de remise incluse'}
                            </span>
                            {paymentMethod === 'card' && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Conditional Inputs: Dates vs Hours */}
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 space-y-4 animate-fade-in max-w-4xl mx-auto w-full">

                    {bookingType === 'night' ? (
                        /* Night Mode Inputs */
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-white">{t('hotel.dates.stay')}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="checkInDate" className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('hotel.dates.checkin')}</label>
                                    <input
                                        id="checkInDate"
                                        type="date"
                                        value={dates.checkIn}
                                        onChange={handleCheckInChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-bold h-[50px] appearance-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkOutDate" className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('hotel.dates.checkout')}</label>
                                    <input
                                        id="checkOutDate"
                                        type="date"
                                        value={dates.checkOut}
                                        onChange={handleCheckOutChange}
                                        min={dates.checkIn}
                                        className={`w-full bg-[#0F172A] border rounded-xl p-3 text-white outline-none font-bold transition-all h-[50px] appearance-none ${dateError ? 'border-red-500 ring-1 ring-red-500/50' : 'border-white/10 focus:border-amber-500'
                                            }`}
                                    />
                                </div>
                            </div>
                            {/* ERROR MESSAGE */}
                            {dateError && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 animate-shake">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-bold text-red-500">{dateError}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Sieste Mode Inputs */
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <Sun className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-white">{t('hotel.siesta.fast')}</h3>
                            </div>
                            <div>
                                <label htmlFor="siesteDate" className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('hotel.siesta.date')}</label>
                                <input
                                    id="siesteDate"
                                    type="date"
                                    value={siesteTime.date}
                                    onChange={(e) => setSiesteTime({ ...siesteTime, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-bold mb-4 h-[50px] appearance-none"
                                />
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('hotel.siesta.duration')}</label>
                                <div className="flex gap-4 flex-wrap md:flex-nowrap">
                                    {[2, 3, 4, 6].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setSiesteTime({ ...siesteTime, hours: h })}
                                            className={`flex-1 min-w-[60px] py-3 rounded-xl font-bold border transition-all ${siesteTime.hours === h ? 'bg-amber-500 text-black border-amber-500 shadow-lg' : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'}`}
                                        >
                                            {h}h
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">{t('hotel.siesta.note')}</p>
                            </div>
                        </>
                    )}
                </div>

            </div>

            {/* FLOATING PILL FOOTER (Amber) */}
            <div className="fixed bottom-[90px] left-0 right-0 z-40 animate-slide-up px-4 md:px-0">
                <div className="max-w-xl mx-auto">
                    <button
                        onClick={handleBooking}
                        disabled={!selectedRoom || loading || !!dateError}
                        className="w-full bg-[#1e293b] flex-row-reverse rtl:flex-row border border-white/10 p-2 pl-3 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed hover:bg-[#253248]"
                    >
                        {/* Price Right */}
                        <div className="flex items-center gap-2 pl-2">
                            <span className="text-white font-black text-lg">
                                {dateError ? '--' : (paymentMethod === 'card' ? Math.round(totalPrice * 0.90) : totalPrice)}{' '}
                                <span className="text-xs font-bold text-gray-400">{t('hotel.book.dh')}</span>
                                {paymentMethod === 'card' && totalPrice > 0 && !dateError && (
                                    <span className="text-[10px] text-red-500 font-bold ml-1.5 bg-red-500/10 px-1 rounded animate-pulse">
                                        -10%
                                    </span>
                                )}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-black transition-colors rotate-180 rtl:rotate-0">←</div>
                        </div>

                        {/* Badge / Quantity Left */}
                        <div className="flex flex-row-reverse rtl:flex-row items-center gap-3">
                            <div className="text-right rtl:text-left">
                                <div className="text-white font-bold text-sm leading-tight">
                                    {bookingType === 'night' ? t('hotel.book.night') : t('hotel.book.siesta')}
                                </div>
                                <div className="text-gray-400 text-[10px] font-medium">
                                    {bookingType === 'night'
                                        ? (dateError ? t('hotel.book.invalid') : `${nights} ${t('hotel.book.nights_count')}`)
                                        : `${siesteTime.hours} ${t('hotel.book.hours_count')}`
                                    }
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold shadow-lg ${dateError ? 'bg-red-500' : 'bg-amber-500 shadow-amber-500/20'}`}>
                                {bookingType === 'night' ? (dateError ? '!' : nights) : '1'}
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
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BedDouble className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">{t('hotel.success.title')}</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            {t('hotel.success.desc').replace('{id}', showSuccess)}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full py-4 bg-amber-600 rounded-xl font-bold text-white shadow-lg"
                            >
                                {t('hotel.btn.view')}
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
                    serviceType="hotel"
                    tableName="hotel_reservations"
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
