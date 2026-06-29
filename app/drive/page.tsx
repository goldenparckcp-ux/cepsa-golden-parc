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
        <div className="fixed inset-0 bg-black z-[100] text-white flex flex-col font-sans select-none">
            {/* Top Bar */}
            <div className="h-24 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4 text-red-500">
                    <Car className="w-10 h-10" />
                    <span className="text-2xl font-black tracking-widest uppercase">Drive Mode</span>
                </div>
                <button onClick={() => router.back()} className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center active:bg-red-500 transition-colors">
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
                                className="h-40 bg-[#1A1A1A] rounded-3xl border-2 border-white/5 active:border-red-500 flex items-center p-4 gap-6 transition-all active:bg-[#222]"
                            >
                                <div className="w-32 h-32 rounded-2xl bg-black overflow-hidden relative shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 text-left flex flex-col justify-center">
                                    <h3 className="text-2xl font-black line-clamp-2">{item.name}</h3>
                                    <p className="text-red-500 text-3xl font-black mt-2">{item.basePrice} DH</p>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-lg">
                                    <Plus className="w-8 h-8" />
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
                                    <div key={idx} className="bg-[#1A1A1A] p-6 rounded-3xl flex justify-between items-center text-3xl font-black">
                                        <span className="truncate pr-4">{item.name}</span>
                                        <span className="text-red-500 shrink-0">{item.price} DH</span>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {items.length > 0 && (
                            <button onClick={() => router.push('/restaurant')} className="w-full h-32 bg-red-600 rounded-[2rem] flex items-center justify-center text-4xl font-black uppercase tracking-widest active:bg-red-700 shadow-2xl">
                                Valider ({total} DH)
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Large Nav */}
            <div className="h-32 bg-[#111] border-t border-white/10 flex p-4 gap-4 shrink-0">
                <button 
                    onClick={() => setActiveTab('menu')}
                    className={`flex-1 rounded-[2rem] flex items-center justify-center gap-4 text-3xl font-black transition-colors ${activeTab === 'menu' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500'}`}
                >
                    <Utensils className="w-10 h-10" /> MENU
                </button>
                <button 
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 rounded-[2rem] flex items-center justify-center gap-4 text-3xl font-black transition-colors relative ${activeTab === 'cart' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500'}`}
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
