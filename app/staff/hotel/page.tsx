"use client";

import React, { useState, useEffect } from "react";
import { Bed, Calendar, Search, Moon, Sun, UserCheck, UserMinus, RefreshCw, PhoneCall, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function StaffHotelReservationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "checked_in" | "archive">("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [assignRoomModal, setAssignRoomModal] = useState<{ id: string; num: string } | null>(null);
    const [assignedRoomNumber, setAssignedRoomNumber] = useState("");

    const TOTAL_ROOMS = [
        { num: 101, type: "standard", label: "Chambre 101" },
        { num: 102, type: "standard", label: "Chambre 102" },
        { num: 103, type: "deluxe", label: "Suite 103" },
        { num: 104, type: "deluxe", label: "Suite 104" },
        { num: 105, type: "family", label: "Famille 105" }
    ];

    // Session Check
    useEffect(() => {
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            try {
                const session = JSON.parse(stored);
                if (session.role !== "hotel" && session.role !== "admin") {
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

        fetchReservations();
    }, [router]);

    const fetchReservations = async () => {
        try {
            const { data, error } = await supabase
                .from("hotel_reservations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (data) {
                setReservations(data);
            }
        } catch (err) {
            console.error("Failed to fetch hotel reservations from database:", err);
            // Fallback mock reservations
            setReservations([
                {
                    id: "1",
                    booking_number: "HOTEL-2895",
                    customer_phone: "0661122334",
                    room_type: "standard",
                    booking_type: "night",
                    check_in: new Date().toISOString().split("T")[0],
                    check_out: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split("T")[0],
                    nights: 1,
                    total_price: 300,
                    status: "pending",
                    created_at: new Date().toISOString()
                },
                {
                    id: "2",
                    booking_number: "HOTEL-2894",
                    customer_phone: "0670998877",
                    room_type: "deluxe",
                    booking_type: "sieste",
                    check_in: new Date().toISOString().split("T")[0],
                    check_out: new Date().toISOString().split("T")[0],
                    duration_hours: 3,
                    total_price: 250,
                    status: "checked_in",
                    room_number: "103",
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (resId: string, roomNum: string) => {
        if (!roomNum) {
            alert("Veuillez sélectionner ou renseigner un numéro de chambre.");
            return;
        }

        try {
            const updates = {
                status: "checked_in",
                room_number: roomNum,
                checked_in_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from("hotel_reservations")
                .update(updates)
                .eq("id", resId);

            if (error) throw error;

            setReservations(prev => prev.map(r => r.id === resId ? { ...r, ...updates } : r));
            setAssignRoomModal(null);
            setAssignedRoomNumber("");
        } catch (err) {
            alert("Erreur lors de l'enregistrement de l'arrivée.");
        }
    };

    const handleCheckOut = async (resId: string) => {
        if (!confirm("Voulez-vous enregistrer le départ (Check-Out) de ce client ? La chambre sera libérée.")) return;

        try {
            const updates = {
                status: "completed",
                checked_out_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from("hotel_reservations")
                .update(updates)
                .eq("id", resId);

            if (error) throw error;

            setReservations(prev => prev.map(r => r.id === resId ? { ...r, ...updates } : r));
        } catch (err) {
            alert("Erreur lors du départ du client.");
        }
    };

    const handleCancelReservation = async (resId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

        try {
            const updates = {
                status: "cancelled"
            };

            const { error } = await supabase
                .from("hotel_reservations")
                .update(updates)
                .eq("id", resId);

            if (error) throw error;

            setReservations(prev => prev.map(r => r.id === resId ? { ...r, ...updates } : r));
        } catch (err) {
            alert("Erreur lors de l'annulation.");
        }
    };

    const getRoomOccupancy = (roomNum: number) => {
        const activeRes = reservations.find(r => r.room_number === roomNum.toString() && r.status === "checked_in");
        return activeRes || null;
    };

    const filteredReservations = reservations.filter(res => {
        let matchesStatus = false;
        if (activeTab === "pending") matchesStatus = res.status === "pending" || res.status === "confirmed";
        else if (activeTab === "checked_in") matchesStatus = res.status === "checked_in";
        else matchesStatus = res.status === "completed" || res.status === "cancelled";

        const matchesSearch = 
            res.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (res.customer_phone && res.customer_phone.includes(searchQuery)) ||
            (res.room_type && res.room_type.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesStatus && matchesSearch;
    });

    const handleLogout = () => {
        localStorage.removeItem("staff_session");
        router.push("/staff");
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden">
            {/* Custom Staff Header */}
            <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-white/10 p-4 md:p-6 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl text-black shadow-lg shadow-amber-500/10">
                        <Bed className="w-5.5 h-5.5" />
                    </div>
                    <div>
                        <h1 className="text-base md:text-lg font-black tracking-tight text-white leading-none">GOLDEN PARC • HÔTEL 🏨</h1>
                        <span className="text-[9px] font-bold text-amber-500 tracking-wider uppercase block mt-1">Espace Réception & Chambres</span>
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
                        <h2 className="text-xl font-black text-white">Gestion de l'Hôtel</h2>
                        <p className="text-xs text-gray-400 font-medium">Suivi des séjours et attribution des chambres en direct</p>
                    </div>

                    <button
                        onClick={fetchReservations}
                        className="w-full sm:w-auto bg-[#1E293B] hover:bg-[#1E293B]/80 text-gray-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-white/5 flex items-center justify-center gap-2 transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                        Actualiser
                    </button>
                </div>

                {/* ROOM PLANNER */}
                <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Chambres physiques & État d'occupation
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {TOTAL_ROOMS.map(room => {
                            const occupancy = getRoomOccupancy(room.num);
                            return (
                                <div
                                    key={room.num}
                                    className={`rounded-2xl p-4 border flex flex-col justify-between min-h-[110px] transition-all relative group ${
                                        occupancy
                                            ? "bg-red-600/15 border-red-500/30"
                                            : "bg-[#0F172A] border-white/5 hover:border-white/25"
                                    }`}
                                >
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-white text-base">{room.num}</span>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                                room.type === "family"
                                                    ? "bg-purple-600/20 text-purple-400"
                                                    : room.type === "deluxe"
                                                    ? "bg-amber-500/20 text-amber-400"
                                                    : "bg-blue-600/20 text-blue-400"
                                            }`}>
                                                {room.type}
                                            </span>
                                        </div>
                                    </div>

                                    {occupancy ? (
                                        <div className="mt-4">
                                            <div className="text-[10px] text-red-400 font-bold flex items-center gap-1.5">
                                                {occupancy.booking_type === "night" ? <Moon className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Sun className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                                                <span>Occupée</span>
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold truncate max-w-[120px] mt-1">Tel: {occupancy.customer_phone}</div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 text-[10px] text-green-400 font-bold">
                                            ● Disponible
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SEARCH & NAVIGATION TABS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="N° réservation, téléphone, type..."
                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-400 outline-none focus:border-amber-500 transition-colors h-[46px]"
                        />
                    </div>

                    <div className="md:col-span-2 bg-[#1E293B] p-1.5 rounded-xl border border-white/10 flex gap-1 h-[46px]">
                        {[
                            { id: "pending", label: "Arrivées (Attente)", count: reservations.filter(r => r.status === "pending" || r.status === "confirmed").length, color: "bg-amber-500" },
                            { id: "checked_in", label: "Sur Place (Actifs)", count: reservations.filter(r => r.status === "checked_in").length, color: "bg-green-500" },
                            { id: "archive", label: "Historique", count: reservations.filter(r => r.status === "completed" || r.status === "cancelled").length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
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

                {/* RESERVATIONS LIST */}
                {filteredReservations.length === 0 ? (
                    <div className="bg-[#1E293B] border border-white/10 rounded-[2rem] p-12 text-center text-gray-400 space-y-2">
                        <Bed className="w-12 h-12 mx-auto text-gray-500 stroke-1" />
                        <h3 className="font-bold text-white text-base">Aucune réservation</h3>
                        <p className="text-xs max-w-sm mx-auto">Aucun dossier dans cette catégorie.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReservations.map(res => {
                            const isNight = res.booking_type === "night";
                            return (
                                <div
                                    key={res.id}
                                    className="bg-[#1E293B] border border-white/10 rounded-[2rem] p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ID Réservation</span>
                                                <span className="text-sm font-black text-white">{res.booking_number || `HOTEL-${res.id.slice(0, 6)}`}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-[#0F172A] border border-white/5 px-2.5 py-1 rounded-lg text-amber-500 font-bold text-xs">
                                                {isNight ? (
                                                    <>
                                                        <Moon className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>Nuitée</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sun className="w-3.5 h-3.5 text-orange-500" />
                                                        <span>Sieste</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-3.5 space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-400 font-bold">Chambre demandée</span>
                                                <span className="text-white font-black uppercase">{res.room_type}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-400 font-bold">{isNight ? "Date d'Arrivée" : "Date Prévue"}</span>
                                                <span className="text-white font-bold">{res.check_in || res.check_in_time?.split("T")[0]}</span>
                                            </div>
                                            {isNight ? (
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-bold">Nombre de nuits</span>
                                                    <span className="text-white font-black">{res.nights} nuits</span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-bold">Durée programmée</span>
                                                    <span className="text-white font-black">{res.duration_hours || res.duration || "3"} Heures</span>
                                                </div>
                                            )}
                                            {res.room_number && (
                                                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                                                    <span className="text-amber-500 font-black">Chambre Physique</span>
                                                    <span className="bg-amber-500 text-black font-black text-xs px-2.5 py-0.5 rounded-lg">
                                                        N° {res.room_number}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[9px] font-bold text-gray-500 block uppercase">Client Phone</span>
                                                <span className="text-xs font-bold text-gray-300">{res.customer_phone || "Non renseigné"}</span>
                                            </div>
                                            {res.customer_phone && (
                                                <a
                                                    href={`tel:${res.customer_phone}`}
                                                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                                                    title="Appeler le client"
                                                >
                                                    <PhoneCall className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-white/5 mt-4 pt-4 space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase">Tarif Total</span>
                                            <span className="text-base font-black text-white">{res.total_price || res.price} DH</span>
                                        </div>

                                        <div className="flex gap-2">
                                            {res.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleCancelReservation(res.id)}
                                                        className="flex-1 py-3 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-500 font-bold text-xs rounded-xl transition-all"
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setAssignRoomModal({ id: res.id, num: res.booking_number || "" });
                                                            setAssignedRoomNumber("");
                                                        }}
                                                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                                                        Check-In
                                                    </button>
                                                </>
                                            )}

                                            {res.status === "checked_in" && (
                                                <button
                                                    onClick={() => handleCheckOut(res.id)}
                                                    className="w-full py-3 bg-red-600 text-white font-black text-xs rounded-xl shadow-lg shadow-red-500/10 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Libérer Chambre (Check-Out)
                                                </button>
                                            )}

                                            {(res.status === "completed" || res.status === "cancelled") && (
                                                <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-2.5 text-center text-xs text-gray-500 font-bold">
                                                    {res.status === "completed" ? "✅ Séjour Terminé" : "❌ Réservation Annulée"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ATTRIBUTE CHAMBRE MODAL */}
            {assignRoomModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
                        <h4 className="text-lg font-black text-white mb-2">Attribution de Chambre</h4>
                        <p className="text-xs text-gray-400 mb-6">
                            Attribuez un numéro de chambre physique pour finaliser le Check-In de la réservation <span className="text-amber-500 font-bold">{assignRoomModal.num}</span>.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 block uppercase mb-2">Choisir une chambre libre</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {TOTAL_ROOMS.map(r => {
                                        const isOccupied = getRoomOccupancy(r.num);
                                        return (
                                            <button
                                                key={r.num}
                                                disabled={isOccupied != null}
                                                onClick={() => setAssignedRoomNumber(r.num.toString())}
                                                className={`py-2 text-xs font-black rounded-lg border transition-all ${
                                                    assignedRoomNumber === r.num.toString()
                                                        ? "bg-amber-500 text-black border-amber-500"
                                                        : isOccupied
                                                        ? "bg-red-500/10 border-red-500/20 text-red-500/50 cursor-not-allowed opacity-40"
                                                        : "bg-[#0F172A] border-white/5 text-white hover:border-white/20"
                                                }`}
                                            >
                                                {r.num}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="manualRoomNumber" className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Ou saisir manuellement</label>
                                <input
                                    id="manualRoomNumber"
                                    type="text"
                                    value={assignedRoomNumber}
                                    onChange={(e) => setAssignedRoomNumber(e.target.value)}
                                    placeholder="Ex: 106, Suite A..."
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-500 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setAssignRoomModal(null)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-bold text-xs rounded-xl transition-all"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => handleCheckIn(assignRoomModal.id, assignedRoomNumber)}
                                    disabled={!assignedRoomNumber}
                                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-lg transition-all"
                                >
                                    Valider Check-In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
