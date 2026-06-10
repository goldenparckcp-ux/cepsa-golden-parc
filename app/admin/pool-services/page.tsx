"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Car, Search, ShieldCheck, Sun, CheckCircle2, UserCheck, Play, ArrowRight, Check, RefreshCw, Eye, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminPoolAndServicesPage() {
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"pool" | "wash">("pool");
    const [poolBookings, setPoolBookings] = useState<any[]>([]);
    const [washBookings, setWashBookings] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Concurrent fetch
            const [
                { data: poolData },
                { data: serviceData }
            ] = await Promise.all([
                supabase.from("pool_bookings").select("*").order("created_at", { ascending: false }),
                supabase.from("service_bookings").select("*").order("created_at", { ascending: false })
            ]);

            if (poolData) setPoolBookings(poolData);
            if (serviceData) setWashBookings(serviceData);

        } catch (err) {
            console.error("Failed to fetch services data from database, using beautiful mock fallback", err);
            // Dynamic premium fallback data
            setPoolBookings([
                {
                    id: "p1",
                    booking_number: "POOL-8902",
                    customer_phone: "0661122334",
                    booking_date: new Date().toISOString().split("T")[0],
                    time_slot: "09:00 - 19:00",
                    ambiance: "mixed",
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

            setWashBookings([
                {
                    id: "w1",
                    booking_number: "WASH-450",
                    customer_phone: "0654321098",
                    service_type: "lavage",
                    service_name: "Lavage Complet Premium",
                    vehicle_info: "Mercedes Classe C (Noir) - Immatriculation 1-A-1234",
                    scheduled_date: new Date().toISOString().split("T")[0],
                    time_slot: "10:30",
                    price: 80,
                    status: "scheduled",
                    created_at: new Date().toISOString()
                },
                {
                    id: "w2",
                    booking_number: "WASH-449",
                    customer_phone: "0667889900",
                    service_type: "lubrifiant",
                    service_name: "Vidange + Filtre à Huile Shell",
                    vehicle_info: "Golf 7 (Gris) - Immatriculation 6-B-5678",
                    scheduled_date: new Date().toISOString().split("T")[0],
                    time_slot: "11:30",
                    price: 350,
                    status: "processing",
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
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

            const { error } = await supabase
                .from("pool_bookings")
                .update(updates)
                .eq("id", bookingId);

            if (error) throw error;

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

            const { error } = await supabase
                .from("pool_bookings")
                .update(updates)
                .eq("id", bookingId);

            if (error) throw error;

            setPoolBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
        } catch (err) {
            alert("Erreur lors de la clôture du passe.");
        }
    };

    // Live state actions for Services (Wash/lubrifiant)
    const handleWashStart = async (bookingId: string) => {
        try {
            const updates = {
                status: "processing",
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from("service_bookings")
                .update(updates)
                .eq("id", bookingId);

            if (error) throw error;

            setWashBookings(prev => prev.map(w => w.id === bookingId ? { ...w, ...updates } : w));
        } catch (err) {
            alert("Erreur lors du lancement de la prestation.");
        }
    };

    const handleWashComplete = async (bookingId: string) => {
        try {
            const updates = {
                status: "completed",
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from("service_bookings")
                .update(updates)
                .eq("id", bookingId);

            if (error) throw error;

            setWashBookings(prev => prev.map(w => w.id === bookingId ? { ...w, ...updates } : w));
        } catch (err) {
            alert("Erreur lors de la finalisation.");
        }
    };

    const handleWashCancel = async (bookingId: string) => {
        if (!confirm("Voulez-vous annuler ce service de lavage ?")) return;
        try {
            const updates = {
                status: "cancelled",
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from("service_bookings")
                .update(updates)
                .eq("id", bookingId);

            if (error) throw error;

            setWashBookings(prev => prev.map(w => w.id === bookingId ? { ...w, ...updates } : w));
        } catch (err) {
            alert("Erreur lors de l'annulation.");
        }
    };

    // Computations
    const activeBathersCount = poolBookings
        .filter(b => b.status === "checked_in")
        .reduce((sum, b) => sum + (Number(b.adults) || 0) + (Number(b.children) || 0), 0);

    const activeWashesCount = washBookings
        .filter(w => w.status === "scheduled" || w.status === "processing").length;

    // Filters for pool entries
    const filteredPool = poolBookings.filter(b => {
        const matchesSearch = 
            b.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (b.customer_phone && b.customer_phone.includes(searchQuery)) ||
            (b.ambiance && b.ambiance.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    // Filters for wash entries
    const filteredWash = washBookings.filter(w => {
        const matchesSearch = 
            w.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (w.customer_phone && w.customer_phone.includes(searchQuery)) ||
            (w.service_name && w.service_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (w.vehicle_info && w.vehicle_info.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-2xl shadow-lg shadow-cyan-500/10">
                        <Ticket className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Piscine & Services</h1>
                        <p className="text-xs text-gray-400 font-medium">Contrôle d'accès à la piscine et suivi du centre de lavage / vidange</p>
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
                {/* 1. Pool Metrics */}
                <div className="bg-gradient-to-br from-cyan-600/10 to-[#1E293B] border border-cyan-500/20 rounded-3xl p-5 flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest block">Baigneurs Actuels</span>
                        <h3 className="text-3xl font-black text-white">{activeBathersCount} Pax</h3>
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

            {/* TAB CONTENT 1: POOL ENTRIES */}
            {activeSubTab === "pool" && (
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
                                                    <span className="text-cyan-400 font-black text-sm">{totalPax} Pax</span>
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

            {/* TAB CONTENT 2: WASH STATION */}
            {activeSubTab === "wash" && (
                <div className="space-y-4">
                    {filteredWash.length === 0 ? (
                        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-12 text-center text-gray-400">
                            Aucun véhicule programmé pour le moment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredWash.map(wash => (
                                <div
                                    key={wash.id}
                                    className="bg-[#1E293B] border border-white/10 rounded-3xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
                                >
                                    <div className="space-y-4">
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ID Ticket</span>
                                                <span className="text-sm font-black text-white">{wash.booking_number}</span>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                                wash.service_type === "lubrifiant"
                                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/10"
                                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/10"
                                            }`}>
                                                {wash.service_type === "lubrifiant" ? "Vidange/Huile" : "Lavage Auto"}
                                            </span>
                                        </div>

                                        {/* Service name */}
                                        <h4 className="text-base font-black text-white leading-tight">{wash.service_name || "Lavage Complet"}</h4>

                                        {/* Vehicle details */}
                                        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
                                            <div className="text-gray-400 font-bold">Informations Véhicule</div>
                                            <div className="text-white font-black leading-snug">{wash.vehicle_info || "Non spécifié"}</div>

                                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                <span className="text-gray-400 font-bold">Heure Programmée</span>
                                                <span className="text-emerald-400 font-black">{wash.time_slot || "Aujourd'hui"}</span>
                                            </div>
                                        </div>

                                        {/* Phone number */}
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Téléphone client</span>
                                            <span className="text-white font-bold">{wash.customer_phone || "Non renseigné"}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-white/5 mt-4 pt-4 space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase">Tarif Prestation</span>
                                            <span className="text-base font-black text-white">{wash.price || wash.total_price} DH</span>
                                        </div>

                                        <div className="flex gap-2">
                                            {(wash.status === "scheduled" || wash.status === "pending") && (
                                                <>
                                                    <button
                                                        onClick={() => handleWashCancel(wash.id)}
                                                        className="flex-1 py-3 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-500 font-bold text-xs rounded-xl transition-all"
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        onClick={() => handleWashStart(wash.id)}
                                                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <Play className="w-3.5 h-3.5 fill-black shrink-0" />
                                                        Prise en charge
                                                    </button>
                                                </>
                                            )}

                                            {wash.status === "processing" && (
                                                <button
                                                    onClick={() => handleWashComplete(wash.id)}
                                                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4 shrink-0" />
                                                    Marquer comme Terminé
                                                </button>
                                            )}

                                            {(wash.status === "completed" || wash.status === "cancelled") && (
                                                <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-2.5 text-center text-xs text-gray-500 font-bold">
                                                    {wash.status === "completed" ? "✅ Lavage Terminé" : "❌ Annulé"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
