"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Calendar, Info, Minus, Plus, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { useCart } from "@/lib/state/CartContext";
import { useUI } from "@/lib/state/UIContext";

// Interface for Pricing Structure
interface PricingTier {
    label: string;
    morning: number;
    afternoon: number;
    full_day: number;
}

interface PoolPricing {
    adults: PricingTier;
    children: PricingTier;
    infants: PricingTier;
}

const POOL_PRICING: PoolPricing = {
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

type PricingSlot = 'morning' | 'afternoon' | 'full_day';

const TIME_SLOTS: { id: PricingSlot; label: string; icon: string }[] = [
    { id: 'morning', label: 'Matin (09:00 - 14:00)', icon: '🌅' },
    { id: 'afternoon', label: 'Après-midi (14:00 - 19:00)', icon: '☀️' },
    { id: 'full_day', label: 'Journée Complète (09:00 - 19:00)', icon: '🌞' }
];

export default function PoolBookingPage() {
    const router = useRouter();
    const { addItem, isCartOpen, openCart } = useCart();
    const { requirePhone } = useUI();

    // Explicitly define state type
    const [selectedSlot, setSelectedSlot] = useState<PricingSlot | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate total price dynamically
    const calculateTotal = () => {
        if (!selectedSlot) return 0;

        // At this point, selectedSlot is 'morning' | 'afternoon' | 'full_day'
        // But TS might need reassurance
        const slot = selectedSlot;

        const adultsPrice = adults * POOL_PRICING.adults[slot];
        const childrenPrice = children * POOL_PRICING.children[slot];
        const infantsPrice = infants * POOL_PRICING.infants[slot];

        return adultsPrice + childrenPrice + infantsPrice;
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;

        requirePhone({
            reason: 'reservation',
            onVerified: async () => {
                setIsSubmitting(true);

                // Construct Booking Reference
                const bookingRef = `POOL-${Date.now().toString().slice(-6)}`;
                const total = calculateTotal();

                // Add to Cart Logic
                addItem({
                    id: bookingRef,
                    name: `Piscine - ${POOL_PRICING.adults.label}`,
                    price: total,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1572331165267-854da2b00ca1?auto=format&fit=crop&w=800',
                    type: 'pool',
                    notes: `Date: ${date} | Slot: ${selectedSlot} | A: ${adults}, C: ${children}, I: ${infants}`
                });

                // Simulate processing
                setTimeout(() => {
                    setIsSubmitting(false);
                    if (!isCartOpen) openCart();
                }, 500);
            }
        });
    };

    const Counter = ({ label, value, setter, min = 0, max = 10 }: { label: string, value: number, setter: (v: number) => void, min?: number, max?: number }) => (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-medium text-white">{label}</span>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setter(Math.max(min, value - 1))}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition disabled:opacity-50"
                    disabled={value <= min}
                    aria-label={`Diminuer ${label}`}
                >
                    <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="w-4 text-center font-bold text-white">{value}</span>
                <button
                    type="button"
                    onClick={() => setter(Math.min(max, value + 1))}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition disabled:opacity-50"
                    disabled={value >= max}
                    aria-label={`Augmenter ${label}`}
                >
                    <Plus className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-40 bg-[#0F172A] text-white font-sans selection:bg-red-500/30">

            {/* Header */}
            <div className="fixed top-0 inset-x-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        aria-label="Retour à l'accueil"
                        className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg tracking-tight">Réservation Piscine</span>
                    <div className="w-10" />
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative h-[35vh] w-full overflow-hidden mt-16">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/50 to-[#0F172A] z-10" />
                <img
                    src="https://images.unsplash.com/photo-1572331165267-854da2b00ca1?auto=format&fit=crop&w=800&q=80"
                    alt="Piscine Luxueuse"
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur text-white text-xs font-bold mb-3 shadow-lg shadow-red-600/20">
                        <Sparkles className="w-3 h-3" />
                        <span>PREMIUM RESORT</span>
                    </div>
                    <h1 className="text-3xl font-black mb-2 leading-none">Oasis Pool <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Club</span></h1>
                </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBooking} className="px-4 -mt-4 relative z-30 space-y-6 max-w-md mx-auto">

                {/* Date Selection */}
                <div className="bg-[#1E293B] rounded-3xl p-6 border border-white/5 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Date de visite</h3>
                            <p className="text-xs text-gray-400">Réservez votre transat</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <input
                            type="date"
                            aria-label="Date de réservation"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all appearance-none relative z-10"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Slot Selection */}
                <div className="bg-[#1E293B] rounded-3xl p-6 border border-white/5 shadow-xl">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-500" />
                        Choisissez votre formule
                    </h3>
                    <div className="grid gap-3">
                        {TIME_SLOTS.map((slot) => (
                            <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedSlot(slot.id)}
                                className={`p-4 rounded-xl border text-left transition-all ${selectedSlot === slot.id
                                        ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500'
                                        : 'bg-[#0F172A] border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-white flex items-center gap-2">
                                        <span>{slot.icon}</span> {slot.label}
                                    </span>
                                    {selectedSlot === slot.id && <CheckCircle className="w-5 h-5 text-amber-500" />}
                                </div>
                                <div className="mt-2 text-xs text-gray-400 pl-8">
                                    À partir de <span className="text-amber-500 font-bold">{POOL_PRICING.adults[slot.id]} DH</span> / personne
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* People Count */}
                {selectedSlot && (
                    <div className="bg-[#1E293B] rounded-3xl p-6 border border-white/5 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-white mb-4">Invités</h3>
                        <div className="space-y-3">
                            <Counter label="Adultes" value={adults} setter={setAdults} min={1} />
                            <Counter label="Enfants (5-12ans)" value={children} setter={setChildren} />
                            <Counter label="Bébés (0-4ans)" value={infants} setter={setInfants} />
                        </div>
                    </div>
                )}

                {/* Total & Submit */}
                <div className="fixed bottom-0 inset-x-0 p-4 bg-[#0F172A]/90 backdrop-blur-xl border-t border-white/10 z-40">
                    <div className="max-w-md mx-auto flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-gray-400">Total estimé</p>
                            <p className="text-2xl font-black text-white">{calculateTotal()} <span className="text-sm text-amber-500">DH</span></p>
                        </div>
                        <button
                            type="submit"
                            disabled={!selectedSlot || isSubmitting}
                            className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${!selectedSlot || isSubmitting
                                    ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:brightness-110 shadow-red-600/20'
                                }`}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Réserver'}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}
