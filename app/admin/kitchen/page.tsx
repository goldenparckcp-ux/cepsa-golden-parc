"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';
import { Clock, Check, Flame, Archive, Phone, AlertTriangle } from 'lucide-react';

export default function KitchenDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState('all'); // all, pending, preparing

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('restaurant_orders')
            .select('*')
            .in('status', ['pending', 'preparing', 'ready'])
            .order('created_at', { ascending: true });

        if (data) setOrders(data);
    };

    useEffect(() => {
        fetchOrders();

        // Real-time subscription
        const subscription = supabase
            .channel('kitchen_orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => { subscription.unsubscribe(); };
    }, []);

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('restaurant_orders').update({ status }).eq('id', id);
        // Optimistic update
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    };

    const filteredOrders = orders.filter(o =>
        filter === 'all' ? true : o.status === filter
    );

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const preparingCount = orders.filter(o => o.status === 'preparing').length;
    const readyCount = orders.filter(o => o.status === 'ready').length;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">

            {/* Header */}
            <header className="flex items-center justify-between mb-8 bg-gray-800 p-4 rounded-2xl border border-gray-700">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🍽️</span>
                    <div>
                        <h1 className="text-2xl font-bold">Cuisine Dashboard</h1>
                        <p className="text-gray-400 text-sm">Gestion des commandes en temps réel</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-yellow-500/20 border border-yellow-500/50 px-6 py-2 rounded-xl text-center">
                        <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
                        <div className="text-xs uppercase font-bold text-yellow-500/80">En Attente</div>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/50 px-6 py-2 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-500">{preparingCount}</div>
                        <div className="text-xs uppercase font-bold text-blue-500/80">En Cours</div>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/50 px-6 py-2 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-500">{readyCount}</div>
                        <div className="text-xs uppercase font-bold text-green-500/80">Prêtes</div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="flex gap-4 mb-8">
                {['all', 'pending', 'preparing'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-3 rounded-xl font-bold uppercase transition-all ${filter === f
                                ? 'bg-white text-gray-900'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {f === 'all' ? 'Toutes' : f === 'pending' ? 'En Attente' : 'En Préparation'}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map(order => (
                    <div
                        key={order.id}
                        className={`bg-gray-800 rounded-3xl border-2 overflow-hidden flex flex-col ${order.status === 'pending' ? 'border-yellow-500/50' :
                                order.status === 'preparing' ? 'border-blue-500/50' : 'border-green-500/50'
                            }`}
                    >
                        {/* Order Header */}
                        <div className="p-4 bg-gray-900/50 flex justify-between items-start border-b border-gray-700">
                            <div>
                                <h3 className="font-mono text-xl font-bold text-white">#{order.order_number}</h3>
                                <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mb-1 ${order.status === 'pending' ? 'bg-yellow-500 text-black' :
                                        order.status === 'preparing' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                    }`}>
                                    {order.status}
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-xs justify-end">
                                    <Phone className="w-3 h-3" /> {order.customer_phone}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="p-4 space-y-4 flex-1">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4">
                                    {/* Item Image */}
                                    <div className="w-16 h-16 rounded-xl bg-gray-700 shrink-0 overflow-hidden">
                                        <img src={item.image} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-lg">{item.name}</h4>
                                            <span className="bg-gray-700 w-8 h-8 flex items-center justify-center rounded-lg font-mono font-bold">
                                                x{item.quantity}
                                            </span>
                                        </div>

                                        {/* Customizations */}
                                        {item.customizations && (
                                            <div className="mt-2 text-sm space-y-1">
                                                {/* Meta String (Pre-formatted) */}
                                                {item.meta && (
                                                    <div className="text-gray-300 bg-gray-700/50 p-2 rounded-lg text-xs leading-relaxed">
                                                        {item.meta.split(' · ').map((part: string, i: number) => (
                                                            <div key={i} className="mb-1">
                                                                • {part}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Special Instructions */}
                                                {item.customizations.special_instructions && (
                                                    <div className="flex gap-2 bg-yellow-900/30 border border-yellow-700/50 p-2 rounded-lg mt-2">
                                                        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                                                        <span className="text-yellow-200 font-bold text-xs italic">
                                                            "{item.customizations.special_instructions}"
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'preparing')}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <Flame className="w-5 h-5 animate-pulse" /> TO CUISINE (Start)
                                </button>
                            )}

                            {order.status === 'preparing' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => updateStatus(order.id, 'pending')}
                                        className="px-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition text-gray-300"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => updateStatus(order.id, 'ready')}
                                        className="flex-1 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-5 h-5" /> READY
                                    </button>
                                </div>
                            )}

                            {order.status === 'ready' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
                                >
                                    <Archive className="w-5 h-5" /> Archive (Completed)
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
