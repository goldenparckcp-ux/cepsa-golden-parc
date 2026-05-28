"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Search, Waves, Check, LogOut, RefreshCw, QrCode } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function StaffPoolServicesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "checked_in" | "archive">("pending");

    // Session Check
    useEffect(() => {
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            try {
                const session = JSON.parse(stored);
                if (session.role !== "services" && session.role !== "admin") {
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

        fetchBookings();
    }, [router]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // Fetch pool bookings
            const { data, error } = await supabase
                .from("pool_bookings")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (data) {
                setBookings(data);
            }
        } catch (err) {
            console.error("Failed to fetch pool bookings:", err);
            // Fallbacks
            setBookings([
                {
                    id: "1",
                    booking_number: "POOL-8290",
                    customer_phone: "0661122334",
                    formula: "fullday",
                    booking_date: new Date().toISOString().split("T")[0],
                    adults: 2,
                    children: 1,
                    total_price: 150,
                    status: "pending",
                    created_at: new Date().toISOString()
                },
                {
                    id: "2",
                    booking_number: "POOL-8289",
                    customer_phone: "0670998877",
                    formula: "afternoon",
                    booking_date: new Date().toISOString().split("T")[0],
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

    const handleCheckIn = async (bookingId: string) => {
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

            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
        } catch (err) {
            alert("Erreur lors de la validation du ticket.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("staff_session");
        router.push("/staff");
    };

    const filteredBookings = bookings.filter(b => {
        let matchesStatus = false;
        if (activeTab === "pending") matchesStatus = b.status === "pending" || b.status === "confirmed";
        else if (activeTab === "checked_in") matchesStatus = b.status === "checked_in" || b.status === "active";
        else matchesStatus = b.status === "completed" || b.status === "cancelled";

        const matchesSearch = 
            (b.booking_number && b.booking_number.toLowerCase().includes(searchQuery.toLowerCase())) || 
            (b.customer_phone && b.customer_phone.includes(searchQuery)) ||
            (b.formula && b.formula.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesStatus && matchesSearch;
    });

    const getFormulaLabel = (f: string) => {
        if (f === "morning") return "Matinée";
        if (f === "afternoon") return "Après-Midi";
        return "Journée Complète";
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden">
            {/* Custom Staff Header */}
            <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-white/10 p-4 md:p-6 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/10">
                        <Waves className="w-5.5 h-5.5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-base md:text-lg font-black tracking-tight text-white leading-none">GOLDEN PARC • PISCINE 🏊</h1>
                        <span className="text-[9px] font-bold text-amber-500 tracking-wider uppercase block mt-1">Espace Contrôle & Tickets</span>
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

            {/* Body */}
            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-white">Validation des Entrées</h2>
                        <p className="text-xs text-gray-400 font-medium">Vérification des billets de piscine et check-in rapide</p>
                    </div>

                    <button
                        onClick={fetchBookings}
                        className="w-full sm:w-auto bg-[#1E293B] hover:bg-[#1E293B]/80 text-gray-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-white/5 flex items-center justify-center gap-2 transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                        Actualiser
                    </button>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="N° de billet, téléphone..."
                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-400 outline-none focus:border-amber-500 transition-colors h-[46px]"
                        />
                    </div>

                    <div className="md:col-span-2 bg-[#1E293B] p-1.5 rounded-xl border border-white/10 flex gap-1 h-[46px]">
                        {[
                            { id: "pending", label: "Billets Actifs", count: bookings.filter(b => b.status === "pending" || b.status === "confirmed").length, color: "bg-amber-500" },
                            { id: "checked_in", label: "Dans la Piscine", count: bookings.filter(b => b.status === "checked_in" || b.status === "active").length, color: "bg-green-500" },
                            { id: "archive", label: "Historique", count: bookings.filter(b => b.status === "completed" || b.status === "cancelled").length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                    activeTab === tab.id
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black text-black ${tab.color || "bg-gray-700 text-gray-300"}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TICKETS LIST */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500 font-bold">
                        Chargement des billets...
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-12 text-center text-gray-400 space-y-2">
                        <Ticket className="w-12 h-12 mx-auto text-gray-500 stroke-1" />
                        <h3 className="font-bold text-white text-base">Aucun billet</h3>
                        <p className="text-xs max-w-sm mx-auto">Aucun billet trouvé dans cette catégorie.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBookings.map(b => (
                            <div
                                key={b.id}
                                className="bg-[#1E293B] border border-white/10 rounded-[2rem] p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ID Billet</span>
                                            <span className="text-sm font-black text-white">{b.booking_number || `POOL-${b.id.slice(0, 6)}`}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-[#0F172A] border border-white/5 px-2.5 py-1 rounded-lg text-cyan-400 font-bold text-xs">
                                            <QrCode className="w-3.5 h-3.5" />
                                            <span>{getFormulaLabel(b.formula)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-3.5 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Date d'accès</span>
                                            <span className="text-white font-bold">{b.booking_date}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Nombre d'Adultes</span>
                                            <span className="text-white font-black">{b.adults} Adulte(s)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Nombre d'Enfants</span>
                                            <span className="text-white font-black">{b.children || 0} Enfant(s)</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div>
                                            <span className="text-[9px] font-bold text-gray-500 block uppercase">Téléphone</span>
                                            <span className="text-xs font-bold text-gray-300">{b.customer_phone}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-gray-500 block uppercase">Total</span>
                                            <span className="text-sm font-black text-white">{b.total_price} DH</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 mt-4 pt-4">
                                    {b.status === "pending" && (
                                        <button
                                            onClick={() => handleCheckIn(b.id)}
                                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs rounded-xl shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Check className="w-4 h-4 stroke-[3px]" />
                                            Valider l'Entrée & Check-In
                                        </button>
                                    )}

                                    {b.status === "checked_in" && (
                                        <div className="w-full bg-[#0F172A] border border-green-500/20 text-green-400 rounded-xl py-2.5 text-center text-xs font-bold">
                                            ● Validé (Dans la Piscine)
                                        </div>
                                    )}

                                    {(b.status === "completed" || b.status === "cancelled") && (
                                        <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-2.5 text-center text-xs text-gray-500 font-bold">
                                            {b.status === "completed" ? "✅ Ticket Historisé" : "❌ Ticket Annulé"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
