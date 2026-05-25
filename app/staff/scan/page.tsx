"use client";

import React, { useState } from "react";
import { ScanLine, Search, CheckCircle2, XCircle, Package, User, Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function StaffScanner() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    type ScanResult = {
        type?: string;
        context?: string;
        booking_number?: string;
        customer_phone?: string;
        total_price?: number;
        price?: number;
        time_slot?: string;
        check_in?: string;
        status?: string;
        [key: string]: unknown;
    };

    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!code) return;

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            // Check Service Bookings
            const { data: serv } = await supabase.from('service_bookings').select('*').eq('booking_number', code).single();
            if (serv) {
                setResult({ ...serv, type: 'Service', context: serv.service_type });
                setLoading(false);
                return;
            }

            // Check Hotel Bookings
            const { data: hotel } = await supabase.from('hotel_bookings').select('*').eq('booking_number', code).single();
            if (hotel) {
                setResult({ ...hotel, type: 'Hotel', context: hotel.room_type });
                setLoading(false);
                return;
            }

            // Check Restaurant Orders (Assuming they have booking_number or order_number logic adapted)
            // For MVP we matched booking_number string.

            setError("Code introuvable ou invalide.");
        } catch {
            setError("Erreur système.");
        }
        setLoading(false);
    };

    const handleValidateOrder = async () => {
        if (!result) return;
        setLoading(true);

        const table = result.type === 'Hotel' ? 'hotel_bookings' : 'service_bookings';

        const { error } = await supabase
            .from(table)
            .update({ status: 'completed' })
            .eq('id', result.id);

        if (error) {
            alert("Erreur maj status");
        } else {
            setResult((prev) => (prev ? ({ ...prev, status: 'completed' }) : null));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-6 relative overflow-hidden">

            {/* Background Animations */}
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan-line" />

            <div className="w-full max-w-md z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gray-900 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4 relative">
                        <ScanLine className="w-10 h-10 text-red-500 animate-pulse" />
                        <div className="absolute inset-0 border-2 border-red-500/20 rounded-2xl animate-ping opacity-20" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider">Staff Scanner</h1>
                    <p className="text-gray-500 text-xs">Vérification des commandes</p>
                </div>

                {/* Input Section */}
                <form onSubmit={handleVerify} className="bg-gray-900 border border-white/10 p-2 rounded-2xl flex gap-2 mb-8 shadow-xl">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Ex: WASH-123456"
                        className="bg-transparent text-white font-mono font-bold text-center w-full outline-none uppercase placeholder:text-gray-700"
                    />
                    <button
                        type="submit"
                        disabled={loading || !code}
                        className="bg-red-600 w-12 h-12 rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                </form>

                {/* ERROR STATE */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl text-center animate-in zoom-in-95">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-white">Code Invalide</h3>
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* RESULT CARD */}
                {result && (
                    <div className="bg-gray-800 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
                        {/* Status Header */}
                        <div className={`p-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm ${result.status === 'completed' ? 'bg-gray-600 text-gray-300' : 'bg-green-600 text-white'
                            }`}>
                            {result.status === 'completed' ? (
                                <><CheckCircle2 className="w-5 h-5" /> Déjà Validé</>
                            ) : (
                                <><CheckCircle2 className="w-5 h-5" /> Commande Valide</>
                            )}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Key Info */}
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-white mb-1">{String(result.context || result.type || "")}</h2>
                                <div className="text-red-400 font-mono font-bold tracking-wider text-xl">{String(result.booking_number || "")}</div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-3 rounded-xl">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Client</div>
                                    <div className="text-white font-bold truncate">{String(result.customer_phone || "")}</div>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Prix</div>
                                    <div className="text-white font-bold">{String(result.total_price ?? result.price ?? "")} DH</div>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl col-span-2">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date/Heure</div>
                                    <div className="text-white font-bold">{String(result.time_slot ?? result.check_in ?? "N/A")}</div>
                                </div>
                            </div>

                            {/* Action Button */}
                            {result.status !== 'completed' && (
                                <button
                                    onClick={handleValidateOrder}
                                    disabled={loading}
                                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    Valider & Livrer <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
