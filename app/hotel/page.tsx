"use client";

import React, { useMemo, useState } from "react";
import { Moon, BedDouble, Users, Clock, CheckCircle2, Star, ChevronLeft, Phone } from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

const ROOM_CONFIGS = [
    {
        id: "single",
        label: "Single (1 Person)",
        icon: BedDouble,
        price_half_day: 100,
        price_full_night: 150,
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800"
    },
    {
        id: "double",
        label: "Double (Couple)",
        icon: Users,
        price_half_day: 150,
        price_full_night: 200,
        image: "https://images.unsplash.com/photo-1590490360182-137d62341e1f?auto=format&fit=crop&w=800"
    }
];

export default function HotelPage() {
    const router = useRouter();
    const [stayType, setStayType] = useState<"full_night" | "half_day">("full_night");
    const [roomType, setRoomType] = useState("single");
    const [checkInTime, setCheckInTime] = useState<string>("22:00");
    const [checkInDate, setCheckInDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const checkInOptions = useMemo(() => {
        if (stayType === 'full_night') {
            return ["20:00", "21:00", "22:00", "23:00", "00:00"];
        }
        return ["09:00", "12:00", "15:00", "18:00"]; // Half day slots
    }, [stayType]);

    const selectedRoom = useMemo(() => ROOM_CONFIGS.find(r => r.id === roomType) || ROOM_CONFIGS[0], [roomType]);

    const price = useMemo(() => {
        return stayType === 'full_night' ? selectedRoom.price_full_night : selectedRoom.price_half_day;
    }, [stayType, selectedRoom]);

    const handleBooking = async () => {
        if (!phone) return;
        setLoading(true);

        const reservationId = `HTL-${Date.now().toString().slice(-4)}`;
        const checkInDateTime = `${checkInDate} ${checkInTime}:00`; // Simple formatting

        const { error } = await supabase.from('hotel_reservations').insert({
            reservation_id: reservationId,
            customer_phone: phone,
            room_number: Math.floor(Math.random() * 20) + 1, // Auto-assign ID for now
            room_type: roomType,
            check_in_time: checkInDateTime,
            duration: stayType,
            price: price,
            status: 'reserved'
        });

        if (error) {
            console.error("Hotel Booking Error:", error);
            alert("Erreur lors de la réservation: " + error.message);
        } else {
            alert("Réservation confirmée !");
            router.push('/orders');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pb-40" style={{ backgroundColor: COLORS.bgDark, color: 'white' }}>

            <div className="p-4 flex items-center gap-4 sticky top-0 bg-[#0A1929] z-20 border-b border-white/10">
                <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Hôtel & Repos</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Hero */}
                <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl">
                    <img src={selectedRoom.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                        <div>
                            <span className="bg-amber-500 text-black text-xs font-black px-2 py-1 rounded">PREMIUM</span>
                            <h2 className="text-2xl font-bold mt-2">Détente & Confort</h2>
                        </div>
                    </div>
                </div>

                {/* Stay Type */}
                <div className="bg-[#1E293B] p-1 rounded-xl border border-white/10 flex">
                    <button
                        onClick={() => setStayType('full_night')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${stayType === 'full_night' ? 'bg-[#0A1929] text-white shadow' : 'text-gray-400'
                            }`}
                    >
                        <Moon className="w-4 h-4" /> Nuit Complète
                    </button>
                    <button
                        onClick={() => setStayType('half_day')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${stayType === 'half_day' ? 'bg-[#0A1929] text-white shadow' : 'text-gray-400'
                            }`}
                    >
                        <Clock className="w-4 h-4" /> Repos (6h)
                    </button>
                </div>

                {/* Room Type */}
                <div>
                    <h3 className="font-bold mb-3 text-gray-400 text-sm uppercase">Type de Chambre</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {ROOM_CONFIGS.map(r => (
                            <button
                                key={r.id}
                                onClick={() => setRoomType(r.id)}
                                className={`p-4 rounded-xl border transition-all text-left relative ${roomType === r.id
                                    ? 'bg-amber-500/10 border-amber-500'
                                    : 'bg-[#1E293B] border-white/10 opacity-70'
                                    }`}
                            >
                                <r.icon className={`w-6 h-6 mb-2 ${roomType === r.id ? 'text-amber-500' : 'text-gray-400'}`} />
                                <div className="font-bold text-sm">{r.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date & Time */}
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10">
                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Date d'arrivée</label>
                        <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-[#0A1929] border border-white/10 rounded-lg p-3 outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Heure d'arrivée</label>
                        <div className="flex flex-wrap gap-2">
                            {checkInOptions.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setCheckInTime(t)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${checkInTime === t
                                        ? 'bg-amber-500 border-amber-500 text-black'
                                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Téléphone</label>
                    <div className="flex items-center gap-3 bg-[#1E293B] border border-white/10 rounded-xl p-4 focus-within:border-amber-500 transition-colors">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+212 6..."
                            className="w-full bg-transparent text-white outline-none font-bold"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="fixed bottom-20 left-0 right-0 p-4 bg-[#0F172A] border-t border-white/10 backdrop-blur-lg safe-area-bottom z-50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-400">Total à payer</div>
                        <div className="text-2xl font-black text-amber-500">{price} DH</div>
                    </div>
                    <button
                        onClick={handleBooking}
                        disabled={!phone || loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-lg shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Confirmation...' : 'Réserver la Chambre'}
                    </button>
                </div>

            </div>
        </div>
    );
}
