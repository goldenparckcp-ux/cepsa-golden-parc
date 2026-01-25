"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BedDouble, Users, Calendar, Wifi, Coffee, Star, ChevronLeft, CheckCircle2, Moon, Sun, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

const ROOM_TYPES = [
    {
        id: 'standard',
        name: 'Chambre Standard',
        price: 300,
        siestePrice: 150,
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        features: ['Wifi Gratuit', 'TV HD', 'Douche Italienne'],
        capacity: 2
    },
    {
        id: 'deluxe',
        name: 'Suite Deluxe',
        price: 500,
        siestePrice: 250,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        features: ['Vue Panoramique', 'Mini Bar', 'Salon Privé', 'Baignoire'],
        capacity: 2
    },
    {
        id: 'family',
        name: 'Suite Familiale',
        price: 700,
        siestePrice: 350,
        image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
        features: ['2 Lits Doubles', 'Espace Jeux', 'Kitchenette', 'Terrasse'],
        capacity: 4
    }
];

export default function HotelPage() {
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [bookingType, setBookingType] = useState<'night' | 'sieste'>('night');

    // Dates Logic
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [dateError, setDateError] = useState<string | null>(null);

    const [siesteTime, setSiesteTime] = useState({ date: '', hours: 3 });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    // Initial Defaults
    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        setDates({
            checkIn: todayStr,
            checkOut: tomorrowStr
        });
        setSiesteTime(prev => ({ ...prev, date: todayStr }));
    }, []);

    const activeRoom = ROOM_TYPES.find(r => r.id === selectedRoom);

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
            setDateError("La date de fin doit être après la date de départ !");
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

            const { error } = await supabase.from('hotel_bookings').insert({
                booking_number: bookingNum,
                customer_phone: profile.phone,
                room_type: bookingData.roomType,
                booking_type: bookingData.bookingType,
                check_in: bookingData.bookingType === 'night' ? bookingData.checkIn : bookingData.siesteDate,
                check_out: bookingData.bookingType === 'night' ? bookingData.checkOut : bookingData.siesteDate,
                nights: bookingData.bookingType === 'night' ? bookingData.nights : 0,
                duration_hours: bookingData.bookingType === 'sieste' ? bookingData.siesteHours : null,
                total_price: bookingData.totalPrice,
                status: 'pending',
                user_id: user.id
            });

            if (!error) {
                setShowSuccess(bookingNum);
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

        let userPhoneFromProfile = null;
        if (user) {
            const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            userPhoneFromProfile = data?.phone;
        }

        const commonData = {
            roomType: selectedRoom,
            bookingType,
            totalPrice
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

        if (!user || !userPhoneFromProfile) {
            localStorage.setItem('pendingHotelBooking', JSON.stringify(finalBookingData));
            router.push('/profile?redirect=/hotel');
            setLoading(false);
            return;
        }

        const bookingNum = `HOTEL-${Date.now().toString().slice(-6)}`;

        const { error } = await supabase.from('hotel_bookings').insert({
            booking_number: bookingNum,
            customer_phone: userPhoneFromProfile,
            room_type: selectedRoom,
            booking_type: bookingType,
            check_in: bookingType === 'night' ? dates.checkIn : siesteTime.date,
            check_out: bookingType === 'night' ? dates.checkOut : siesteTime.date,
            nights: bookingType === 'night' ? nights : 0,
            duration_hours: bookingType === 'sieste' ? siesteTime.hours : null,
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
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Hôtel & Repos</h1>
                </div>
            </div>

            <div className="p-5 md:p-8 space-y-6 max-w-6xl mx-auto">

                {/* MODE SWITCHER */}
                <div className="bg-[#1E293B] p-2 rounded-2xl border border-white/10 flex relative max-w-md mx-auto w-full">
                    <div className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-amber-500 rounded-xl transition-all duration-300 ${bookingType === 'sieste' ? 'left-[calc(50%+4px)]' : 'left-2'}`} />
                    <button
                        onClick={() => setBookingType('night')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 font-bold text-sm transition-colors ${bookingType === 'night' ? 'text-black' : 'text-gray-400'}`}
                    >
                        <Moon className="w-4 h-4" /> Nuitée
                    </button>
                    <button
                        onClick={() => setBookingType('sieste')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 font-bold text-sm transition-colors ${bookingType === 'sieste' ? 'text-black' : 'text-gray-400'}`}
                    >
                        <Sun className="w-4 h-4" /> Sieste (Jour)
                    </button>
                </div>

                {/* Room Gallery */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Choisir une Chambre</h3>
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
                                <div className="h-48 md:h-56 relative w-full">
                                    <img src={room.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                        <h3 className="text-xl font-black text-white leading-tight">{room.name}</h3>
                                        <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-amber-500 font-bold flex flex-col items-end shrink-0">
                                            {/* Dynamic Price Display */}
                                            {bookingType === 'night'
                                                ? <>{room.price} DH <span className="text-[10px] text-white/70 font-medium">/nuit</span></>
                                                : <>{room.siestePrice} DH <span className="text-[10px] text-white/70 font-medium">/sieste</span></>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 bg-[#1E293B] flex-1 transition-colors ${selectedRoom === room.id ? 'bg-amber-900/10' : ''}`}>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {room.features.map(f => (
                                            <span key={f} className="text-[10px] bg-white/5 border border-white/5 rounded-md px-2 py-1 text-gray-300">
                                                {f}
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

                {/* Conditional Inputs: Dates vs Hours */}
                <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10 space-y-4 animate-fade-in max-w-4xl mx-auto w-full">

                    {bookingType === 'night' ? (
                        /* Night Mode Inputs */
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-white">Dates de Séjour</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Date Départ</label>
                                    <input
                                        type="date"
                                        value={dates.checkIn}
                                        onChange={handleCheckInChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-bold h-[50px]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Date Fin</label>
                                    <input
                                        type="date"
                                        value={dates.checkOut}
                                        onChange={handleCheckOutChange}
                                        min={dates.checkIn}
                                        className={`w-full bg-[#0F172A] border rounded-xl p-3 text-white outline-none font-bold transition-all h-[50px] ${dateError ? 'border-red-500 ring-1 ring-red-500/50' : 'border-white/10 focus:border-amber-500'
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
                                <h3 className="font-bold text-white">Repos Rapide</h3>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Date</label>
                                <input
                                    type="date"
                                    value={siesteTime.date}
                                    onChange={(e) => setSiesteTime({ ...siesteTime, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-bold mb-4 h-[50px]"
                                />
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Durée Estimée</label>
                                <div className="flex gap-4">
                                    {[2, 3, 4, 6].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setSiesteTime({ ...siesteTime, hours: h })}
                                            className={`flex-1 py-3 rounded-xl font-bold border transition-all ${siesteTime.hours === h ? 'bg-amber-500 text-black border-amber-500 shadow-lg' : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'}`}
                                        >
                                            {h}h
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">*Tarif sieste unique applicable jusqu'à 6h.</p>
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
                        className="w-full bg-[#1e293b] border border-white/10 p-2 pl-3 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed hover:bg-[#253248]"
                    >
                        {/* Badge / Quantity Left */}
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold shadow-lg ${dateError ? 'bg-red-500' : 'bg-amber-500 shadow-amber-500/20'}`}>
                                {bookingType === 'night' ? (dateError ? '!' : nights) : '1'}
                            </div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm leading-tight">
                                    {bookingType === 'night' ? 'Réserver Nuitée' : 'Réserver Sieste'}
                                </div>
                                <div className="text-gray-400 text-[10px] font-medium">
                                    {bookingType === 'night'
                                        ? (dateError ? 'Date Invalide' : `${nights} Nuit(s)`)
                                        : `${siesteTime.hours} Heures`
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Price Right */}
                        <div className="flex items-center gap-2 pr-2">
                            <span className="text-white font-black text-lg">{dateError ? '--' : (totalPrice || 0)} <span className="text-xs font-bold text-gray-400">DH</span></span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-black transition-colors">→</div>
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
                        <h2 className="text-2xl font-black text-white mb-2">Réservation Reçue!</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Votre réservation <span className="text-white font-bold">#{showSuccess}</span> est en cours de traitement.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/orders')}
                                className="w-full py-4 bg-amber-600 rounded-xl font-bold text-white shadow-lg"
                            >
                                Voir mes Réservations
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
