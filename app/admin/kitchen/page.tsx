"use client";

import React, { useState } from 'react';
import { Clock, CheckCircle2, ChefHat, Timer } from 'lucide-react';

const MOCK_ORDERS = [
    { id: 101, table: 'T-12', items: ['Tacos Viande Hachée', 'Frites', 'Coca Cola'], time: '10:30', status: 'pending' },
    { id: 102, table: 'T-04', items: ['Pizza Margharita', 'Eau Minérale'], time: '10:32', status: 'cooking' },
    { id: 103, table: 'Emporter', items: ['Panini Poulet', 'Jus d\'Orange'], time: '10:35', status: 'pending' },
];

export default function KitchenDisplay() {
    const [orders, setOrders] = useState(MOCK_ORDERS);

    const markAsCooking = (id: number) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: 'cooking' } : o));
    };

    const markAsReady = (id: number) => {
        setOrders(orders.filter(o => o.id !== id)); // Remove from screen when ready
        // In real app, this would update DB to 'ready'
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <ChefHat className="text-amber-500 w-8 h-8" /> Cuisine (KDS)
                </h1>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-500 font-mono font-bold text-sm">LIVE</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.map(order => (
                    <div
                        key={order.id}
                        className={`border rounded-xl p-4 flex flex-col h-full bg-[#1E293B] ${order.status === 'cooking'
                                ? 'border-amber-500 ring-1 ring-amber-500/50'
                                : 'border-white/10 animate-fade-in'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                            <div>
                                <div className="text-2xl font-black text-white">#{order.id}</div>
                                <div className="text-amber-400 font-bold text-sm">{order.table}</div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-mono bg-white/5 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" /> {order.time}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {(Date.now() - new Date().setHours(10, 30)) / 60000 > 10 ? 'Retard' : 'À l\'heure'}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <ul className="flex-1 space-y-3 mb-6">
                            {order.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-200 font-medium text-sm">
                                    <span className="text-amber-500 mt-1">•</span> {item}
                                </li>
                            ))}
                        </ul>

                        {/* Actions */}
                        <div className="mt-auto pt-4 border-t border-white/5">
                            {order.status === 'pending' ? (
                                <button
                                    onClick={() => markAsCooking(order.id)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Timer className="w-4 h-4" /> Lancer
                                </button>
                            ) : (
                                <button
                                    onClick={() => markAsReady(order.id)}
                                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 animate-pulse-green"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Terminer
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ChefHat className="w-8 h-8 opacity-50" />
                        </div>
                        <p>Aucune commande en cours. Pause café ? ☕</p>
                    </div>
                )}
            </div>
        </div>
    );
}
