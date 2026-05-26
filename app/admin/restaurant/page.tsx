"use client";

import React, { useState, useEffect, useRef } from "react";
import { Utensils, Clock, Check, Bell, BellOff, X, Play, Volume2, Search, ArrowRight, Table, Navigation, Home, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminRestaurantOrdersPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "preparing" | "ready" | "archive">("pending");
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const prevOrdersCountRef = useRef(0);

    // Audio reference for notification sound
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element for ping
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
        
        fetchOrders();

        // Subscribe to real-time order updates
        const channel = supabase
            .channel("kitchen-orders-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "restaurant_orders" },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        // Polling as ultimate safety backup every 10 seconds
        const timer = setInterval(fetchOrders, 10000);

        return () => {
            channel.unsubscribe();
            clearInterval(timer);
        };
    }, []);

    // Check if new orders arrived to play a bell sound
    useEffect(() => {
        const pendingCount = orders.filter(o => o.status === "pending").length;
        if (pendingCount > prevOrdersCountRef.current && prevOrdersCountRef.current !== 0) {
            if (soundEnabled && audioRef.current) {
                audioRef.current.play().catch(e => console.log("Audio play blocked by browser rules"));
            }
        }
        prevOrdersCountRef.current = pendingCount;
    }, [orders, soundEnabled]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from("restaurant_orders")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (data) {
                setOrders(data);
            }
        } catch (err) {
            console.error("Failed to fetch kitchen orders from database:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const updates: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };
            if (newStatus === "completed") {
                updates.completed_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from("restaurant_orders")
                .update(updates)
                .eq("id", orderId);

            if (error) throw error;
            
            // Optimistic UI update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
        } catch (err) {
            alert("Erreur lors de la mise à jour de la commande.");
        }
    };

    // Parse order items to separate real food items from meta items
    const parseOrder = (orderItems: any[]) => {
        if (!Array.isArray(orderItems)) return { foodItems: [], meta: {} };
        const foodItems = orderItems.filter(item => !item.is_meta);
        const metaItem = orderItems.find(item => item.is_meta) || {};
        return { foodItems, meta: metaItem };
    };

    const filteredOrders = orders.filter(order => {
        // 1. Filter by Tab status
        let matchesStatus = false;
        if (activeTab === "pending") matchesStatus = order.status === "pending";
        else if (activeTab === "preparing") matchesStatus = order.status === "preparing";
        else if (activeTab === "ready") matchesStatus = order.status === "ready";
        else matchesStatus = order.status === "completed" || order.status === "cancelled";

        // 2. Filter by search query (phone or order number)
        const matchesSearch = 
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (order.customer_phone && order.customer_phone.includes(searchQuery));

        return matchesStatus && matchesSearch;
    });

    const getElapsedTime = (createdAtStr: string) => {
        const diffMs = Date.now() - new Date(createdAtStr).getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1) return "À l'instant";
        if (diffMins >= 60) {
            const hrs = Math.floor(diffMins / 60);
            const remainingMins = diffMins % 60;
            return `${hrs}h ${remainingMins}m`;
        }
        return `${diffMins} min`;
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header section with sounds control */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/10">
                        <Utensils className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Cuisine & Commandes</h1>
                        <p className="text-xs text-gray-400 font-medium">Préparation en direct et service des tables du restaurant</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Sound Alert Toggle Button */}
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`flex-1 md:flex-none py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                            soundEnabled
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20"
                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                    >
                        {soundEnabled ? (
                            <>
                                <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
                                Son activé (Bip)
                            </>
                        ) : (
                            <>
                                <BellOff className="w-4 h-4" />
                                Bip désactivé
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* SEARCH & FILTERS CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Search Bar */}
                <div className="md:col-span-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="N° de commande ou téléphone..."
                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-400 outline-none focus:border-amber-500 transition-colors h-[46px]"
                    />
                </div>

                {/* 2. Quick Tabs */}
                <div className="md:col-span-2 bg-[#1E293B] p-1.5 rounded-xl border border-white/10 flex gap-1 h-[46px]">
                    {[
                        { id: "pending", label: "Nouveaux", count: orders.filter(o => o.status === "pending").length, color: "bg-amber-500" },
                        { id: "preparing", label: "En Cuisine", count: orders.filter(o => o.status === "preparing").length, color: "bg-blue-500 animate-pulse" },
                        { id: "ready", label: "Prêts", count: orders.filter(o => o.status === "ready").length, color: "bg-green-500" },
                        { id: "archive", label: "Archive/Annulés", count: orders.filter(o => o.status === "completed" || o.status === "cancelled").length }
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

            {/* LIVE GRID VIEW */}
            {loading ? (
                <div className="text-center py-12 text-gray-500 font-bold">
                    Chargement de la file...
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-12 text-center text-gray-400 space-y-2">
                    <Utensils className="w-12 h-12 mx-auto text-gray-500 stroke-1" />
                    <h3 className="font-bold text-white text-base">Aucune commande</h3>
                    <p className="text-xs max-w-sm mx-auto">Toutes les commandes de cette section ont été traitées ou aucune commande ne correspond à votre recherche.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map(order => {
                        const { foodItems, meta } = parseOrder(order.items);
                        const isEnRoute = meta.location_type === "on_way";

                        return (
                            <div
                                key={order.id}
                                className={`bg-[#1E293B] border rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xl ${
                                    order.status === "pending"
                                        ? "border-amber-500/40 shadow-amber-500/5 animate-pulse"
                                        : "border-white/10 hover:border-white/20"
                                }`}
                            >
                                {/* Header of Order Card */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Commande</span>
                                            <span className="text-lg font-black text-white">{order.order_number}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Passée il y a</span>
                                            <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5 justify-end">
                                                <Clock className="w-3.5 h-3.5" />
                                                {getElapsedTime(order.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Location details */}
                                    <div className="bg-[#0F172A] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isEnRoute ? (
                                                <Navigation className="w-4 h-4 text-amber-500 shrink-0" />
                                            ) : (
                                                <Table className="w-4 h-4 text-blue-500 shrink-0" />
                                            )}
                                            <div className="text-left">
                                                <span className="text-[9px] font-bold text-gray-500 block uppercase">Destination</span>
                                                <span className="text-xs font-bold text-white leading-tight">
                                                    {isEnRoute ? "En Route (À emporter)" : `Sur Place (${meta.on_site_location || "table"})`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-gray-500 block uppercase">Détail</span>
                                            <span className={`text-xs font-black ${isEnRoute ? "text-amber-500" : "text-blue-400"}`}>
                                                {isEnRoute ? (meta.arrival_time || "Bientôt") : (meta.location_detail || "N° ?")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="flex-1 border-t border-b border-white/5 py-4 my-2 space-y-3.5">
                                    {foodItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start gap-4">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-bold text-white flex items-center gap-2 leading-snug">
                                                    <span className="text-amber-500 font-black shrink-0">x{item.quantity}</span>
                                                    <span>{item.name}</span>
                                                </div>
                                                {item.meta && (
                                                    <div className="text-[10px] text-gray-400 leading-relaxed max-w-[200px]">
                                                        {item.meta}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400 font-bold shrink-0">
                                                {((item.price || item.basePrice || 0) * (item.quantity || 1))} DH
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary & Actions */}
                                <div className="space-y-4 pt-3">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="text-left">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase block">Client Phone</span>
                                            <span className="text-xs font-bold text-gray-300">{order.customer_phone || "Aucun"}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase block">Total</span>
                                            <span className="text-sm font-black text-white">{order.total_price || order.subtotal} DH</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons depending on status */}
                                    <div className="flex gap-2">
                                        {order.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                                                    className="flex-1 py-3 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-500 font-bold text-xs rounded-xl transition-all"
                                                >
                                                    Refuser
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "preparing")}
                                                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Play className="w-3.5 h-3.5 fill-black shrink-0" />
                                                    Lancer Cuisine
                                                </button>
                                            </>
                                        )}

                                        {order.status === "preparing" && (
                                            <>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "ready")}
                                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4 shrink-0" />
                                                    Prêt ! (Pris en Charge)
                                                </button>
                                            </>
                                        )}

                                        {order.status === "ready" && (
                                            <>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "completed")}
                                                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4 shrink-0" />
                                                    Servi & Encaissé
                                                </button>
                                            </>
                                        )}

                                        {(order.status === "completed" || order.status === "cancelled") && (
                                            <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-3 text-center text-xs text-gray-500 font-bold">
                                                {order.status === "completed" ? "✅ Commande Terminée" : "❌ Commande Annulée"}
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
    );
}
