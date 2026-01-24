"use client";

import React, { useState } from 'react';
import { ArrowLeft, Check, Calendar as CalendarIcon, Phone, AlertTriangle, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

const MECANIQUE_SERVICES = [
    { id: 1, name: "Vidange Complète", price: 300 },
    { id: 2, name: "Changement Pneus", price: 400 },
    { id: 3, name: "Freins", price: 350 },
    { id: 4, name: "Batterie", price: 200 },
    { id: 5, name: "Diagnostic Complet", price: 150 }
];

export default function MecaniquePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [appointmentType, setAppointmentType] = useState<'scheduled' | 'urgence'>('scheduled');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [phone, setPhone] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Time Slots
    const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

    const toggleService = (id: number) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const totalPrice = selectedServices.reduce((sum, id) => {
        const service = MECANIQUE_SERVICES.find(s => s.id === id);
        return sum + (service?.price || 0);
    }, 0);

    const handleSubmit = async () => {
        if (!phone || selectedServices.length === 0) return;
        setIsSubmitting(true);

        const serviceNames = selectedServices.map(id => MECANIQUE_SERVICES.find(s => s.id === id)?.name);

        const bookingData = {
            booking_number: `MEC-${Date.now().toString().slice(-4)}`,
            customer_phone: phone,
            service_type: "mecanique",
            services: serviceNames,
            scheduled_time: appointmentType === 'scheduled' ? `${selectedDate} ${selectedTime}` : new Date().toISOString(),
            appointment_type: appointmentType,
            vehicle_info: vehicleInfo || "Non spécifié",
            notes: notes,
            price: totalPrice,
            status: "scheduled"
        };

        const { error } = await supabase.from('service_bookings').insert(bookingData);

        if (error) {
            console.error("Mecanique Booking Error:", error);
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
                <h1 className="text-2xl font-bold">Mécanique</h1>
            </div>

            {/* Step 1: Select Services */}
            {step === 1 && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-[#1E293B] p-4 rounded-xl border border-red-500/30 bg-red-500/10 mb-6 flex gap-3 items-start">
                        <AlertTriangle className="text-red-500 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-white font-bold text-sm">Urgence ?</h3>
                            <p className="text-gray-400 text-xs">Si vous êtes en panne sur l'autoroute, sélectionnez "Urgence" à l'étape suivante.</p>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {MECANIQUE_SERVICES.map((service) => {
                            const selected = selectedServices.includes(service.id);
                            return (
                                <button
                                    key={service.id}
                                    onClick={() => toggleService(service.id)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selected
                                        ? 'bg-orange-500/20 border-orange-500 text-white'
                                        : 'bg-[#1E293B] border-white/10 text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${selected ? 'bg-orange-500 border-orange-500' : 'border-gray-500'
                                            }`}>
                                            {selected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="font-bold">{service.name}</span>
                                    </div>
                                    <span className="font-bold text-orange-400">{service.price} DH</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="fixed bottom-20 left-0 right-0 p-4 bg-[#0F172A] border-t border-white/10 backdrop-blur-lg z-50 safe-area-bottom">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <span className="text-gray-400">Total estimé</span>
                            <span className="text-2xl font-black text-orange-500">{totalPrice} DH</span>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedServices.length === 0}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-lg shadow-lg disabled:opacity-50 disabled:grayscale"
                        >
                            Continuer
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Appointment & Vehicle */}
            {step === 2 && (
                <div className="animate-fade-in space-y-6">

                    {/* Appointment Type */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-[#1E293B] rounded-xl border border-white/10">
                        <button
                            onClick={() => setAppointmentType('scheduled')}
                            className={`py-3 rounded-lg font-bold transition-all ${appointmentType === 'scheduled' ? 'bg-white/10 text-white shadow' : 'text-gray-500'
                                }`}
                        >
                            📅 Rendez-vous
                        </button>
                        <button
                            onClick={() => setAppointmentType('urgence')}
                            className={`py-3 rounded-lg font-bold transition-all ${appointmentType === 'urgence' ? 'bg-red-500 text-white shadow' : 'text-gray-500'
                                }`}
                        >
                            🚨 Urgence
                        </button>
                    </div>

                    {appointmentType === 'scheduled' && (
                        <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
                            <h3 className="text-white font-bold mb-4">Choisir un créneau</h3>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white mb-4 outline-none"
                            />
                            <div className="grid grid-cols-4 gap-2">
                                {timeSlots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 rounded-lg text-sm font-bold border transition-all ${selectedTime === time
                                            ? 'bg-orange-500 border-orange-500 text-white'
                                            : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {appointmentType === 'urgence' && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-center">
                            <p className="text-red-400 font-bold mb-2">Service Prioritaire</p>
                            <p className="text-white text-sm">Nous traiterons votre véhicule dès votre arrivée.</p>
                        </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Véhicule (Marque et Modèle)</label>
                            <input
                                type="text"
                                value={vehicleInfo}
                                onChange={(e) => setVehicleInfo(e.target.value)}
                                placeholder="Ex: Renault Clio"
                                className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Description du problème (Optionnel)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Bruits étranges, voyant allumé..."
                                className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-orange-500 transition-colors"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Numéro de Téléphone</label>
                            <div className="flex items-center gap-3 bg-[#1E293B] border border-white/10 rounded-xl p-4 focus-within:border-orange-500 transition-colors">
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

                        <button
                            onClick={handleSubmit}
                            disabled={!phone || isSubmitting || (appointmentType === 'scheduled' && !selectedTime)}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-lg shadow-lg disabled:opacity-50 mt-4"
                        >
                            {isSubmitting ? "Traitement..." : "Confirmer le Rendez-vous"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
