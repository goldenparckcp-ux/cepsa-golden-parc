"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Search, Sun, CheckCircle2, UserCheck, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminPoolPage() {
    const [loading, setLoading] = useState(true);
    const [poolBookings, setPoolBookings] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/pool");
            if (!res.ok) throw new Error("Failed to fetch");
            const poolData = await res.json();

            if (poolData) setPoolBookings(poolData);
        } catch (err) {
            console.error("Failed to fetch pool data from database, using fallback", err);
            // Fallback mock data
            setPoolBookings([
                {
                    id: "p1",
                    booking_number: "POOL-8902",
                    customer_phone: "0661122334",
                    booking_date: new Date().toISOString().split("T")[0],
                    time_slot: "09:00 - 19:00",
                    ambiance: "family",
                    adults: 2,
                    children: 1,
                    total_price: 220,
                    status: "pending",
                    created_at: new Date().toISOString()
                },
                {
                    id: "p2",
                    booking_number: "POOL-8901",
                    customer_phone: "0670998877",
                    booking_date: new Date().toISOString().split("T")[0],
                    time_slot: "14:00 - 19:00",
                    ambiance: "women",
                    adults: 1,
                    children: 0,
                    total_price: 50,
                    status: "checked_in",
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Live state actions for Pool
    const handlePoolCheckIn = async (bookingId: string) => {
        try {
            const updates = {
                status: "checked_in",
                checked_in_at: new Date().toISOString()
            };

            const res = await fetch("/api/admin/pool", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: bookingId, updates })
            });

            if (!res.ok) throw new Error("Failed to validate entry");

            setPoolBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
        } catch (err) {
            alert("Erreur lors de la validation d'entrée piscine.");
        }
    };

    const handlePoolComplete = async (bookingId: string) => {
        try {
            const updates = {
                status: "completed",
                completed_at: new Date().toISOString()
            };

            const res = await fetch("/api/admin/pool", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: bookingId, updates })
            });

            if (!res.ok) throw new Error("Failed to complete pass");

            setPoolBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
        } catch (err) {
            alert("Erreur lors de la clôture du passe.");
        }
    };

    // Computations
    const activeBathersCount = poolBookings
        .filter(b => b.status === "checked_in")
        .reduce((sum, b) => sum + (Number(b.adults) || 0) + (Number(b.children) || 0), 0);

    // Filters for pool entries
    const filteredPool = poolBookings.filter(b => {
        const matchesSearch = 
            b.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (b.customer_phone && b.customer_phone.includes(searchQuery)) ||
            (b.ambiance && b.ambiance.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/10">
                        <Ticket className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Validation Piscine</h1>
                        <p className="text-xs text-gray-400 font-medium">Contrôle d'accès et validation des pass piscine en temps réel</p>
                    </div>
                </div>

                <button
                    onClick={fetchData}
                    className="bg-[#1E293B] hover:bg-[#1E293B]/80 text-gray-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Actualiser
                </button>
            </div>

            {/* MAIN METRIC CARD */}
            <div className="max-w-md">
                <div className="bg-gradient-to-br from-cyan-600/10 to-[#1E293B] border border-cyan-500/20 rounded-3xl p-5 flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest block">Baigneurs Actuels</span>
                        <h3 className="text-3xl font-black text-white">{activeBathersCount} Personnes</h3>
                        <p className="text-[10px] text-gray-400">Présents actuellement dans la zone de baignade</p>
                    </div>
                    <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">
                        <Sun className="w-8 h-8 animate-spin-slow" />
                    </div>
                </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="N° de billet pool, téléphone..."
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-400 outline-none focus:border-amber-500 transition-colors h-[46px]"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPool.length === 0 ? (
                        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-12 text-center text-gray-400">
                            Aucun billet de piscine trouvé.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPool.map(booking => {
                                const totalPax = (Number(booking.adults) || 0) + (Number(booking.children) || 0);
                                return (
                                    <div
                                        key={booking.id}
                                        className="bg-[#1E293B] border border-white/10 rounded-3xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
                                    >
                                        <div className="space-y-4">
                                            {/* Card Header */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ID Pass</span>
                                                    <span className="text-sm font-black text-white">{booking.booking_number}</span>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                                    booking.ambiance === "family"
                                                        ? "bg-red-600/20 text-red-400 border border-red-500/10"
                                                        : booking.ambiance === "women"
                                                        ? "bg-purple-600/20 text-purple-400 border border-purple-500/10"
                                                        : "bg-green-600/20 text-green-400 border border-green-500/10"
                                                }`}>
                                                    Ambiance {booking.ambiance}
                                                </span>
                                            </div>

                                            {/* Stay details */}
                                            <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 font-bold">Créneau horaire</span>
                                                    <span className="text-white font-black">{booking.time_slot || "09:00 - 19:00"}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 font-bold">Adulte(s)</span>
                                                    <span className="text-white font-black">{booking.adults || 1}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 font-bold">Enfant(s)</span>
                                                    <span className="text-white font-black">{booking.children || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                    <span className="text-cyan-400 font-black">Total Visiteurs</span>
                                                    <span className="text-cyan-400 font-black text-sm">{totalPax} Personnes</span>
                                                </div>
                                            </div>

                                            {/* Phone number */}
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-400 font-bold">Téléphone client</span>
                                                <span className="text-white font-bold">{booking.customer_phone || "Non renseigné"}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="border-t border-white/5 mt-4 pt-4 space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase">Total payé</span>
                                                <span className="text-base font-black text-white">{booking.total_price || 0} DH</span>
                                            </div>

                                            <div className="flex gap-2">
                                                {booking.status === "pending" && (
                                                    <button
                                                        onClick={() => handlePoolCheckIn(booking.id)}
                                                        className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs rounded-xl shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <UserCheck className="w-4 h-4 shrink-0" />
                                                        Valider Entrée Piscine
                                                    </button>
                                                )}

                                                {booking.status === "checked_in" && (
                                                    <button
                                                        onClick={() => handlePoolComplete(booking.id)}
                                                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-black text-xs border border-white/10 rounded-xl transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        Sortie / Clôturer Passe
                                                    </button>
                                                )}

                                                {(booking.status === "completed" || booking.status === "cancelled" || booking.status === "active") && (
                                                    <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-2.5 text-center text-xs text-gray-500 font-bold">
                                                        {booking.status === "completed" ? "✅ Passe Clôturé" : booking.status === "active" ? "Ticket Actif (Attente)" : "❌ Annulé"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
