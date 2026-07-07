"use client";

import React, { useState, useEffect, useRef } from "react";
import { Utensils, Clock, Check, Bell, BellOff, Search, Table, Navigation, LogOut, Printer } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adminDb } from "@/lib/admin-api";
import { useRouter } from "next/navigation";

export default function StaffRestaurantOrdersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "preparing" | "ready" | "archive">("pending");
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const prevOrdersCountRef = useRef(0);

    // Audio reference for notification sound
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const getArrivalMinutes = (createdAtStr: string, arrivalTimeStr: string): number => {
        const arrivalTime = (arrivalTimeStr || "30 min").toLowerCase().trim();
        const date = new Date(createdAtStr);
        
        if (arrivalTime.includes("min")) {
            const mins = parseInt(arrivalTime.replace(/[^0-9]/g, "")) || 0;
            date.setMinutes(date.getMinutes() + mins);
        } else if (arrivalTime.includes("h")) {
            const parts = arrivalTime.split("h");
            const hours = parseInt(parts[0].replace(/[^0-9]/g, "")) || 0;
            const mins = parts[1] ? (parseInt(parts[1].replace(/[^0-9]/g, "")) || 0) : 0;
            
            if (hours >= 8) {
                date.setHours(hours);
                date.setMinutes(mins);
                date.setSeconds(0);
                date.setMilliseconds(0);
            } else {
                date.setMinutes(date.getMinutes() + (hours * 60 + mins));
            }
        } else {
            date.setMinutes(date.getMinutes() + 30);
        }
        
        const diffMs = date.getTime() - Date.now();
        return Math.floor(diffMs / 60000);
    };

    const getSortedOrders = (ordersList: any[]) => {
        return [...ordersList].sort((a, b) => {
            const parseMeta = (order: any) => {
                if (!Array.isArray(order.items)) return { location_type: "on_site" };
                return order.items.find((i: any) => i.is_meta) || {};
            };
            
            const metaA = parseMeta(a);
            const metaB = parseMeta(b);
            
            const isWayA = metaA.location_type === "on_way";
            const isWayB = metaB.location_type === "on_way";
            
            if (!isWayA && isWayB) return -1;
            if (isWayA && !isWayB) return 1;
            
            if (isWayA && isWayB) {
                const minsA = getArrivalMinutes(a.created_at, metaA.arrival_time);
                const minsB = getArrivalMinutes(b.created_at, metaB.arrival_time);
                return minsA - minsB;
            }
            
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
    };

    // Session Check
    useEffect(() => {
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            try {
                const session = JSON.parse(stored);
                if (session.role !== "kitchen" && session.role !== "admin") {
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

        // Initialize audio & load orders
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
        fetchOrders();

        // Subscribe to real-time order updates
        const channel = supabase
            .channel("staff-kitchen-orders-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "restaurant_orders" },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        // Polling as safety backup
        const timer = setInterval(fetchOrders, 10000);

        return () => {
            channel.unsubscribe();
            clearInterval(timer);
        };
    }, [router]);

    // Check if new orders arrived to play a bell sound
    useEffect(() => {
        const pendingCount = orders.filter(o => o.status === "pending" || o.status === "confirmed").length;
        if (pendingCount > prevOrdersCountRef.current && prevOrdersCountRef.current !== 0) {
            if (soundEnabled && audioRef.current) {
                audioRef.current.play().catch(e => console.log("Audio play blocked by browser rules"));
            }
        }
        prevOrdersCountRef.current = pendingCount;
    }, [orders, soundEnabled]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await adminDb("restaurant_orders")
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

            const { error } = await adminDb("restaurant_orders")
                .update(updates)
                .eq("id", orderId);

            if (error) throw error;
            
            // Optimistic UI update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
        } catch (err) {
            alert("Erreur lors de la mise à jour de la commande.");
        }
    };


    
    
    const handlePrintTicket = (order: any, foodItems: any[], meta: any) => {
        const totalAmount = order.total_amount || order.total || order.amount || foodItems.reduce((acc, item) => acc + (item.price * item.quantity || 0), 0);
        const deposit = order.deposit_amount || 0;
        const remaining = totalAmount - deposit;
        
        const printContent = `
            <div style="font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; color: #000; padding: 10px; background: #fff;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 24px; text-transform: uppercase;">GOLDEN PARK STATION</h2>
                    <p style="margin: 5px 0; font-size: 14px;">Ticket Cuisine / Caisse</p>
                    <p style="margin: 5px 0; font-size: 14px; border-bottom: 2px dashed #000; padding-bottom: 10px;">${new Date(order.created_at).toLocaleString('fr-FR')}</p>
                </div>
                
                <div style="margin-bottom: 15px; font-size: 16px;">
                    <h1 style="text-align: center; margin: 5px 0; font-size: 32px; border: 2px solid #000; padding: 5px;">#${order.order_number}</h1>
                    <p style="margin: 5px 0;"><strong>Type:</strong> ${meta.location_type === "on_way" ? "EN ROUTE / DRIVE" : "SUR PLACE"}</p>
                    ${meta.table_number ? `<p style="margin: 5px 0; font-size: 20px; font-weight: bold;"><strong>Emplacement:</strong> ${meta.table_number}</p>` : ""}
                    ${meta.arrival_time ? `<p style="margin: 5px 0;"><strong>Arrivée prévue:</strong> ${meta.arrival_time}</p>` : ""}
                    ${order.customer_name ? `<p style="margin: 5px 0;"><strong>Client:</strong> ${order.customer_name}</p>` : ""}
                    ${order.customer_phone ? `<p style="margin: 5px 0;"><strong>Tel:</strong> ${order.customer_phone}</p>` : ""}
                </div>

                <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; text-align: center;">--- COMMANDES ---</h3>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #000; text-align: left;">
                            <th style="padding-bottom: 5px; width: 25px;">Qt</th>
                            <th style="padding-bottom: 5px;">Article</th>
                            <th style="padding-bottom: 5px; text-align: right;">PU</th>
                            <th style="padding-bottom: 5px; text-align: right;">Tot</th>
                        </tr>
                        ${foodItems.map(item => `
                            <tr>
                                <td style="vertical-align: top; font-weight: bold; padding-top: 5px;">${item.quantity}</td>
                                <td style="padding-top: 5px;">
                                    <strong>${item.name}</strong>
                                    ${item.options ? `<br/><span style="font-size: 11px;">- ${item.options.replace(/\|/g, ', ')}</span>` : ""}
                                    ${item.special_instructions ? `<br/><span style="font-size: 11px; font-weight: bold;">* ${item.special_instructions}</span>` : ""}
                                </td>
                                <td style="vertical-align: top; text-align: right; padding-top: 5px;">${item.price.toFixed(2)}</td>
                                <td style="vertical-align: top; text-align: right; font-weight: bold; padding-top: 5px;">${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <div style="margin-bottom: 20px; font-size: 16px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="text-align: left; padding: 3px 0;">TOTAL:</td>
                            <td style="text-align: right; font-weight: bold; font-size: 18px;">${totalAmount.toFixed(2)} DH</td>
                        </tr>
                        ${deposit > 0 ? `
                        <tr>
                            <td style="text-align: left; padding: 3px 0; color: #555;">AVANCE PAYÉE:</td>
                            <td style="text-align: right; color: #555;">-${deposit.toFixed(2)} DH</td>
                        </tr>
                        <tr>
                            <td style="text-align: left; padding: 5px 0; font-weight: bold; font-size: 18px;">RESTE À PAYER:</td>
                            <td style="text-align: right; font-weight: bold; font-size: 20px;">${Math.max(0, remaining).toFixed(2)} DH</td>
                        </tr>
                        ` : ''}
                        ${order.status === "completed" || (deposit >= totalAmount && totalAmount > 0) ? `
                        <tr>
                            <td colspan="2" style="text-align: center; padding: 10px 0; font-weight: bold; font-size: 20px; border: 2px dashed #000; margin-top: 10px;">
                                DÉJÀ PAYÉ
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.order_number}" alt="QR Code Caisse" style="width: 120px; height: 120px;" />
                    <p style="font-size: 12px; margin-top: 5px;">Scanner pour valider</p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                    <p>MERCI ET BON COURAGE !</p>
                    <p>Golden Park Station</p>
                </div>
            </div>
        `;
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(`
                <html>
                    <head>
                        <title>Ticket Cuisine #${order.order_number}</title>
                        <style>
                            @page { margin: 0; size: 80mm 297mm; }
                            body { margin: 0; padding: 0; background: #fff; }
                        </style>
                    </head>
                    <body>${printContent}</body>
                </html>
            `);
            doc.close();
            
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        }
    };



    const parseOrder = (orderItems: any[]) => {
        if (!Array.isArray(orderItems)) return { foodItems: [], meta: {} };
        const foodItems = orderItems.filter(item => !item.is_meta);
        const metaItem = orderItems.find(item => item.is_meta) || {};
        return { foodItems, meta: metaItem };
    };

    const filteredOrders = orders.filter(order => {
        let matchesStatus = false;
        if (activeTab === "pending") matchesStatus = order.status === "pending" || order.status === "confirmed";
        else if (activeTab === "preparing") matchesStatus = order.status === "preparing";
        else if (activeTab === "ready") matchesStatus = order.status === "ready";
        else matchesStatus = order.status === "completed" || order.status === "cancelled";

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

    const handleLogout = () => {
        localStorage.removeItem("staff_session");
        router.push("/staff");
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden">
            {/* Custom Staff Header */}
            <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-white/10 p-4 md:p-6 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl text-black shadow-lg shadow-orange-500/10">
                        <Utensils className="w-5.5 h-5.5" />
                    </div>
                    <div>
                        <h1 className="text-base md:text-lg font-black tracking-tight text-white leading-none">GOLDEN PARC • CUISINE 🍳</h1>
                        <span className="text-[9px] font-bold text-amber-500 tracking-wider uppercase block mt-1">Espace Préparation Cuisine</span>
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

            {/* Main Content body */}
            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* SOUND & QUICK STATS CONTROL */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-white">File des Commandes</h2>
                        <p className="text-xs text-gray-400 font-medium">Suivi en direct des plats commandés par les clients</p>
                    </div>

                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`w-full sm:w-auto py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                            soundEnabled
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20 animate-pulse"
                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                    >
                        {soundEnabled ? (
                            <>
                                <Bell className="w-4 h-4 text-amber-500" />
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

                {/* SEARCH & FILTERS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="N° de commande ou téléphone..."
                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-400 outline-none focus:border-amber-500 transition-colors h-[46px]"
                        />
                    </div>

                    <div className="md:col-span-2 bg-[#1E293B] p-1.5 rounded-xl border border-white/10 flex gap-1 h-[46px]">
                        {[
                            { id: "pending", label: "Nouveaux", count: orders.filter(o => o.status === "pending" || o.status === "confirmed").length, color: "bg-amber-500" },
                            { id: "preparing", label: "En Cuisine", count: orders.filter(o => o.status === "preparing").length, color: "bg-blue-500" },
                            { id: "ready", label: "Prêts", count: orders.filter(o => o.status === "ready").length, color: "bg-green-500" },
                            { id: "archive", label: "Archive", count: orders.filter(o => o.status === "completed" || o.status === "cancelled").length }
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

                {/* ORDERS GRID */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500 font-bold">
                        Chargement de la file...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-12 text-center text-gray-400 space-y-2">
                        <Utensils className="w-12 h-12 mx-auto text-gray-500 stroke-1" />
                        <h3 className="font-bold text-white text-base">Aucune commande</h3>
                        <p className="text-xs max-w-sm mx-auto">Toutes les commandes ont été traitées.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getSortedOrders(filteredOrders).map(order => {
                            const { foodItems, meta } = parseOrder(order.items);
                            const isEnRoute = meta.location_type === "on_way";

                            let cardColorClass = "border-white/10 hover:border-white/20";
                            let routeTimeBadge = null;

                            if (isEnRoute && ["pending", "confirmed", "preparing"].includes(order.status)) {
                                const remainingMins = getArrivalMinutes(order.created_at, meta.arrival_time);
                                if (remainingMins < 30) {
                                    cardColorClass = "border-red-500 shadow-red-500/10";
                                    routeTimeBadge = (
                                        <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider bg-red-500/20 text-red-500 border border-red-500/30">
                                            🔴 Urgent ({remainingMins} min)
                                        </span>
                                    );
                                } else if (remainingMins <= 45) {
                                    cardColorClass = "border-amber-500 shadow-amber-500/10";
                                    routeTimeBadge = (
                                        <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                            🟡 Wjed Rask ({remainingMins} min)
                                        </span>
                                    );
                                } else {
                                    cardColorClass = "border-green-500 shadow-green-500/10";
                                    routeTimeBadge = (
                                        <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider bg-green-500/20 text-green-500 border border-green-500/30">
                                            🟢 Mzel L7al ({remainingMins} min)
                                        </span>
                                    );
                                }
                            } else if (order.status === "pending" || order.status === "confirmed") {
                                cardColorClass = "border-amber-500/40 shadow-amber-500/5";
                            }

                            const totalVal = Number(order.total_price) || Number(order.subtotal) || 0;
                            const isPaidFull = order.deposit_paid && (Number(order.deposit_amount) >= totalVal);
                            const isPaidDeposit = order.deposit_paid && !isPaidFull;

                            const paymentBadge = isPaidFull ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">
                                    💰 Payé
                                </span>
                            ) : isPaidDeposit ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    💰 Acompte ({order.deposit_amount} DH)
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    🪙 À Encaisser
                                </span>
                            );

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-[#1E293B] border rounded-[2rem] p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xl ${cardColorClass}`}
                                >
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Commande</span>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="text-lg font-black text-white">{order.order_number}</span>
                                                    {routeTimeBadge}
                                                    {paymentBadge}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Passée il y a</span>
                                                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5 justify-end">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {getElapsedTime(order.created_at)}
                                                </span>
                                            </div>
                                        </div>

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
                                                        {isEnRoute 
                                                            ? "En Route (À emporter)" 
                                                            : meta.on_site_location === "pool" 
                                                                ? "Sur Place (Piscine)" 
                                                                : meta.on_site_location === "room" 
                                                                    ? "Sur Place (Chambre)" 
                                                                    : "Sur Place (Table)"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-[9px] font-bold text-gray-500 block uppercase">Détail</span>
                                                <span className={`text-xs font-black ${isEnRoute ? "text-amber-500" : "text-blue-400"}`}>
                                                    {isEnRoute 
                                                        ? (meta.arrival_time || "Bientôt") 
                                                        : meta.on_site_location === "pool"
                                                            ? `Place N° ${meta.location_detail || '?'}`
                                                            : meta.on_site_location === "room"
                                                                ? `Chambre N° ${meta.location_detail || '?'}`
                                                                : `Table N° ${meta.location_detail || '?'}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

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

                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePrintTicket(order, foodItems, meta);
                                                }}
                                                className="p-3 bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 text-gray-400 font-bold text-xs rounded-xl transition-all"
                                                title="Imprimer"
                                            >
                                                <Printer className="w-5 h-5" />
                                            </button>

                                            {(order.status === "pending" || order.status === "confirmed") && (
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
                                                        Lancer Cuisine
                                                    </button>
                                                </>
                                            )}

                                            {order.status === "preparing" && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "ready")}
                                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    Prêt ! (Informer Serveur)
                                                </button>
                                            )}

                                            {order.status === "ready" && (
                                                <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-3 text-center text-xs text-amber-500 font-bold animate-pulse">
                                                    En attente d'encaissement (Caisse)
                                                </div>
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
            </main>
        </div>
    );
}
