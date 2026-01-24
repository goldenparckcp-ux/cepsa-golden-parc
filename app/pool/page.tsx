"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Info, Calendar, Clock, Minus, Plus, Users, CheckCircle } from 'lucide-react';

const POOL_PRICING: any = {
    adults: {
        label: 'Adultes (13+ ans)',
        morning: 100,      // 09:00 - 14:00
        afternoon: 100,    // 14:00 - 19:00
        full_day: 150      // 09:00 - 19:00
    },
    children: {
        label: 'Enfants (5-12 ans)',
        morning: 70,
        afternoon: 70,
        full_day: 100
    },
    infants: {
        label: 'Bébés (0-4 ans)',
        morning: 0,        // Free
        afternoon: 0,
        full_day: 0
    }
};

const TIME_SLOTS = [
    { id: 'morning', label: 'Matin (09:00 - 14:00)', icon: '🌅' },
    { id: 'afternoon', label: 'Après-midi (14:00 - 19:00)', icon: '☀️' },
    { id: 'full_day', label: 'Journée Complète (09:00 - 19:00)', icon: '🌞' }
];

export default function PoolBookingPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState<string>('full_day');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [notes, setNotes] = useState('');
    const [customerPhone, setCustomerPhone] = useState(''); // Need to capture phone if not logged in
    const [loading, setLoading] = useState(false);

    // Calculate total price
    const calculateTotal = () => {
        if (!selectedSlot) return 0;
        const adultsPrice = adults * POOL_PRICING.adults[selectedSlot];
        const childrenPrice = children * POOL_PRICING.children[selectedSlot];
        const infantsPrice = infants * POOL_PRICING.infants[selectedSlot];
        return adultsPrice + childrenPrice + infantsPrice;
    };

    const handleBooking = async () => {
        if (!customerPhone) {
            alert("Veuillez entrer votre numéro de téléphone.");
            return;
        }

        setLoading(true);
        const bookingNumber = `POOL-${Math.floor(1000 + Math.random() * 9000)}`;

        const { error } = await supabase.from('pool_bookings').insert({
            booking_number: bookingNumber,
            customer_phone: customerPhone,
            booking_date: selectedDate,
            time_slot: selectedSlot,
            adults,
            children,
            infants,
            total_price: calculateTotal(),
            status: 'active',
            notes: notes || undefined
        });

        if (error) {
            console.error(error);
            alert("Erreur lors de la réservation. Veuillez réessayer.");
        } else {
            alert("Réservation confirmée via WhatsApp !"); // Mock
            router.push('/');
        }
        setLoading(false);
    };

    const currentPricing = {
        adult: POOL_PRICING.adults[selectedSlot],
        child: POOL_PRICING.children[selectedSlot]
    };

    return (
        <div className="min-h-screen bg-[#1A2332] pb-24 font-sans text-gray-100">
            {/* Header */}
            <div className="bg-[#2C3E50] p-4 flex items-center sticky top-0 z-50 shadow-md">
                <button onClick={() => router.push('/')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-white text-xl font-bold flex-1 text-center">
                    🏊 Espace Piscine
                </h1>
                <div className="w-10" />
            </div>

            {/* Hero */}
            <div className="p-6">
                <div className="rounded-2xl overflow-hidden h-48 mb-4 relative shadow-lg">
                    <img
                        src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800"
                        className="w-full h-full object-cover"
                        alt="Pool"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <p className="text-white font-medium">Piscine chauffée • Vestiaires • Douches</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-t-3xl p-6 min-h-[500px] text-gray-900 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">

                {/* Inputs */}
                <div className="space-y-6">

                    {/* Phone Input (Crucial) */}
                    <div>
                        <label className="font-bold text-gray-900 mb-2 block">📱 Votre Numéro</label>
                        <input
                            type="tel"
                            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-cyan-500 outline-none font-bold text-lg"
                            placeholder="06..."
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-cyan-600" /> Sélectionnez une Date
                        </label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-cyan-500 outline-none font-bold"
                        />
                    </div>

                    {/* Time Slot */}
                    <div>
                        <label className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cyan-600" /> Choisissez un Créneau
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {TIME_SLOTS.map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setSelectedSlot(slot.id)}
                                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition text-left ${selectedSlot === slot.id
                                            ? 'border-cyan-500 bg-cyan-50 shadow-md ring-1 ring-cyan-500'
                                            : 'border-gray-200 hover:border-cyan-300'
                                        }`}
                                >
                                    <span className="text-3xl">{slot.icon}</span>
                                    <div>
                                        <div className="font-bold text-gray-900">{slot.label}</div>
                                        {selectedSlot === slot.id && <div className="text-cyan-600 text-sm font-bold mt-1">Sélectionné</div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Counters */}
                    <div>
                        <label className="font-bold text-gray-900 mb-3 block">👥 Nombre de Personnes</label>
                        <div className="space-y-4">
                            {/* Adults */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <div className="font-bold text-gray-900">👨 Adultes (13+)</div>
                                    <div className="text-sm text-gray-500 font-medium">{currentPricing.adult} DH / pers</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setAdults(Math.max(0, adults - 1))} className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-white text-gray-500 hover:bg-gray-100">-</button>
                                    <span className="text-xl font-bold w-6 text-center">{adults}</span>
                                    <button onClick={() => setAdults(adults + 1)} className="w-10 h-10 rounded-full border-2 border-cyan-500 flex items-center justify-center font-bold bg-cyan-500 text-white hover:bg-cyan-600">+</button>
                                </div>
                            </div>

                            {/* Children */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <div className="font-bold text-gray-900">🧒 Enfants (5-12)</div>
                                    <div className="text-sm text-gray-500 font-medium">{currentPricing.child} DH / pers</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-white text-gray-500 hover:bg-gray-100">-</button>
                                    <span className="text-xl font-bold w-6 text-center">{children}</span>
                                    <button onClick={() => setChildren(children + 1)} className="w-10 h-10 rounded-full border-2 border-cyan-500 flex items-center justify-center font-bold bg-cyan-500 text-white hover:bg-cyan-600">+</button>
                                </div>
                            </div>

                            {/* Infants */}
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                                <div>
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        👶 Bébés <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">GRATUIT</span>
                                    </div>
                                    <div className="text-sm text-green-600 font-bold">0 DH</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setInfants(Math.max(0, infants - 1))} className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-white text-gray-500 hover:bg-gray-100">-</button>
                                    <span className="text-xl font-bold w-6 text-center">{infants}</span>
                                    <button onClick={() => setInfants(infants + 1)} className="w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center font-bold bg-green-500 text-white hover:bg-green-600">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4">
                        <h3 className="font-bold text-gray-900 mb-3">💰 Récapitulatif</h3>
                        <div className="space-y-2 mb-4 text-sm">
                            {adults > 0 && <div className="flex justify-between"><span>{adults} Adulte(s)</span><span className="font-bold">{adults * currentPricing.adult} DH</span></div>}
                            {children > 0 && <div className="flex justify-between"><span>{children} Enfant(s)</span><span className="font-bold">{children * currentPricing.child} DH</span></div>}
                            {infants > 0 && <div className="flex justify-between text-green-700"><span>{infants} Bébé(s)</span><span className="font-bold">Gratuit</span></div>}
                        </div>
                        <div className="border-t-2 border-cyan-200 pt-3 flex justify-between items-center">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-3xl font-black text-cyan-600">{calculateTotal()} DH</span>
                        </div>
                    </div>

                    {/* Action */}
                    <button
                        onClick={handleBooking}
                        disabled={loading || (adults + children === 0) || !customerPhone}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {loading ? 'Traitement...' : 'Réserver Maintenant'}
                    </button>

                </div>
            </div>
        </div>
    );
}
