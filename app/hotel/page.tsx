"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BedDouble, Calendar, ChevronLeft, CheckCircle2, Moon, Sun, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
const PaymentModal = dynamic(() => import('@/components/PaymentModal'), { ssr: false });
import { supabase } from '@/lib/supabase';
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
                .eq('page', 'hotel')
                .eq('is_active', true)
                .order('order_index', { ascending: true });
            
            if (data && data.length > 0) setHeroSlides(data);
        } catch {
            // silently fail
        }
    }, []);

    useEffect(() => { fetchHero(); }, [fetchHero]);

    // Carousel Auto-Scroll
    useEffect(() => {
        const interval = setInterval(() => {
            const container = document.getElementById("hotel-carousel-container");
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
        <div className="min-h-screen pt-16 md:pt-20 pb-52 bg-[#0B0F19] overflow-x-hidden w-full relative">

            {/* Page Header */}
            <div className="pt-6 pb-2 px-4 max-w-6xl mx-auto relative z-20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Moon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white leading-none tracking-tight">{t('hotel.title')}</h1>
                            <p className="text-sm text-gray-400 mt-1">Hôtel & Séjour</p>
                        </div>
                    </div>
                </div>
            </div>



            <div className="p-3 md:p-6 space-y-8 max-w-6xl mx-auto relative z-10">
                {/* Purple/Indigo glowing effect for high-end hotel ambiance */}
                <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[130px] pointer-events-none -z-10" />
                <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                {/* HERO BANNER CAROUSEL */}
                <div className="relative w-full h-[240px] sm:h-[300px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                    <div 
                        id="hotel-carousel-container"
                        onScroll={(e) => {
                            const target = e.target as HTMLElement;
                            const scrollLeft = target.scrollLeft;
                            const width = target.clientWidth;
                            const index = Math.round(scrollLeft / width);
                            const dots = document.querySelectorAll('.hotel-dot');
                            dots.forEach((dot, idx) => {
                                if (idx === index) {
                                    dot.classList.add('bg-amber-500', 'w-6');
                                    dot.classList.remove('bg-white/30', 'w-2');
                                } else {
                                    dot.classList.remove('bg-amber-500', 'w-6');
                                    dot.classList.add('bg-white/30', 'w-2');
                                }
                            });
                        }}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-0 scrollbar-hide w-full h-full scroll-smooth"
                    >
                        {(heroSlides.length > 0 ? heroSlides : [
                            {
                                id: 'fallback-1',
                                title: 'Votre Séjour de Rêve',
                                subtitle: 'Détente et confort absolu au cœur du Golden Park',
                                badge_text: 'OFFRE SPÉCIALE',
                                cta_text: 'Réserver',
                                image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
                            },
                            {
                                id: 'fallback-2',
                                title: 'Chambres Familiales',
                                subtitle: 'Spacieuses, modernes et équipées pour toute la famille',
                                badge_text: 'ESPACE FAMILLE',
                                cta_text: 'Découvrir',
                                image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
                            },
                            {
                                id: 'fallback-3',
                                title: 'Piscine & Détente',
                                subtitle: 'Accès gratuit à la piscine pour tous nos résidents',
                                badge_text: 'INCLUS DANS LE SÉJOUR',
                                cta_text: 'Explorer',
                                image_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80'
                            }
                        ]).map((slide, idx) => (
                            <div 
                                key={slide.id || idx}
                                className="relative w-full h-full shrink-0 snap-center flex items-center justify-between px-6 md:px-12 select-none"
                                style={{ minWidth: '100%' }}
                            >
                                <Image
                                    src={slide.image_url}
                                    alt={slide.title}
                                    fill
                                    priority={idx === 0}
                                    className="object-cover absolute inset-0 -z-10 brightness-[0.65] saturate-150 transition-transform duration-[20s] ease-linear hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/40 -z-10" />
                                
                                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-10 bg-gradient-to-r from-black/50 to-transparent">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-6">
                                        {/* Left: badge + title + subtitle */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-0 text-left">
                                            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 w-fit shadow-lg shadow-orange-500/20">
                                                🏨 {slide.badge_text}
                                            </span>
                                            <h2 className="text-white text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight drop-shadow-lg">
                                                {slide.title}
                                            </h2>
                                            <p className="text-white/80 text-[10px] sm:text-xs font-semibold line-clamp-2 drop-shadow leading-relaxed max-w-[400px]">
                                                {slide.subtitle}
                                            </p>
                                        </div>

                                        {/* Right: CTA button */}
                                        <div className="flex flex-col items-start md:items-end gap-2 shrink-0 w-full md:w-auto">
                                            <button
                                                onClick={() => {
                                                    document.getElementById('hotel-room-gallery')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="w-full md:w-auto py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                            >
                                                <BedDouble className="w-4 h-4" />
                                                <span>{slide.cta_text || 'Réserver'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {heroSlides.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                            {heroSlides.map((_, idx) => (
                                <span 
                                    key={idx} 
                                    className={`hotel-dot h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-amber-500 w-6' : 'bg-white/30 w-2'}`} 
                                />
                            ))}
                        </div>
                    )}
                </div>


                {/* MODE SWITCHER */}
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto w-full">
                    <div className="relative bg-[#111827]/40 p-1.5 rounded-full border border-white/5 flex w-full shadow-2xl backdrop-blur-md">
                        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-500 ease-in-out shadow-lg
                            ${bookingType === 'night'
                                ? 'left-1.5 bg-gradient-to-br from-amber-500 to-orange-600 shadow-orange-500/30'
                                : 'left-[calc(50%+4px)] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30'
                            }`}
                        />
                        <button
                            onClick={() => setBookingType('night')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-3xl relative z-10 font-bold text-sm transition-all duration-300
                                ${bookingType === 'night' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Moon className={`w-4 h-4 transition-transform duration-300 ${bookingType === 'night' ? 'scale-110' : ''}`} />
                            <span>{t('hotel.night_mode')}</span>
                        </button>
                        <button
                            onClick={() => setBookingType('sieste')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-3xl relative z-10 font-bold text-sm transition-all duration-300
                                ${bookingType === 'sieste' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Sun className={`w-4 h-4 transition-transform duration-300 ${bookingType === 'sieste' ? 'scale-110 rotate-12' : ''}`} />
                            <span>{t('hotel.siesta_mode')}</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 font-semibold tracking-wide">
                        {bookingType === 'night' ? '🌙 Réservation complète pour la nuit' : '☀️ Repos de quelques heures en journée'}
                    </p>
                </div>

                {/* Room Gallery */}
                <div id="hotel-room-gallery" className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('hotel.choose_room')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {ROOM_TYPES.map(room => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoom(room.id)}
                                className={`rounded-[2rem] overflow-hidden border transition-all duration-500 relative group cursor-pointer h-full flex flex-col ${selectedRoom === room.id
                                    ? 'border-amber-500 ring-4 ring-amber-500/10 shadow-2xl shadow-orange-500/10 transform md:-translate-y-2'
                                    : 'border-white/5 bg-[#111827]/30 hover:border-white/20'
                                    }`}
                            >
                                <div className="h-40 md:h-44 relative w-full">
                                    <Image src={room.image} alt={t(room.nameKey)} fill title={t(room.nameKey)} className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                                        <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{t(room.nameKey)}</h3>
                                        <div className="bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-amber-400 font-extrabold flex flex-col items-end shrink-0 shadow-lg">
                                            {/* Dynamic Price Display */}
                                            {bookingType === 'night'
                                                ? <span className="text-sm">{room.price} DH <span className="text-[9px] text-white/60 font-medium">/{t('hotel.per_night')}</span></span>
                                                : <span className="text-sm">{room.siestePrice} DH <span className="text-[9px] text-white/60 font-medium">/{t('hotel.per_siesta')}</span></span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-5 flex-1 transition-colors duration-500 flex flex-col justify-between ${selectedRoom === room.id ? 'bg-amber-500/5' : 'bg-[#111827]/40'}`}>
                                    <div className="flex flex-wrap gap-2">
                                        {room.featuresKeys.map(key => (
                                            <span key={key} className="text-[9px] bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 text-gray-300 font-bold uppercase tracking-wider">
                                                {t(key)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedRoom === room.id && (
                                    <div className="absolute top-4 right-4 bg-amber-500 text-black p-1.5 rounded-full shadow-lg z-10">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mode de Paiement Selector */}
                <div className="bg-[#111827]/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-4 max-w-4xl mx-auto w-full shadow-2xl">
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

                {/* Conditional Inputs: Dates vs Hours */}
                <div className="bg-[#111827]/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-4 max-w-4xl mx-auto w-full shadow-2xl">

                    {bookingType === 'night' ? (
                        <>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-white uppercase text-xs tracking-wider">{t('hotel.dates.stay')}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="checkInDate" className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-wider">{t('hotel.dates.checkin')}</label>
                                <input
                                    id="checkInDate"
                                    type="date"
                                    value={dates.checkIn}
                                    onChange={handleCheckInChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-[#0B0F19]/80 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-bold h-[50px] appearance-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="checkOutDate" className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-wider">{t('hotel.dates.checkout')}</label>
                                <input
                                    id="checkOutDate"
                                    type="date"
                                    value={dates.checkOut}
                                    onChange={handleCheckOutChange}
                                    min={dates.checkIn}
                                    className={`w-full bg-[#0B0F19]/80 border rounded-xl p-3 text-white outline-none font-bold transition-all h-[50px] appearance-none ${dateError ? 'border-red-500 ring-1 ring-red-500/50' : 'border-white/10 focus:border-amber-500'
                                        }`}
                                />
                            </div>
                        </div>
                        {dateError && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-center gap-2 animate-shake">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-red-500">{dateError}</span>
                            </div>
                        )}
                        </>
                    ) : (
                        <>
                        <div className="flex items-center gap-2 mb-2">
                            <Sun className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-white uppercase text-xs tracking-wider">{t('hotel.siesta.fast')}</h3>
                        </div>
                        <div>
                            <label htmlFor="siesteDate" className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-wider">{t('hotel.siesta.date')}</label>
                            <input
                                id="siesteDate"
                                type="date"
                                value={siesteTime.date}
                                onChange={(e) => setSiesteTime({ ...siesteTime, date: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-[#0B0F19]/80 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-bold mb-4 h-[50px] appearance-none"
                            />
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-wider">{t('hotel.siesta.duration')}</label>
                            <div className="flex gap-4 flex-wrap md:flex-nowrap">
                                {[2, 3, 4, 6].map(h => (
                                    <button
                                        key={h}
                                        onClick={() => setSiesteTime({ ...siesteTime, hours: h })}
                                        className={`flex-1 min-w-[60px] py-3.5 rounded-xl font-bold border transition-all ${siesteTime.hours === h ? 'bg-amber-500 text-black border-amber-500 shadow-lg' : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-3 font-medium">{t('hotel.siesta.note')}</p>
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
                        className="w-full bg-[#111827]/80 backdrop-blur-md flex-row-reverse rtl:flex-row border border-white/10 p-2.5 pl-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed hover:border-amber-500/30"
                    >
                        {/* Price Right */}
                        <div className="flex items-center gap-2 pl-2">
                            <span className="text-white font-black text-lg">
                                {dateError ? '--' : (paymentMethod === 'card' ? Math.round(totalPrice * 0.90) : totalPrice)}{' '}
                                <span className="text-xs font-bold text-gray-400">DH</span>
                                {paymentMethod === 'card' && totalPrice > 0 && !dateError && (
                                    <span className="text-[10px] text-red-500 font-bold ml-1.5 bg-red-500/10 px-1.5 py-0.5 rounded animate-pulse">
                                        -10%
                                    </span>
                                )}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-black transition-colors rotate-180 rtl:rotate-0">←</div>
                        </div>

                        {/* Badge / Quantity Left */}
                        <div className="flex flex-row-reverse rtl:flex-row items-center gap-3">
                            <div className="text-right rtl:text-left">
                                <div className="text-white font-extrabold text-xs uppercase tracking-wider leading-tight">
                                    {bookingType === 'night' ? t('hotel.book.night') : t('hotel.book.siesta')}
                                </div>
                                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                    {bookingType === 'night'
                                        ? (dateError ? t('hotel.book.invalid') : `${nights} ${t('hotel.book.nights_count')}`)
                                        : `${siesteTime.hours} ${t('hotel.book.hours_count')}`
                                    }
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-black shadow-lg ${dateError ? 'bg-red-500' : 'bg-amber-500 shadow-amber-500/25'}`}>
                                {bookingType === 'night' ? (dateError ? '!' : nights) : '1'}
                            </div>
                        </div>
                    </button>
                </div>
            </div>



            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in">
                    <div className="bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl relative">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/5">
                            <BedDouble className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{t('hotel.success.title')}</h2>
                        <p className="text-sm text-gray-400 mb-6 font-medium leading-relaxed">
                            {t('hotel.success.desc').replace('{id}', showSuccess)}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition-all"
                            >
                                {t('hotel.btn.view')}
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
