"use client";

import React, { useState, useEffect } from "react";
import { Car, Wrench, Calendar, Clock, ChevronLeft, CheckCircle2, Droplets, Gauge } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

const SERVICES_CONFIG = [
    {
        id: "lavage",
        name: "Lavage & Soin",
        icon: Droplets,
        description: "Lavage complet, nettoyage moteur, polissage.",
        image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800",
        options: [
            { id: "basic", label: "Lavage Rapide", price: 40, duration: "30 min" },
            { id: "complet", label: "Lavage Complet + Moteur", price: 80, duration: "1h" },
            { id: "premium", label: "Premium (Polissage)", price: 250, duration: "2h" },
        ]
    },
    {
        id: "mechanic",
        name: "Mécanique Rapide",
        icon: Wrench,
        description: "Vidange, Diagnostic, Freins, Pneumatiques.",
        image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800",
        options: [
            { id: "vidange", label: "Vidange Huile", price: 150, duration: "45 min" },
            { id: "diag", label: "Diagnostic Complet", price: 100, duration: "30 min" },
            { id: "freins", label: "Changement Plaquettes", price: 120, duration: "1h" },
        ]
    }
];

// ... (keeping imports and helpers as is)

function AutoServiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'mechanic' ? 'mechanic' : 'lavage';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState("10:00");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    const activeService = SERVICES_CONFIG.find(s => s.id === activeTab);
    const selectedPrice = activeService?.options.find(o => o.id === selectedOption)?.price || 0;

    // --- AUTO-BOOKING LOGIC ---
    useEffect(() => {
        const attemptAutoBook = async () => {
            const pending = localStorage.getItem('pendingServiceBooking');
            if (!pending) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            if (!profile?.phone) return;

            // Execute Pending Booking
            const bookingData = JSON.parse(pending);
            setLoading(true);

            // Mock DB Insert (Replace with actual table insert)
            // For now simulating success to show UI flow
            // In real app: supabase.from('service_bookings').insert(...) 
            const bookingNum = `SRV-${Date.now().toString().slice(-6)}`;

            // Actual Insert
            const { error } = await supabase.from('service_bookings').insert({
                booking_number: bookingNum,
                customer_phone: profile.phone,
                service_type: bookingData.serviceType,
                service_name: bookingData.optionId, // Storing option ID as name for simplicity or lookup
                scheduled_date: bookingData.date,
                time_slot: bookingData.time,
                price: bookingData.price,
                status: 'pending',
                user_id: user.id
            });


            if (!error) {
                setShowSuccess(bookingNum);
                localStorage.removeItem('pendingServiceBooking');
            }
            setLoading(false);
        };
        attemptAutoBook();
    }, []);

    const handleBooking = async () => {
        if (!selectedOption) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        // --- REDIRECT LOGIC ---
        // Need to check specific profile phone if necessary, but checking user mainly
        let userPhoneFromProfile = null;
        if (user) {
            const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            userPhoneFromProfile = data?.phone;
        }

        if (!user || (!phone && !userPhoneFromProfile)) {
            const bookingData = {
                serviceType: activeTab,
                optionId: selectedOption,
                date,
                time,
                price: selectedPrice
            };
            localStorage.setItem('pendingServiceBooking', JSON.stringify(bookingData));
            router.push('/profile?redirect=/services/auto');
            setLoading(false);
            return;
        }

        const bookingNum = `SRV-${Date.now().toString().slice(-6)}`;

        const { error } = await supabase.from('service_bookings').insert({
            booking_number: bookingNum,
            customer_phone: phone || userPhoneFromProfile,
            service_type: activeTab,
            service_name: selectedOption, // Storing option ID 
            scheduled_date: date,
            time_slot: time,
            price: selectedPrice,
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
        <div className="min-h-screen pb-72 bg-[#0F172A]" style={{ backgroundColor: COLORS.bgDark }}>

            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 p-4 pt-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Services Auto</h1>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl mt-6 border border-white/10">
                    {SERVICES_CONFIG.map(s => (
                        <button
                            key={s.id}
                            onClick={() => { setActiveTab(s.id); setSelectedOption(null); }}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === s.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <s.icon className="w-4 h-4" />
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 space-y-6">

                {/* Hero Image */}
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img src={activeService?.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                    <div className="absolute bottom-4 left-4">
                        <div className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded inline-block mb-1">PREMIUM</div>
                        <h2 className="text-xl font-black text-white">{activeService?.name}</h2>
                    </div>
                </div>

                {/* Options Grid */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Choisir une Formule</h3>
                    <div className="space-y-3">
                        {activeService?.options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedOption(opt.id)}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${selectedOption === opt.id
                                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                                    : 'bg-[#1E293B] border-white/5 hover:bg-[#1E293B]/80'
                                    }`}
                            >
                                <div className="text-left">
                                    <div className={`font-bold ${selectedOption === opt.id ? 'text-blue-400' : 'text-white'}`}>{opt.label}</div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {opt.duration}
                                    </div>
                                </div>
                                <div className="text-lg font-black text-white">{opt.price} DH</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date & Time */}
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Date Rendez-vous</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Heure</label>
                        <div className="flex flex-wrap gap-2">
                            {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTime(t)}
                                    className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${time === t
                                        ? 'bg-blue-500 border-blue-500 text-white'
                                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>



            </div>

            {/* SOLID CURTAIN */}
            <div className="fixed inset-x-0 bottom-0 h-[260px] bg-[#0F172A] z-30 pointer-events-none" />
            <div className="fixed inset-x-0 bottom-[260px] h-16 bg-gradient-to-t from-[#0F172A] to-transparent z-30 pointer-events-none" />

            {/* Footer Action */}
            <div className="fixed bottom-[110px] left-0 right-0 p-4 bg-[#0F172A] border-t border-white/10 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Prix Estimé</span>
                        <div className="text-3xl font-black text-amber-500 leading-none">{selectedPrice} <span className="text-sm font-bold text-gray-500">DH</span></div>
                    </div>
                </div>
                <button
                    onClick={handleBooking}
                    disabled={!selectedOption || loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-extrabold text-lg shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Traitement...' : 'Réserver Rendez-vous'}
                </button>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Rendez-vous Confirmé!</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Votre réservation <span className="text-white font-bold">#{showSuccess}</span> a été enregistrée avec succès.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/orders')}
                                className="w-full py-4 bg-blue-600 rounded-xl font-bold text-white shadow-lg"
                            >
                                Voir mes Rendez-vous
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

export default function AutoServicePage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading Service...</div>}>
            <AutoServiceContent />
        </React.Suspense>
    );
}
