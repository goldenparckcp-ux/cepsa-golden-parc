"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, Phone, CheckCircle, XCircle, AlertTriangle, Utensils, User, MapPin, AlarmClock, UtensilsCrossed, Calendar } from 'lucide-react';

export default function KitchenDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        // Sync timer
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                console.error("Failed to fetch orders via API");
            }
        } catch (err) {
            console.error("API error:", err);
        }
    };

    useEffect(() => {
        fetchOrders();
        const sub1 = supabase.channel('kitchen_new').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
        const sub2 = supabase.channel('kitchen_old').on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_orders' }, fetchOrders).subscribe();

        // Super-Aggressive Polling (2s) for "Instant" feel
        const interval = setInterval(fetchOrders, 2000);
        return () => { sub1.unsubscribe(); sub2.unsubscribe(); clearInterval(interval); };
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const order = orders.find(o => o.id === id);
        if (order) {
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
            try {
                await fetch('/api/admin/orders', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status, source: order.source })
                });
                fetchOrders();
            } catch (err) {
                console.error("Update error:", err);
                fetchOrders();
            }
        }
    };

    // Robust Time Parser with Day Rollover & Duration Support
    const parseTime = (input: any, anchorInput: string | number) => {
        const anchorTime = typeof anchorInput === 'string' ? new Date(anchorInput).getTime() : anchorInput;
        if (!input) return anchorTime;

        // Regex to capture pure digits OR digits with "min" suffix
        const durationMatch = typeof input === 'string' ? input.match(/^(\d+)(\s*(min|m|minutes?))?$/i) : null;

        if (durationMatch) {
            const minutes = parseInt(durationMatch[1]);

            // 1. Try Duration Logic (Anchor + X mins)
            const durationTarget = anchorTime + minutes * 60000;
            if (durationTarget > Date.now()) {
                return durationTarget;
            }

            // 2. Fallback: Try "Time of Day" Logic (00:XX) to force Future via Rollover
            // This rescues cases where Anchor is old but user wants "X mins from now"-ish behavior via Time Rollover
            const h = 0;
            const m = minutes;
            const d = new Date();
            d.setHours(h, m, 0, 0);

            // Smart Rollover
            if (d.getTime() < Date.now() - 6 * 60 * 60 * 1000) {
                d.setDate(d.getDate() + 1);
            }
            return d.getTime();
        }

        // 3. Handle "HH:MM" (Standard Time)
        if (typeof input === 'string' && input.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
            const [h, m] = input.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);

            // Smart Rollover
            if (d.getTime() < Date.now() - 6 * 60 * 60 * 1000) {
                d.setDate(d.getDate() + 1);
            }
            return d.getTime();
        }

        const d = new Date(input);
        return isNaN(d.getTime()) ? anchorTime : d.getTime();
    };

    // --- SMART SORTING LOGIC ---
    const getPriorityScore = (order: any) => {
        // 0. Completed/Ready = Bottom
        if (order.status === 'ready' || order.status === 'completed') return -1000;

        // 1. Dine-in (Sur Place) = HIGHEST PRIORITY
        if (order.service_type === 'dine_in') return 10000;

        const arrival = parseTime(order.arrival_time, order.created_at);
        const diffMinutes = (arrival - now) / 60000;

        // 2. Late (Retard) = CRITICAL (Strictly negative)
        if (diffMinutes < 0) return 6000 + Math.abs(diffMinutes);

        // 3. Urgent (0-15m) = Final Prep / Client Arriving
        if (diffMinutes <= 15) return 5000;

        // 4. Cook Now (15-30m) = Main Cooking Phase
        if (diffMinutes <= 30) return 4000;

        // 5. Warmup (30-60m) = Prep Soon
        if (diffMinutes <= 60) return 3000;

        // 6. Future (> 60m) = Queue sorted by time (closer = higher)
        return 1000 - diffMinutes;
    };

    // Filter out archived unless recently completed (optional, keeping it simple for now to show all active)
    const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'rejected');
    const sortedOrders = [...activeOrders].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-4 font-sans">
            <header className="flex items-center justify-between mb-6 bg-[#1E293B] p-4 rounded-3xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-900/20">
                        <UtensilsCrossed className="w-8 h-8 text-white relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">KITCHEN DISPLAY</h1>
                        <p className="text-gray-400 font-medium flex items-center gap-2 text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-20 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Mode Intelligent (Priorité Auto)
                        </p>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-4xl font-black font-mono text-white tracking-widest">
                        {new Date(now).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 flex justify-end gap-2 items-center">
                        <Calendar className="w-3 h-3" />
                        {new Date(now).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {sortedOrders.length === 0 && (
                    <div className="col-span-full py-32 text-center flex flex-col items-center opacity-50">
                        <div className="p-6 bg-gray-800 rounded-full mb-4">
                            <Utensils className="w-12 h-12 text-gray-500" />
                        </div>
                        <div className="text-gray-400 text-xl font-bold">Aucune commande en cours.</div>
                        <p className="text-gray-600 mt-2">Prêt pour le service !</p>
                    </div>
                )}

                {sortedOrders.map(order => (
                    <SmartOrderCard key={order.id} order={order} now={now} updateStatus={updateStatus} parseTime={parseTime} />
                ))}
            </div>
        </div>
    );
}

function SmartOrderCard({ order, now, updateStatus, parseTime }: { order: any, now: number, updateStatus: (id: string, s: string) => void, parseTime: Function }) {
    // Timer Logic
    let targetTime = 0;
    // Use updated_at if available for "Fresh" duration calculations
    const anchorTime = order.updated_at || order.created_at;

    if (order.arrival_time) {
        // Pass anchorTime instead of just created_at
        targetTime = parseTime(order.arrival_time, anchorTime);
    } else {
        targetTime = new Date(order.created_at).getTime() + 30 * 60000;
    }

    const diffMs = targetTime - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((Math.abs(diffMs) % 60000) / 1000);

    // DEBUG: Diagnose the "Retard" issue
    // console.log("Order:", order.id, "Arrival:", order.arrival_time, "Created:", order.created_at, "Target:", new Date(targetTime).toLocaleTimeString());

    // Determines Status & Styling
    let statusConfig = {
        label: "À Venir",
        color: "bg-blue-600",
        border: "border-blue-500/30",
        bg: "bg-[#1E293B]",
        animate: false
    };

    if (order.service_type === 'dine_in') {
        statusConfig = { label: "🍽️ SUR PLACE", color: "bg-purple-600", border: "border-purple-500", bg: "bg-[#2D1B4E]", animate: false };
    } else {
        if (diffMinutes < 0) {
            statusConfig = { label: `🚨 RETARD (+${Math.abs(diffMinutes)}m)`, color: "bg-red-600", border: "border-red-500", bg: "bg-[#3B1E1E]", animate: true };
        } else if (diffMinutes <= 15) {
            statusConfig = { label: "🏃 ARRIVE (FINITION)", color: "bg-orange-600", border: "border-orange-500", bg: "bg-[#3B2D1E]", animate: true };
        } else if (diffMinutes <= 30) {
            statusConfig = { label: "👨‍🍳 CUISINEZ (FEU)", color: "bg-yellow-600", border: "border-yellow-500", bg: "bg-[#2E2E1E]", animate: false };
        } else if (diffMinutes <= 45) {
            statusConfig = { label: "🔪 MISE EN PLACE", color: "bg-cyan-600", border: "border-cyan-500/50", bg: "bg-[#162B32]", animate: false };
        } else if (diffMinutes <= 60) {
            statusConfig = { label: "⚠️ PRÉP. BIENTÔT", color: "bg-blue-500", border: "border-blue-500/50", bg: "bg-[#1E293B]", animate: false };
        } else {
            statusConfig = { label: `📅 PRÉVU (+${Math.floor(diffMinutes / 60)}H)`, color: "bg-gray-600", border: "border-gray-700", bg: "bg-[#1E293B]", animate: false };
        }
    }

    if (order.status === 'ready') statusConfig = { label: "✅ PRÊT À SERVIR", color: "bg-green-600", border: "border-green-500", bg: "bg-green-900/20", animate: false };

    // Format Timer for display
    const isLate = diffMinutes < 0;
    const timerDisplay = Math.abs(diffMinutes) > 60
        ? `${Math.floor(Math.abs(diffMinutes) / 60)}h`
        : `${Math.abs(diffMinutes)}m ${diffSeconds}s`;

    return (
        <div className={`relative rounded-3xl p-5 border-2 flex flex-col gap-4 shadow-2xl transition-all duration-500 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.animate ? 'animate-pulse' : ''} ${order.status === 'ready' ? 'opacity-80 scale-95 grayscale-[0.3]' : ''}`}>

            {/* Header / Status Banner */}
            <div className="flex justify-between items-start">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg flex items-center gap-2 ${statusConfig.color}`}>
                    {statusConfig.animate && <AlarmClock className="w-3 h-3 animate-bounce" />}
                    {statusConfig.label}
                </div>
                {order.service_type !== 'dine_in' && (
                    <div className={`font-mono font-black text-2xl drop-shadow-md tabular-nums ${diffMinutes <= 15 ? 'text-red-400' : 'text-gray-300'}`}>
                        {isLate ? <span className="text-red-500 animate-pulse">+{timerDisplay}</span> : <span>-{timerDisplay}</span>}
                    </div>
                )}
                {order.service_type === 'dine_in' && (
                    <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                        Salle
                    </div>
                )}
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-300">
                    <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                    <div className="text-sm font-bold text-gray-200 truncate pr-2">
                        {order.table_number ? `Table ${order.table_number}` : "Client (Emporter)"}
                    </div>
                    <div className="text-xs font-mono text-gray-400 font-bold">{order.customer_phone}</div>
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-3 flex-1 min-h-[80px]">
                {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start border-b border-white/5 pb-2 last:border-0">
                        {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-800 border border-white/10" />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-gray-200 text-sm leading-tight break-words pr-2">{item.name}</span>
                                <span className="font-black text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded text-xs">x{item.quantity}</span>
                            </div>
                            {item.customizations && Object.entries(item.customizations).length > 0 && (
                                <div className="text-[10px] text-gray-400 mt-1 space-y-0.5 bg-white/5 p-1.5 rounded-lg">
                                    {Object.entries(item.customizations).map(([key, val]: any) => (
                                        <div key={key} className="flex gap-1">
                                            <span className="opacity-50 capitalize">{key}:</span>
                                            <span className="font-bold text-gray-300">{Array.isArray(val) ? val.join(', ') : val}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Remarques (Notes) - Changed to Information Style (Blue) */}
            {order.notes && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl flex gap-3 items-start animate-in slide-in-from-bottom-2">
                    <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs font-bold text-blue-200 italic break-words w-full">
                        "{order.notes.replace('[SYSTEM]', '')}"
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-2">
                {order.status !== 'ready' && (
                    <button
                        onClick={() => updateStatus(order.id, 'ready')}
                        className="col-span-2 py-4 bg-green-600 hover:bg-green-500 active:scale-95 transition-all rounded-xl font-black text-white shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 group"
                    >
                        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        PRÊT À SERVIR
                    </button>
                )}
                {order.status === 'ready' && (
                    <button
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="col-span-2 py-4 bg-[#2D3748] hover:bg-[#4A5568] rounded-xl font-bold text-gray-300 flex items-center justify-center gap-2 border border-white/5 transition-colors"
                    >
                        ARCHIVER
                    </button>
                )}
            </div>
        </div>
    );
}
