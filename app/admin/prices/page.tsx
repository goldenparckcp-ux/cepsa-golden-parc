"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Save, RefreshCw, Sparkles, AlertCircle, CheckCircle2, Utensils, Bed, Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminPriceModifierPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Restaurant Items state
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");

    // Hotel Room Prices (Local State settings)
    const [hotelPrices, setHotelPrices] = useState({
        standard_night: 300,
        standard_sieste: 150,
        deluxe_night: 500,
        deluxe_sieste: 250,
        family_night: 700,
        family_sieste: 350
    });

    // Pool Prices (Local State settings)
    const [poolPrices, setPoolPrices] = useState({
        morning_adult: 50,
        morning_child: 25,
        afternoon_adult: 50,
        afternoon_child: 25,
        fullday_adult: 90,
        fullday_child: 40
    });

    useEffect(() => {
        // Enforce Admin Access
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            const session = JSON.parse(stored);
            if (session.role !== "admin") {
                window.location.href = "/admin";
                return;
            }
        } else {
            window.location.href = "/admin";
            return;
        }

        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load restaurant items from DB
            const { data, error } = await supabase.from("restaurant_items").select("*");
            if (error) throw error;
            if (data) {
                setMenuItems(data);
            }

            // Load Hotel/Pool prices from localStorage if customized
            const savedHotel = localStorage.getItem("custom_hotel_prices");
            if (savedHotel) setHotelPrices(JSON.parse(savedHotel));

            const savedPool = localStorage.getItem("custom_pool_prices");
            if (savedPool) setPoolPrices(JSON.parse(savedPool));

        } catch (err) {
            console.error("Failed to load prices dynamically:", err);
        } finally {
            setLoading(false);
        }
    };

    // Update restaurant item price in DB
    const handleSaveRestoPrice = async (itemId: number, newPrice: number) => {
        setSaving(`resto-${itemId}`);
        setSuccessMessage("");

        try {
            const { error } = await supabase
                .from("restaurant_items")
                .update({ base_price: newPrice })
                .eq("id", itemId);

            if (error) throw error;

            // Update local state
            setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, base_price: newPrice } : item));
            
            showSuccess("Prix du plat mis à jour avec succès side-client !");
        } catch (err) {
            alert("Erreur lors de la mise à jour du tarif restaurant.");
        } finally {
            setSaving(null);
        }
    };

    // Update Hotel Room Prices in LocalStorage (Shared setting simulation)
    const handleSaveHotelPrices = () => {
        setSaving("hotel");
        setSuccessMessage("");
        try {
            localStorage.setItem("custom_hotel_prices", JSON.stringify(hotelPrices));
            showSuccess("Tarifs de l'Hôtel enregistrés avec succès !");
        } catch (err) {
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(null);
        }
    };

    // Update Pool Prices in LocalStorage (Shared setting simulation)
    const handleSavePoolPrices = () => {
        setSaving("pool");
        setSuccessMessage("");
        try {
            localStorage.setItem("custom_pool_prices", JSON.stringify(poolPrices));
            showSuccess("Tarifs de la Piscine enregistrés avec succès !");
        } catch (err) {
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(null);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 4000);
    };

    const categories = [
        { id: "all", label: "Tout" },
        { id: "FastFood", label: "Fast Food" },
        { id: "Plats", label: "Plats" },
        { id: "Ftour", label: "Ftour" },
        { id: "Boissons", label: "Boissons" }
    ];

    const filteredRestoItems = menuItems.filter(item => {
        if (activeCategory === "all") return true;
        return item.category_id === activeCategory;
    });

    return (
        <div className="space-y-8 pb-16 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/10">
                        <DollarSign className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Modification des Prix</h1>
                        <p className="text-xs text-gray-400 font-medium">Ajustement en direct des grilles tarifaires de l'établissement</p>
                    </div>
                </div>

                <button
                    onClick={loadData}
                    className="bg-[#1E293B] hover:bg-[#1E293B]/80 text-gray-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Recharger
                </button>
            </div>

            {/* Global feedback message */}
            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 text-green-400 font-bold text-sm animate-shake">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. RESTAURANT PRICING CARD (DB-CONNECTED) */}
                <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 lg:col-span-2 space-y-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        Grille Restaurant (Plats en Direct)
                    </h3>

                    {/* Category Selector */}
                    <div className="flex bg-[#0F172A] p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs shrink-0 transition-all ${
                                    activeCategory === cat.id
                                        ? "bg-[#1E293B] text-white shadow-sm"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Items pricing list */}
                    {loading ? (
                        <div className="text-center py-6 text-xs text-gray-500">Chargement du menu...</div>
                    ) : filteredRestoItems.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-500">Aucun plat dans cette catégorie.</div>
                    ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredRestoItems.map(item => (
                                <div key={item.id} className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="font-bold text-white text-sm truncate">{item.name_fr}</div>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">{item.category_id}</span>
                                    </div>

                                    {/* Action Price Input */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                defaultValue={item.base_price}
                                                onBlur={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val > 0 && val !== Number(item.base_price)) {
                                                        handleSaveRestoPrice(item.id, val);
                                                    }
                                                }}
                                                className="bg-[#1E293B] border border-white/10 rounded-xl py-2 px-3 pl-8 text-sm text-amber-500 font-black w-24 text-right outline-none focus:border-amber-500 transition-colors"
                                            />
                                            <span className="text-gray-400 text-xs font-bold absolute left-3 top-2.5">DH</span>
                                        </div>

                                        {saving === `resto-${item.id}` && (
                                            <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. SERVICES & HOTEL PRICING CONTROL (PRO CONFIG PANEL) */}
                <div className="space-y-8">
                    {/* Hotel Rates Modifier */}
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Bed className="w-4 h-4 text-amber-500" />
                            Tarifs Hôtel (Nuits / Siestes)
                        </h3>

                        <div className="space-y-4 text-xs">
                            {/* Standard Room */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Chambre Standard</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Nuitée (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.standard_night}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, standard_night: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sieste (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.standard_sieste}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, standard_sieste: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Suite Deluxe */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Suite Deluxe</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Nuitée (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.deluxe_night}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, deluxe_night: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sieste (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.deluxe_sieste}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, deluxe_sieste: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Family Room */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Chambre Famille</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Nuitée (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.family_night}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, family_night: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sieste (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.family_sieste}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, family_sieste: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveHotelPrices}
                            disabled={saving === "hotel"}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {saving === "hotel" ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Enregistrer Tarifs Hôtel
                        </button>
                    </div>

                    {/* Pool Formula Pricing Card */}
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-cyan-500" />
                            Tarifs Piscine (Adultes / Enfants)
                        </h3>

                        <div className="space-y-4 text-xs">
                            {/* Full Day */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Formule Journée Complète</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Adulte (DH)</label>
                                        <input
                                            type="number"
                                            value={poolPrices.fullday_adult}
                                            onChange={(e) => setPoolPrices({ ...poolPrices, fullday_adult: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Enfant (DH)</label>
                                        <input
                                            type="number"
                                            value={poolPrices.fullday_child}
                                            onChange={(e) => setPoolPrices({ ...poolPrices, fullday_child: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Morning / Afternoon */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Formule Demi-Journée (Matin/A-M)</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Adulte (DH)</label>
                                        <input
                                            type="number"
                                            value={poolPrices.morning_adult}
                                            onChange={(e) => setPoolPrices({ ...poolPrices, morning_adult: Number(e.target.value), afternoon_adult: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Enfant (DH)</label>
                                        <input
                                            type="number"
                                            value={poolPrices.morning_child}
                                            onChange={(e) => setPoolPrices({ ...poolPrices, morning_child: Number(e.target.value), afternoon_child: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSavePoolPrices}
                            disabled={saving === "pool"}
                            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {saving === "pool" ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Enregistrer Tarifs Piscine
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
