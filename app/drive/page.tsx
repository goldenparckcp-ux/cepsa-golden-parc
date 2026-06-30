"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Car, X, Plus, Utensils, Zap, Check } from "lucide-react";
import { useCart } from "@/lib/state/CartContext";
import { COMPLETE_MENU } from "@/lib/types/menu";

export default function DriveModePage() {
    const router = useRouter();
    const { items, addItem, total } = useCart();
    const [activeTab, setActiveTab] = useState<'menu' | 'cart'>('menu');

    const handleQuickAdd = (item: any) => {
        addItem({
            id: `${item.id}-${Date.now()}`,
            name: item.name,
            price: item.basePrice,
            totalPrice: item.basePrice,
            quantity: 1,
            image: item.image,
            customizations: {}
        });
    };

    return (
        <div className="fixed inset-0 bg-[#0B0F19] z-[100] text-white flex flex-col font-sans select-none relative overflow-hidden">
            {/* Background Glow Accents */}
            <div className="absolute top-[20%] left-[20%] w-[450px] h-[450px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            {/* Top Bar */}
            <div className="h-24 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4 text-red-500">
                    <Car className="w-10 h-10 animate-bounce-slow" />
                    <span className="text-2xl font-black tracking-widest uppercase">Drive Mode</span>
                </div>
                <button onClick={() => router.back()} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:bg-red-500 active:scale-95 transition-all">
                    <X className="w-8 h-8" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'menu' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {COMPLETE_MENU.slice(0, 10).map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleQuickAdd(item)}
                                className="h-40 bg-[#111827]/40 backdrop-blur-md rounded-[2rem] border-2 border-white/5 active:border-red-500 flex items-center p-4 gap-6 transition-all active:scale-[0.99]"
                            >
                                <div className="w-32 h-32 rounded-2xl bg-black/40 border border-white/10 overflow-hidden relative shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 text-left flex flex-col justify-center">
                                    <h3 className="text-2xl font-black uppercase tracking-tight line-clamp-2">{item.name}</h3>
                                    <p className="text-amber-400 text-3xl font-black mt-2">{item.basePrice} DH</p>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20 active:scale-90 transition-all">
                                    <Plus className="w-8 h-8 text-white" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 h-full flex flex-col">
                        <div className="flex-1 space-y-4 overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 text-2xl font-black">
                                    PANIER VIDE
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={idx} className="bg-[#111827]/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 flex justify-between items-center text-3xl font-black">
                                        <span className="truncate pr-4 uppercase tracking-tight">{item.name}</span>
                                        <span className="text-amber-400 shrink-0">{item.price} DH</span>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {items.length > 0 && (
                            <button onClick={() => router.push('/restaurant')} className="w-full h-32 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 rounded-[2rem] flex items-center justify-center text-4xl font-black uppercase tracking-widest active:scale-[0.98] transition-all shadow-2xl shadow-red-600/20">
                                Valider ({total} DH)
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Large Nav */}
            <div className="h-32 bg-[#0B0F19]/80 backdrop-blur-md border-t border-white/5 flex p-4 gap-4 shrink-0">
                <button 
                    onClick={() => setActiveTab('menu')}
                    className={`flex-1 rounded-[2rem] flex items-center justify-center gap-4 text-3xl font-black transition-all active:scale-[0.98] ${activeTab === 'menu' ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                >
                    <Utensils className="w-10 h-10" /> MENU
                </button>
                <button 
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 rounded-[2rem] flex items-center justify-center gap-4 text-3xl font-black transition-all active:scale-[0.98] relative ${activeTab === 'cart' ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                >
                    <Zap className="w-10 h-10" /> PANIER
                    {items.length > 0 && (
                        <div className="absolute top-4 right-4 bg-white text-red-600 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg">
                            {items.length}
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
