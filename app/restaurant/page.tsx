"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Plus, ShoppingCart, UtensilsCrossed, Phone, ChevronRight, Trash2, Clock, MapPin, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/state/CartContext";
import { useUI } from "@/lib/state/UIContext";
import { COMPLETE_MENU, restaurantCategories, MenuItem } from "@/lib/types/menu";
import { COLORS } from "@/lib/theme";
import { DarkSheet } from "@/components/ui/DarkSheet";
import { supabase } from "@/lib/supabase";

function formatDh(price: number) {
    return `${price.toFixed(2)} DH`;
}

// ... Initial Selections Helper ...
function initSelections(item: MenuItem): Record<string, any> {
    const out: any = {};
    const cfg = item?.customization || {};
    Object.entries(cfg).forEach(([key, opt]) => {
        if (opt.type === "stepper") out[key] = opt.default ?? opt.min ?? 0;
        if (opt.type === "radio") out[key] = opt.default ?? opt.options?.[0]?.id ?? null;
        if (opt.type === "checkbox") out[key] = [];
        if (opt.type === "checkbox-group") {
            const defaults = (opt.options || []).filter((o: any) => o.included).map((o: any) => o.id);
            out[key] = defaults;
        }
    });
    out.special_instructions = "";
    return out;
}

function calcPrice(item: MenuItem, selections: any): number {
    let price = item.basePrice;
    const cfg = item.customization || {};

    Object.entries(cfg).forEach(([key, opt]) => {
        const value = selections?.[key];
        if (opt.type === "radio") {
            const selected = opt.options?.find((o: any) => o.id === value);
            if (typeof selected?.price === "number") price += selected.price;
        }
        if (opt.type === "checkbox" || opt.type === "checkbox-group") {
            const ids = Array.isArray(value) ? value : [];
            ids.forEach((id: string) => {
                const selected = opt.options?.find((o: any) => o.id === id);
                if (selected && !selected.included && typeof selected.price === "number") price += selected.price;
            });
        }
    });
    return price;
}

export default function RestaurantPage() {
    const router = useRouter();
    const { items, addItem, removeItem, clear, total, itemCount } = useCart();

    // UI States
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selections, setSelections] = useState<any>({});

    // Order info
    const [phone, setPhone] = useState("");
    const [orderType, setOrderType] = useState<'takeout' | 'dine_in'>('takeout');
    const [arrivalTime, setArrivalTime] = useState<string>("15 min");
    const [tableNumber, setTableNumber] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Time Slots
    const arrivalOptions = ["10 min", "15 min", "20 min", "30 min", "45 min", "1 h"];

    // Filter Items
    const displayItems = useMemo(() => {
        if (activeCategory === "all") return COMPLETE_MENU;
        return COMPLETE_MENU.filter(i => i.category === activeCategory);
    }, [activeCategory]);

    const handleItemClick = (item: MenuItem) => {
        if (!item.available) return;
        setCustomizeItem(item);
        setSelections(initSelections(item));
    };

    const customizationPrice = useMemo(() => {
        if (!customizeItem) return 0;
        return calcPrice(customizeItem, selections);
    }, [customizeItem, selections]);

    const handleAddToCart = () => {
        if (!customizeItem) return;

        // Generate Meta String
        const cfg = customizeItem.customization || {};
        const metaParts: string[] = [];
        Object.keys(cfg).forEach((k) => {
            const opt = cfg[k];
            const v = selections[k];
            if (opt.type === "radio") {
                const o = opt.options?.find((x: any) => x.id === v);
                if (o) metaParts.push(`${opt.label}: ${o.label}`);
            }
            if (opt.type === "stepper" && v > 0) metaParts.push(`${opt.label}: ${v} ${opt.unit || ""}`);
            if ((opt.type === "checkbox" || opt.type === "checkbox-group") && Array.isArray(v) && v.length > 0) {
                const labels = v.map((id: string) => opt.options?.find((x: any) => x.id === id)?.label || id).join(", ");
                metaParts.push(`${opt.label}: ${labels}`);
            }
        });
        if (selections.special_instructions) metaParts.push(`Note: ${selections.special_instructions}`);

        addItem({
            id: `${customizeItem.id}-${Date.now()}`,
            name: customizeItem.name,
            image: customizeItem.image,
            basePrice: customizeItem.basePrice,
            price: customizationPrice,
            totalPrice: customizationPrice,
            quantity: 1,
            customizations: selections,
            meta: metaParts.join(" · ")
        });

        setCustomizeItem(null);
    };

    // --- AUTO-CHECKOUT LOGIC ---
    useEffect(() => {
        const attemptAutoCheckout = async () => {
            if (!localStorage.getItem('pendingRestaurantOrder')) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (!profile?.phone && !profile?.email) return;

            // Execute Order
            await processOrder(user, profile);
            localStorage.removeItem('pendingRestaurantOrder');
        };
        attemptAutoCheckout();
    }, [items, total]); // Dep on items to ensure they are loaded
    // ---------------------------

    const processOrder = async (user: any, profile: any) => {
        setIsSubmitting(true);
        const orderNum = `CMD-${Date.now().toString().slice(-6)}`;

        // Compile Delivery Info
        const deliveryInfo = {
            type: orderType,
            arrival_time: orderType === 'takeout' ? arrivalTime : null,
            table_number: orderType === 'dine_in' ? tableNumber : null,
            customer_notes: notes,
            user_id: user.id
        };

        const finalItems = [
            ...items,
            { is_meta: true, ...deliveryInfo }
        ];

        const { error } = await supabase.from('restaurant_orders').insert({
            order_number: orderNum,
            user_id: user.id,
            customer_phone: profile.phone || profile.email,
            items: finalItems,
            status: 'pending',
            subtotal: total,
            total_price: total,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error(error);
            alert("Erreur: " + error.message);
            setIsSubmitting(false);
        } else {
            setShowSuccess(orderNum);
            clear();
            setIsCartOpen(false);
            setIsSubmitting(false);
        }
    };

    const handleCheckout = async () => {
        if (items.length === 0) return;

        if (orderType === 'dine_in' && !tableNumber) {
            alert("Veuillez entrer votre numéro de table");
            return;
        }

        // Check Auth
        const { data: { user } } = await supabase.auth.getUser();
        let profile = null;
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            profile = data;
        }

        // REDIRECT IF MISSING - Allow Google users (email) or Phone users
        if (!user || (!profile?.phone && !profile?.email)) {
            localStorage.setItem('pendingRestaurantOrder', 'true');
            router.push('/profile?redirect=/restaurant');
            return;
        }

        await processOrder(user, profile);
    };

    return (
        <div className="min-h-screen pb-40 bg-[#0F172A]" style={{ backgroundColor: COLORS.bgDark }}>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Commande Confirmée! 🎉</h2>
                        <p className="text-gray-400 mb-6">
                            Votre commande <span className="text-white font-bold">#{showSuccess}</span> a été envoyée en cuisine.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/orders')}
                                className="w-full py-4 bg-blue-600 rounded-xl font-bold text-white shadow-lg hover:bg-blue-500 transition-all"
                            >
                                Suivre ma commande
                            </button>
                            <button
                                onClick={() => setShowSuccess(null)}
                                className="w-full py-4 bg-white/5 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-all"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Categories */}
            <div className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 pt-4 pb-2 px-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl shadow-lg shadow-red-500/20">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white leading-none">Menu</h1>
                            <p className="text-xs text-gray-400 mt-1">Restaurant & Café</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                    <div className="flex gap-2 min-w-max">
                        {restaurantCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeCategory === cat.id
                                    ? "bg-white text-black border-white shadow-lg scale-105"
                                    : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayItems.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        Aucun article trouvé dans cette catégorie.
                    </div>
                )}
                {displayItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="group bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden text-left flex flex-col hover:border-white/20 transition-all shadow-lg hover:shadow-2xl"
                    >
                        <div className={`relative overflow-hidden w-full ${item.name.includes("Couscous") ? "h-64" : "h-48"}`}>
                            <img
                                src={item.image}
                                className={`w-full h-full object-cover transition duration-700 group-hover:scale-110 ${item.name.includes("Couscous") ? "object-bottom" : "object-center"}`}
                            />
                            {item.badge && (
                                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                                    {item.badge}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent opacity-80" />
                            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                <div className="text-2xl font-black text-white drop-shadow-md">{formatDh(item.basePrice)}</div>
                                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                                    <Plus className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 pt-2 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white leading-tight mb-2">{item.name}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Customization Sheet - Modern Premium Design */}
            <DarkSheet open={!!customizeItem} onClose={() => setCustomizeItem(null)} title={customizeItem?.name || "Personnaliser"}>
                {customizeItem && (
                    <div className="flex flex-col h-full">
                        {/* Scrollable Content */}
                        <div className="p-6 pb-40 space-y-8 overflow-y-auto">

                            {/* Image Header (Optional - adds nice touch) */}
                            <div className="rounded-2xl overflow-hidden h-40 w-full relative -mt-2">
                                <img src={customizeItem.image} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                            </div>

                            {/* Options List */}
                            {Object.entries(customizeItem.customization || {}).map(([key, opt]: [string, any]) => (
                                <div key={key} className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                        <div className="h-[1px] bg-white/10 flex-1"></div>
                                        {opt.label}
                                        <div className="h-[1px] bg-white/10 flex-1"></div>
                                    </h3>

                                    <div className="space-y-2">
                                        {opt.options?.map((subOpt: any) => {
                                            const isSelected = Array.isArray(selections[key])
                                                ? selections[key].includes(subOpt.id)
                                                : selections[key] === subOpt.id;

                                            return (
                                                <button
                                                    key={subOpt.id}
                                                    onClick={() => {
                                                        if (opt.type === 'radio') setSelections({ ...selections, [key]: subOpt.id });
                                                        if (opt.type.includes('checkbox')) {
                                                            const current = selections[key] || [];
                                                            const next = current.includes(subOpt.id)
                                                                ? current.filter((x: any) => x !== subOpt.id)
                                                                : [...current, subOpt.id];
                                                            setSelections({ ...selections, [key]: next });
                                                        }
                                                    }}
                                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${isSelected
                                                        ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                                                        : 'bg-[#1E293B]/50 border-white/5 hover:bg-[#1E293B] hover:border-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {/* Radio/Check Indicator */}
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                            ? 'bg-blue-500 border-blue-500 scale-110'
                                                            : 'bg-transparent border-white/20 group-hover:border-white/40'
                                                            }`}>
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                                                        </div>
                                                        <span className={`font-medium transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                            {subOpt.label}
                                                        </span>
                                                    </div>

                                                    {subOpt.price ? (
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/5 text-amber-500'}`}>
                                                            +{subOpt.price} DH
                                                        </span>
                                                    ) : null}
                                                </button>
                                            );
                                        })}

                                        {/* Stepper Design */}
                                        {opt.type === 'stepper' && (
                                            <div className="flex items-center justify-between bg-[#1E293B] p-2 pr-4 rounded-2xl border border-white/5">
                                                <div className="px-4 py-2 bg-white/5 rounded-xl text-gray-300 text-sm font-bold">
                                                    Quantité
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <button
                                                        onClick={() => setSelections({ ...selections, [key]: Math.max(opt.min || 0, selections[key] - 1) })}
                                                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-black text-xl text-white w-4 text-center">{selections[key]}</span>
                                                    <button
                                                        onClick={() => setSelections({ ...selections, [key]: Math.min(opt.max || 10, selections[key] + 1) })}
                                                        className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-500 active:scale-95 transition-all text-white"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Note Spéciale</h3>
                                <textarea
                                    value={selections.special_instructions}
                                    onChange={e => setSelections({ ...selections, special_instructions: e.target.value })}
                                    className="w-full bg-[#1E293B]/50 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 outline-none focus:border-blue-500 focus:bg-[#1E293B] transition-all h-28 resize-none text-sm"
                                    placeholder="Ex: Pas d'oignon, sauce à part..."
                                />
                            </div>
                        </div>

                        {/* Sticky Bottom Action Bar with Gradient Fade */}
                        <div className="absolute bottom-0 left-0 right-0 z-50">
                            {/* Gradient Fade Overlay */}
                            <div className="h-12 bg-gradient-to-t from-[#0F172A] to-transparent pointer-events-none" />

                            <div className="bg-[#0F172A] p-4 pt-0 pb-6 border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                                <div className="flex items-end justify-between mb-4 px-2">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total à payer</span>
                                        <span className="text-3xl font-black text-white leading-none mt-1">{formatDh(customizationPrice)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-2xl font-black text-lg text-white shadow-xl shadow-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Ajouter au Panier</span>
                                    <div className="bg-white/20 rounded-full p-1">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DarkSheet>

            {/* Cart & Checkout Sheet - Redesigned: Items First, Then Parameters */}
            <DarkSheet open={isCartOpen} onClose={() => setIsCartOpen(false)} title="Votre Panier">
                <div className="p-5 pb-[200px] flex flex-col h-full min-h-[80vh]">

                    {/* 1. CART ITEMS LIST - NOW FIRST! */}
                    <div className="space-y-4 mb-6">
                        {items.map((item, idx) => {
                            // Find original menu item to get prepTime
                            const menuItem = COMPLETE_MENU.find(m => m.name === item.name);
                            const prepTime = menuItem?.prepTime || "15 min";

                            return (
                                <div key={idx} className="flex gap-4 bg-[#1E293B] p-3 rounded-2xl border border-white/5 relative">
                                    <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden shrink-0">
                                        <img src={item.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white truncate">{item.name}</div>
                                        <p className="text-xs text-gray-400 line-clamp-2 my-1">{item.meta}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-amber-500 font-bold">{formatDh(item.price! * 1)}</div>
                                            <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] text-blue-400 font-bold flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {prepTime}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => removeItem(item.id!)} className="absolute top-3 right-3 text-red-500 opacity-50 hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total Prep Time Warning */}
                    {items.length > 0 && (() => {
                        // Calculate total prep time with improved parsing
                        const totalMinutes = items.reduce((sum, item) => {
                            const menuItem = COMPLETE_MENU.find(m => m.name === item.name);
                            const prepTime = menuItem?.prepTime || "15 min";

                            // Parse time: handle "15 min", "1h", "1h30", "30min", etc.
                            let minutes = 0;

                            // Check for hours (e.g., "1h", "2h")
                            const hourMatch = prepTime.match(/(\d+)\s*h/i);
                            if (hourMatch) {
                                minutes += parseInt(hourMatch[1]) * 60;
                            }

                            // Check for minutes (e.g., "30 min", "15min")
                            const minMatch = prepTime.match(/(\d+)\s*min/i);
                            if (minMatch) {
                                minutes += parseInt(minMatch[1]);
                            }

                            // If no match found, default to 15 min
                            if (minutes === 0) {
                                minutes = 15;
                            }

                            return sum + minutes;
                        }, 0);

                        const hours = Math.floor(totalMinutes / 60);
                        const mins = totalMinutes % 60;
                        const timeDisplay = hours > 0 ? `${hours}h${mins > 0 ? mins : ''}` : `${mins} min`;

                        // Parse customer arrival time
                        const parseArrivalTime = (time: string) => {
                            const hourMatch = time.match(/(\d+)\s*h/i);
                            const minMatch = time.match(/(\d+)\s*min/i);
                            let mins = 0;
                            if (hourMatch) mins += parseInt(hourMatch[1]) * 60;
                            if (minMatch) mins += parseInt(minMatch[1]);
                            return mins || parseInt(time.replace(/\D/g, '')) || 15;
                        };

                        const arrivalMinutes = parseArrivalTime(arrivalTime);
                        const timeDiff = arrivalMinutes - totalMinutes;

                        // Determine status
                        let status: 'good' | 'warning' | 'critical' = 'good';
                        let statusMessage = '';

                        if (timeDiff < 0) {
                            status = 'critical';
                            statusMessage = `⚠️ Votre commande sera prête ${Math.abs(timeDiff)} min après votre arrivée`;
                        } else if (timeDiff < 5) {
                            status = 'warning';
                            statusMessage = '⏱️ Timing serré - Commande prête à votre arrivée';
                        } else {
                            status = 'good';
                            statusMessage = `✅ Commande prête ${timeDiff} min avant votre arrivée`;
                        }

                        const bgColor = status === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                            status === 'warning' ? 'bg-orange-500/10 border-orange-500/30' :
                                'bg-green-500/10 border-green-500/30';
                        const textColor = status === 'critical' ? 'text-red-200' :
                            status === 'warning' ? 'text-orange-200' :
                                'text-green-200';
                        const iconColor = status === 'critical' ? 'text-red-400' :
                            status === 'warning' ? 'text-orange-400' :
                                'text-green-400';

                        return (
                            <div className={`mb-6 p-3 rounded-xl border flex items-start gap-2 ${bgColor}`}>
                                <Clock className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
                                <div className="flex-1">
                                    <div className={`text-xs font-bold ${textColor}`}>
                                        Temps de préparation: {timeDisplay}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                        {statusMessage}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* 2. PARAMETERS - NOW SECOND */}
                    {items.length > 0 && (
                        <>
                            {/* Toggle: On The Way vs Dine In */}
                            <div className="grid grid-cols-2 bg-[#1E293B] p-1 rounded-xl mb-6 border border-white/10">
                                <button
                                    onClick={() => setOrderType('takeout')}
                                    className={`py-3 rounded-lg font-bold text-sm flex flex-col items-center gap-1 transition-all ${orderType === 'takeout'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Clock className="w-4 h-4" />
                                    À Emporter
                                </button>
                                <button
                                    onClick={() => setOrderType('dine_in')}
                                    className={`py-3 rounded-lg font-bold text-sm flex flex-col items-center gap-1 transition-all ${orderType === 'dine_in'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <UtensilsCrossed className="w-4 h-4" />
                                    Sur Place
                                </button>
                            </div>

                            {/* Section: Arrival Time OR Table Number */}
                            <div className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-white/10">
                                {orderType === 'takeout' ? (
                                    <>
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" /> Heure d'arrivée
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {arrivalOptions.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setArrivalTime(time)}
                                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${arrivalTime === time
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" /> Numéro de Table
                                        </h3>
                                        <input
                                            type="number"
                                            value={tableNumber}
                                            onChange={(e) => setTableNumber(e.target.value)}
                                            placeholder="Ex: 5"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold text-xl text-center outline-none focus:border-blue-500"
                                        />
                                    </>
                                )}
                            </div>

                            {/* Removed Manual Phone Input - Will use Profile */}
                            <div className="mb-4 px-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <p className="text-xs text-blue-400 text-center">
                                    Votre numéro de téléphone sera récupéré de votre profil.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Blue Confirm Button */}
                    <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A] p-4 border-t border-white/10 z-50 safe-area-bottom">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="text-gray-400 text-lg">Montant Total</span>
                            <span className="text-3xl font-black text-white">{formatDh(total)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting || items.length === 0}
                            className="w-full py-4 bg-[#2563EB] hover:bg-blue-600 rounded-xl font-black text-lg text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? "Traitement..." : <>Confirmer la commande <ChevronRight className="w-5 h-5" /></>}
                        </button>
                    </div>
                </div>
            </DarkSheet>

            {/* Fixed Cart Bar (Mobile) - "Like the others" */}
            {itemCount > 0 && !isCartOpen && !customizeItem && (
                <div className="fixed bottom-[70px] left-0 right-0 z-50 animate-slide-up md:bottom-6 md:right-6 md:left-auto md:w-96">
                    <div className="bg-[#0F172A] border-t border-white/10 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:rounded-2xl md:border md:bg-[#1E293B]">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                    {itemCount}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-wide">Voir Panier</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-lg">{formatDh(total)}</span>
                                <ChevronRight className="w-5 h-5 text-white/50" />
                            </div>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
