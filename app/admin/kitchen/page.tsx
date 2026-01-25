"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, Check, Flame, Archive, Phone, AlertTriangle, User, MapPin, AlarmClock, ChevronDown, ChevronUp } from 'lucide-react';

// Helper to parse duration string to minutes
const parseDuration = (str: string | null) => {
    if (!str) return 0;
    if (str.includes('h')) return parseInt(str) * 60;
    if (str.includes('min')) return parseInt(str);
    return 0;
};

// Countdown Component
function OrderTimer({ createdAt, arrivalTime, onStatusChange }: { createdAt: string, arrivalTime: string | null, onStatusChange: (status: 'normal' | 'yellow' | 'red') => void }) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!arrivalTime) return;

        const durationMins = parseDuration(arrivalTime);
        const targetTime = new Date(new Date(createdAt).getTime() + durationMins * 60000);

        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetTime.getTime() - now.getTime();
            const minsLeft = Math.floor(diff / 60000);

            setTimeLeft(minsLeft);

            if (minsLeft <= 30) onStatusChange('red');
            else if (minsLeft <= 45) onStatusChange('yellow');
            else onStatusChange('normal');

        }, 1000);

        return () => clearInterval(interval);
    }, [createdAt, arrivalTime]);

    if (timeLeft === null) return null;

    return (
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : timeLeft <= 45 ? 'text-yellow-500' : 'text-blue-400'
            }`}>
            <AlarmClock className="w-5 h-5" />
            {timeLeft > 0 ? (
                <span>-{Math.floor(timeLeft / 60)}h {timeLeft % 60}m</span>
            ) : (
                <span>Client est là !</span>
            )}
        </div>
    );
}

export default function KitchenDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState('all'); // all, pending, preparing

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('restaurant_orders')
            .select('*')
            .in('status', ['pending', 'preparing', 'ready'])
            .order('created_at', { ascending: true });

        if (data) setOrders(data);
    };

    useEffect(() => {
        fetchOrders();
        const sub = supabase.channel('kitchen_orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_orders' }, fetchOrders)
            .subscribe();
        return () => { sub.unsubscribe(); };
    }, []);

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('restaurant_orders').update({ status }).eq('id', id);
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    };

    const filteredOrders = orders.filter(o =>
        filter === 'all' ? true : o.status === filter
    );

    return (
        <div className="min-h-screen bg-[#0F172A] p-6 text-white font-sans">

            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">KITCHEN DISPLAY</h1>
                    <p className="text-gray-400 font-medium">Gestion des commandes • {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'preparing'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-lg font-bold text-sm uppercase transition-all ${filter === f
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-[#1E293B] text-gray-400 hover:bg-[#283548]'
                                }`}
                        >
                            {f === 'all' ? 'Tout' : f === 'pending' ? 'Nouveau' : 'En Cours'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500 font-medium">
                        Aucune commande en cours.
                    </div>
                )}

                {filteredOrders.map(order => {
                    const [timerStatus, setTimerStatus] = useState<'normal' | 'yellow' | 'red'>('normal');
                    const isTakeout = order.items.find((i: any) => i.is_meta && i.type === 'takeout');
                    const isDineIn = order.items.find((i: any) => i.is_meta && i.type === 'dine_in');
                    const meta = order.items.find((i: any) => i.is_meta);

                    // Filter out meta items for display
                    const foodItems = order.items.filter((i: any) => !i.is_meta);

                    // Determine Border Color based on Wait Time Logic or Status
                    let borderColor = 'border-gray-800';
                    if (timerStatus === 'red') borderColor = 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.2)]';
                    else if (timerStatus === 'yellow') borderColor = 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)]';
                    else if (order.status === 'preparing') borderColor = 'border-blue-600';
                    else if (order.status === 'ready') borderColor = 'border-green-500';

                    return (
                        <div
                            key={order.id}
                            className={`bg-[#1E293B] rounded-2xl border-2 ${borderColor} p-6 flex flex-col relative transition-all duration-300`}
                        >
                            {/* Header Info */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white mb-1">
                                        {isDineIn ? `Table ${meta?.table_number}` : 'A EMPORTER'}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <span>#{order.order_number}</span>
                                        <span>•</span>
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {isTakeout && meta?.arrival_time && (
                                        <OrderTimer
                                            createdAt={order.created_at}
                                            arrivalTime={meta.arrival_time}
                                            onStatusChange={setTimerStatus}
                                        />
                                    )}
                                    {isDineIn && (
                                        <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                                            Sur Place
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            {order.customer_phone && (
                                <div className="bg-[#0F172A] rounded-xl p-3 flex items-center gap-3 mb-4 border border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Client</div>
                                        <div className="text-xs text-gray-400 font-mono">{order.customer_phone}</div>
                                    </div>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="flex-1 space-y-4 mb-6">
                                {foodItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-700/50 shrink-0 overflow-hidden">
                                            <img src={item.image} className="w-full h-full object-cover opacity-80" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-gray-200">{item.name}</span>
                                                <span className="text-orange-500 font-black">x{item.quantity}</span>
                                            </div>
                                            {item.meta && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.meta}</p>
                                            )}
                                            {item.customizations?.special_instructions && (
                                                <div className="mt-2 bg-red-500/10 border border-red-500/20 p-2 rounded-lg flex gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                                    <span className="text-xs font-bold text-red-400 italic">"{item.customizations.special_instructions}"</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions / Details Footer */}
                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                {order.status === 'pending' ? (
                                    <button
                                        onClick={() => updateStatus(order.id, 'preparing')}
                                        className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all"
                                    >
                                        COMMENCER
                                    </button>
                                ) : order.status === 'preparing' ? (
                                    <div className="w-full flex gap-3">
                                        <button
                                            onClick={() => updateStatus(order.id, 'ready')}
                                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-5 h-5" /> PRÊT
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => updateStatus(order.id, 'completed')}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-4 rounded-xl font-bold transition-all"
                                    >
                                        ARCHIVER
                                    </button>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
