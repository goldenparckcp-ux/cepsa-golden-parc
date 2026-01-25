"use client";

import React, { useState } from 'react';
import { Phone, MapPin, AlertTriangle, X } from 'lucide-react';

export default function SOSButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSOS = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Generate Google Maps Link
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

                // WhatsApp Message
                const message = `🚨 *SOS DÉPANNAGE URGENT* 🚨%0A%0AJe suis en panne près de la station !%0A📍 *Ma Position :* ${mapsLink}%0A%0AMerci d'envoyer la dépanneuse au plus vite.`;

                // Open WhatsApp (Replace with Station Number)
                window.open(`https://wa.me/212600000000?text=${message}`, '_blank');
                setLoading(false);
                setIsOpen(false);
            },
            (error) => {
                alert("Impossible de récupérer votre position. Veuillez l'activer.");
                setLoading(false);
            }
        );
    };

    return (
        <>
            {/* The Trigger Button (Visible Always) */}
            <div className="fixed top-6 right-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-red-600 text-white p-3 rounded-full shadow-lg shadow-red-600/40 animate-pulse-red flex items-center justify-center border-2 border-red-400 group active:scale-95 transition-all"
                >
                    <AlertTriangle className="w-6 h-6 fill-red-600 text-white group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* The SOS Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-red-900/90 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#1E293B] border-2 border-red-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">

                        {/* Background Effect */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-red">
                            <Phone className="w-10 h-10 text-red-500 fill-current" />
                        </div>

                        <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-wider">Urgence ?</h2>
                        <p className="text-sm text-gray-300 mb-8 font-medium">
                            Nous allons envoyer une dépanneuse à votre position GPS exacte immédiatement.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={handleSOS}
                                disabled={loading}
                                className="w-full py-5 bg-red-600 hover:bg-red-500 rounded-xl font-black text-xl text-white shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                {loading ? 'Localisation...' : (
                                    <>
                                        <MapPin className="w-6 h-6" /> APPELER SECOURS
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-4 text-gray-400 font-bold hover:text-white transition-colors text-sm"
                            >
                                Annuler (Fausse Alerte)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
