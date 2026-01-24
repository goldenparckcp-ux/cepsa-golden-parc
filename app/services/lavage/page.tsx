"use client";

import React, { useState } from 'react';
import { ArrowLeft, Check, Clock, Calendar as CalendarIcon, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

const LAVAGE_SERVICES = [
    {
        id: 1,
        name: "Lavage Express",
        duration: "15 min",
        price: 50,
        description: "Lavage extérieur + Jantes"
    },
    {
        id: 2,
        name: "Lavage Complet",
        duration: "30 min",
        price: 100,
        description: "Extérieur + Intérieur + Aspirateur + Vitres"
    },
    {
        id: 3,
        name: "Lavage Vapeur Premium",
        duration: "45 min",
        price: 200,
        description: "Nettoyage vapeur profond + Polish"
    }
];

export default function LavagePage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Service, 2: Time, 3: Phone/Confirm
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [phone, setPhone] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Time Slots
    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

    const handleServiceSelect = (service: any) => {
        setSelectedService(service);
        setStep(2);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep(3);
    };

    const handleSubmit = async () => {
        if (!phone || !selectedService || !selectedTime) return;
        setIsSubmitting(true);

        const bookingData = {
            booking_number: `LAV-${Date.now().toString().slice(-4)}`,
            customer_phone: phone,
            service_type: "lavage",
            service_id: selectedService.id,
            service_name: selectedService.name,
            scheduled_date: selectedDate,
            time_slot: selectedTime,
            duration: selectedService.duration,
            price: selectedService.price,
            vehicle_info: vehicleInfo || "Non spécifié",
            status: "scheduled"
        };

        const { error } = await supabase.from('service_bookings').insert(bookingData);

        if (error) {
            console.error("Lavage Booking Error:", error);
            alert("Erreur lors de la réservation: " + error.message);
            setIsSubmitting(false);
            return;
        }

        alert("Réservation confirmée !");
        router.push('/orders');
    };

    return (
        <div className="min-h-screen p-4 pb-40" style={{ backgroundColor: COLORS.bgDark }}>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 text-white">
                <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 rounded-full bg-white/10">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Lavage Auto</h1>
            </div>

            {/* Steps Progress */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= s ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-transparent border-white/20 text-white/50'
                            }`}>
                            {step > s ? <Check className="w-4 h-4" /> : s}
                        </div>
                        <span className={`text-xs ${step >= s ? 'text-white' : 'text-white/30'}`}>
                            {s === 1 ? 'Service' : s === 2 ? 'Créneau' : 'Infos'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step 1: Services */}
            {step === 1 && (
                <div className="grid gap-4">
                    {LAVAGE_SERVICES.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service)}
                            className="text-left bg-[#1E293B] p-6 rounded-2xl border border-white/10 hover:border-cyan-500 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 trasition-colors">{service.name}</h3>
                                <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm font-bold">
                                    {service.price} DH
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                <Clock className="w-4 h-4" />
                                <span>Durée env. {service.duration}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Time Selection */}
            {step === 2 && (
                <div className="animate-fade-in">
                    <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 mb-6">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Date</label>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                            <CalendarIcon className="w-5 h-5 text-cyan-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="bg-transparent text-white outline-none w-full"
                            />
                        </div>
                    </div>

                    <h3 className="text-white font-bold mb-4">Créneaux Disponibles</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((time) => (
                            <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className="py-3 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-white border border-white/10 text-gray-300 font-bold transition-all"
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Info & Confirm */}
            {step === 3 && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10">
                        <h3 className="text-white font-bold text-lg mb-4">Récapitulatif</h3>

                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-gray-400">Service</span>
                            <span className="text-white font-bold">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-gray-400">Date & Heure</span>
                            <span className="text-white font-bold">{selectedDate} à {selectedTime}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-400">Prix Total</span>
                            <span className="text-cyan-400 text-xl font-black">{selectedService?.price} DH</span>
                        </div>
                    </div>

                    <div className="space-y-4 pb-24">
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Véhicule (Marque et Modèle)</label>
                            <input
                                type="text"
                                value={vehicleInfo}
                                onChange={(e) => setVehicleInfo(e.target.value)}
                                placeholder="Ex: Toyota Corolla"
                                className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Numéro de Téléphone</label>
                            <div className="flex items-center gap-3 bg-[#1E293B] border border-white/10 rounded-xl p-4 focus-within:border-cyan-500 transition-colors">
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
                    </div>

                    <div className="fixed bottom-24 left-4 right-4 z-40">
                        <button
                            onClick={handleSubmit}
                            disabled={!phone || isSubmitting}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-lg shadow-2xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/20 backdrop-blur-xl"
                        >
                            {isSubmitting ? "Traitement..." : `Confirmer (${selectedService?.price} DH)`}
                        </button>
                    </div>
                </div>
            )}

        </div >
    );
}
