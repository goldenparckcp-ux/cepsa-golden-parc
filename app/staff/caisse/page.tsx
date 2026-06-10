"use client";

import React, { useState, useEffect, useRef } from "react";
import { Banknote, Clock, Check, Bell, Search, QrCode, Camera, X, Loader2, LogOut, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Scanner } from '@yudiel/react-qr-scanner';

export default function StaffCaissePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [order, setOrder] = useState<any | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Session Check
    useEffect(() => {
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            try {
                const session = JSON.parse(stored);
                if (session.role !== "caisse" && session.role !== "admin") {
                    router.push("/staff");
                    return;
                }
            } catch (e) {
                localStorage.removeItem("staff_session");
                router.push("/staff");
                return;
            }
        } else {
            router.push("/staff");
            return;
        }
    }, [router]);

    const handleSearch = async (code?: string) => {
        const query = code || searchQuery;
        if (!query.trim()) return;

        setLoading(true);
        setMessage(null);
        setOrder(null);

        try {
            // Fetch order from restaurant_orders
            const { data, error } = await supabase
                .from("restaurant_orders")
                .select("*")
                .eq("order_number", query.trim().toUpperCase())
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setOrder(data);
            } else {
                setMessage({ type: 'error', text: "Aucune commande trouvée avec ce numéro." });
            }
        } catch (err: any) {
            console.error("Error fetching order:", err);
            setMessage({ type: 'error', text: "Erreur lors de la recherche." });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!order) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from("restaurant_orders")
                .update({
                    status: "completed",
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq("id", order.id);

            if (error) throw error;

            setMessage({ type: 'success', text: `La commande #${order.order_number} a été encaissée et validée avec succès !` });
            setOrder(null);
            setSearchQuery("");
        } catch (err: any) {
            console.error("Error completing order:", err);
            setMessage({ type: 'error', text: "Erreur lors de la validation du paiement." });
        } finally {
            setLoading(false);
        }
    };

    const parseOrder = (orderItems: any[]) => {
        if (!Array.isArray(orderItems)) return { foodItems: [], meta: {} };
        const foodItems = orderItems.filter(item => !item.is_meta);
        const metaItem = orderItems.find(item => item.is_meta) || {};
        return { foodItems, meta: metaItem };
    };

    const handleLogout = () => {
        localStorage.removeItem("staff_session");
        router.push("/staff");
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-white/10 p-4 md:p-6 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-xl text-black shadow-lg shadow-green-500/10">
                        <Banknote className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base md:text-lg font-black tracking-tight text-white leading-none">GOLDEN PARC • CAISSE 💰</h1>
                        <span className="text-[9px] font-bold text-green-400 tracking-wider uppercase block mt-1">Validation & Encaissement des Commandes</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="py-2 px-3 rounded-xl bg-red-500/15 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all text-xs flex items-center gap-1.5"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Se Déconnecter
                </button>
            </header>

            {/* Main Content */}
            <main className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 relative z-10">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black text-white">Validation Caisse</h2>
                    <p className="text-xs text-gray-400 font-medium">Scannez le QR Code de commande du client pour l'encaisser et la valider</p>
                </div>

                {/* Messages */}
                {message && (
                    <div className={`p-4 rounded-2xl border text-center font-bold text-sm ${
                        message.type === 'success' 
                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Scanners & Search controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Code Commande (Ex: GP-RESTO-8X)..."
                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-400 outline-none focus:border-green-500 transition-colors h-[46px]"
                        />
                    </div>
                    <button
                        onClick={() => handleSearch()}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs h-[46px] transition-all"
                    >
                        Rechercher
                    </button>
                </div>

                {/* Scan Button Trigger */}
                <button
                    onClick={() => setIsScanning(true)}
                    className="w-full py-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm font-black text-green-400"
                >
                    <Camera className="w-5 h-5" />
                    Scanner le QR Code Client
                </button>

                {/* Scan Overlay */}
                {isScanning && (
                    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-center items-center p-6">
                        <button
                            onClick={() => setIsScanning(false)}
                            className="absolute top-6 right-6 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="w-72 h-72 rounded-3xl overflow-hidden border-4 border-green-500/50 shadow-2xl relative mb-6">
                            <Scanner
                                onScan={(result) => {
                                    if (result && result.length > 0) {
                                        const code = result[0].rawValue.trim();
                                        setIsScanning(false);
                                        setSearchQuery(code);
                                        handleSearch(code);
                                    }
                                }}
                                onError={(e) => console.log(e?.message)}
                            />
                        </div>
                        <p className="text-gray-400 text-sm font-bold">Visez le QR Code sur le téléphone du client</p>
                    </div>
                )}

                {/* Order Information Card */}
                {loading && (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto" />
                        <p className="text-xs text-gray-500 mt-2 font-bold">Chargement de la commande...</p>
                    </div>
                )}

                {order && (
                    <div className="bg-[#1E293B] border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-2xl">
                        {/* Header details */}
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Commande</span>
                                <span className="text-xl font-black text-white">#{order.order_number}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Statut Actuel</span>
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{order.status}</span>
                            </div>
                        </div>

                        {/* List items */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Articles Commandés</h3>
                            <div className="space-y-3 bg-[#0F172A] border border-white/5 p-4 rounded-2xl">
                                {parseOrder(order.items).foodItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div>
                                            <span className="text-green-400 font-black mr-2">x{item.quantity}</span>
                                            <span className="text-white font-bold">{item.name}</span>
                                            {item.meta && <p className="text-[10px] text-gray-400 mt-0.5">{item.meta}</p>}
                                        </div>
                                        <span className="text-gray-300 font-bold">
                                            {((item.price || item.basePrice || 0) * (item.quantity || 1))} DH
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing details */}
                        <div className="space-y-3 border-t border-white/5 pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 font-bold">Total Commande</span>
                                <span className="text-white font-bold">{order.total_price || order.subtotal} DH</span>
                            </div>

                            {/* Deposit check */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 font-bold">Acompte Payé (Arboune)</span>
                                <span className="text-blue-400 font-bold">
                                    {order.deposit_paid ? `${order.deposit_amount} DH` : "0 DH (Non Payé)"}
                                </span>
                            </div>

                            {/* Net payable calculation */}
                            <div className="flex justify-between items-center border-t border-dashed border-white/10 pt-3">
                                <span className="text-white font-black text-base">Net Reste À Payer</span>
                                <span className="text-2xl font-black text-green-400">
                                    {(order.total_price || order.subtotal) - (order.deposit_paid ? order.deposit_amount : 0)} DH
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleConfirmPayment}
                            className="w-full py-4.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-base rounded-2xl shadow-xl shadow-green-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            Confirmer le Règlement & Valider
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
