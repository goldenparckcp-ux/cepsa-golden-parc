"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Plus, UtensilsCrossed, ChevronRight, Trash2, Clock, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/state/CartContext";
import { COMPLETE_MENU, restaurantCategories, MenuItem, MenuOption } from "@/lib/types/menu";
import { DarkSheet } from "@/components/ui/DarkSheet";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/state/LanguageContext";

function formatDh(price: number) {
    return `${price.toFixed(2)} DH`;
}

// ... Initial Selections Helper ...
function initSelections(item: MenuItem): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const cfg = item?.customization || {};
    Object.entries(cfg).forEach(([key, opt]) => {
        if (opt.type === "stepper") out[key] = opt.default ?? opt.min ?? 0;
        if (opt.type === "radio") out[key] = opt.default ?? opt.options?.[0]?.id ?? null;
        if (opt.type === "checkbox") out[key] = [];
        if (opt.type === "checkbox-group") {
            const defaults = (opt.options || []).filter((o: MenuOption) => o.included).map((o: MenuOption) => o.id);
            out[key] = defaults;
        }
    });
    out.special_instructions = "";
    return out;
}

function calcPrice(item: MenuItem, selections: Record<string, unknown>): number {
    let price = item.basePrice;
    const cfg = item.customization || {};

    Object.entries(cfg).forEach(([key, opt]) => {
        const value = selections?.[key];
        if (opt.type === "radio") {
            const selected = opt.options?.find((o: MenuOption) => o.id === value);
            if (typeof selected?.price === "number") price += selected.price;
        }
        if (opt.type === "checkbox" || opt.type === "checkbox-group") {
            const ids = Array.isArray(value) ? value : [];
            ids.forEach((id: string) => {
                const selected = opt.options?.find((o: MenuOption) => o.id === id);
                if (selected && !selected.included && typeof selected.price === "number") price += selected.price;
            });
        }
    });
    return price;
}

export default function RestaurantPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { items, addItem, removeItem, clear, total, itemCount } = useCart();

    // UI States
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selections, setSelections] = useState<Record<string, unknown>>({});

    // Order info
    const [orderType, setOrderType] = useState<'takeout' | 'dine_in'>('takeout');
    const [arrivalTime, setArrivalTime] = useState<string>("15 min");
    const [showCustomTime, setShowCustomTime] = useState(false);
    const [customHours, setCustomHours] = useState("");
    const [customMinutes, setCustomMinutes] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Time Slots
    const arrivalOptions = ["10 min", "15 min", "20 min", "30 min", "45 min", "1 h"];

    // Handle custom time selection
    const handleCustomTimeApply = () => {
        const h = parseInt(customHours) || 0;
        const m = parseInt(customMinutes) || 0;
        if (h === 0 && m === 0) return;
        const timeStr = h > 0 ? `${h}h${m > 0 ? m : ''}` : `${m} min`;
        setArrivalTime(timeStr);
        setShowCustomTime(false);
    };

    // Reset parameters when cart becomes empty
    useEffect(() => {
        const reset = async () => {
            if (items.length === 0) {
                setOrderType('takeout');
                setArrivalTime('15 min');
                setShowCustomTime(false);
                setCustomHours('');
                setCustomMinutes('');
                setTableNumber('');
            }
        };
        void reset();
    }, [items.length]);

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
                const o = opt.options?.find((x: MenuOption) => x.id === v);
                if (o) metaParts.push(`${opt.label}: ${o.label}`);
            }
            if (opt.type === "stepper" && typeof v === "number" && v > 0) metaParts.push(`${opt.label}: ${v} ${opt.unit || ""}`);
            if ((opt.type === "checkbox" || opt.type === "checkbox-group") && Array.isArray(v) && v.length > 0) {
                const labels = v.map((id: string) => opt.options?.find((x: MenuOption) => x.id === id)?.label || id).join(", ");
                metaParts.push(`${opt.label}: ${labels}`);
            }
        });
        if (typeof selections.special_instructions === "string" && selections.special_instructions) metaParts.push(`Note: ${selections.special_instructions}`);

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

    const processOrder = useCallback(async (user: { id: string, email?: string }, profile: { phone?: string, email?: string }) => {
        setIsSubmitting(true);
        const orderNum = `CMD-${Date.now().toString().slice(-6)}`;

        // Determine effective arrival time
        let effectiveArrivalTime = arrivalTime;
        if (orderType === 'takeout' && showCustomTime) {
            const h = parseInt(customHours) || 0;
            const m = parseInt(customMinutes) || 0;
            // Format neatly: 7h08
            effectiveArrivalTime = `${h}h${m.toString().padStart(2, '0')}`;
        }

        // Compile Delivery Info
        const deliveryInfo = {
            type: orderType,
            arrival_time: orderType === 'takeout' ? effectiveArrivalTime : null,
            table_number: orderType === 'dine_in' ? tableNumber : null,
            customer_notes: "",
            user_id: user.id
        };

        const finalItems = [
            ...items,
            { is_meta: true, ...deliveryInfo }
        ];

        const { error } = await supabase.from('restaurant_orders').insert({
            order_number: orderNum,
            user_id: user.id,
            customer_phone: profile?.phone || profile?.email || user.email || null,
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
    }, [arrivalTime, orderType, showCustomTime, customHours, customMinutes, tableNumber, items, total, clear]);

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
        void attemptAutoCheckout();
    }, [processOrder]);

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

        if (!user) {
            // Only redirect if NOT logged in
            localStorage.setItem('pendingRestaurantOrder', 'true');
            router.push('/profile?redirect=/restaurant');
            return;
        }

        // Proceed directly with User ID (Profile might be incomplete, that's okay, we rely on user_id)
        await processOrder({ id: user.id, email: user.email }, profile || {});
    };

    return (
        <div className="min-h-screen pb-40 bg-[#0F172A]">

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">{t('restaurant.success.title')}</h2>
                        <p className="text-gray-400 mb-6">
                            {t('restaurant.success.desc').replace('{id}', showSuccess)}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full py-4 bg-red-600 rounded-xl font-bold text-white shadow-lg hover:bg-red-500 transition-all"
                            >
                                {t('restaurant.btn.track')}
                            </button>
                            <button
                                onClick={() => setShowSuccess(null)}
                                className="w-full py-4 bg-white/5 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-all"
                            >
                                {t('hotel.btn.close')}
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
                            <h1 className="text-xl font-bold text-white leading-none">{t('restaurant.title')}</h1>
                            <p className="text-xs text-gray-400 mt-1">{t('restaurant.subtitle')}</p>
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
                        {t('restaurant.empty')}
                    </div>
                )}
                {displayItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="group bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden text-left flex flex-col hover:border-white/20 transition-all shadow-lg hover:shadow-2xl"
                    >
                        <div className={`relative overflow-hidden w-full ${item.name.includes("Couscous") ? "h-64" : "h-48"}`}>
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className={`object-cover transition duration-700 group-hover:scale-110 ${item.name.includes("Couscous") ? "object-bottom" : "object-center"}`}
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
                                <Image
                                    src={customizeItem.image}
                                    alt={customizeItem.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                            </div>

                            {/* Options List */}
                            {customizeItem.customization && Object.entries(customizeItem.customization).map(([key, opt]) => (
                                <div key={key} className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                        <div className="h-[1px] bg-white/10 flex-1"></div>
                                        {opt.label}
                                        <div className="h-[1px] bg-white/10 flex-1"></div>
                                    </h3>

                                    <div className="space-y-2">
                                        {opt.options?.map((subOpt: MenuOption) => {
                                            const isSelected = Array.isArray(selections[key])
                                                ? selections[key].includes(subOpt.id)
                                                : selections[key] === subOpt.id;

                                            return (
                                                <button
                                                    key={subOpt.id}
                                                    onClick={() => {
                                                        if (opt.type === 'radio') setSelections({ ...selections, [key]: subOpt.id });
                                                        if (opt.type.includes('checkbox')) {
                                                            const current = (selections[key] as string[]) || [];
                                                            const next = current.includes(subOpt.id)
                                                                ? current.filter((x: string) => x !== subOpt.id)
                                                                : [...current, subOpt.id];
                                                            setSelections({ ...selections, [key]: next });
                                                        }
                                                    }}
                                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${isSelected
                                                        ? 'bg-red-600/10 border-red-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                                                        : 'bg-[#1E293B]/50 border-white/5 hover:bg-[#1E293B] hover:border-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {/* Radio/Check Indicator */}
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                            ? 'bg-red-500 border-red-500 scale-110'
                                                            : 'bg-transparent border-white/20 group-hover:border-white/40'
                                                            }`}>
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                                                        </div>
                                                        <span className={`font-medium transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                            {subOpt.label}
                                                        </span>
                                                    </div>

                                                    {subOpt.price ? (
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${isSelected ? 'bg-red-500 text-white' : 'bg-white/5 text-amber-500'}`}>
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
                                                        onClick={() => setSelections({ ...selections, [key]: Math.max(opt.min || 0, (selections[key] as number) - 1) })}
                                                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-black text-xl text-white w-4 text-center">{selections[key] as number}</span>
                                                    <button
                                                        onClick={() => setSelections({ ...selections, [key]: Math.min(opt.max || 10, (selections[key] as number) + 1) })}
                                                        className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-500 active:scale-95 transition-all text-white"
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
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{t('restaurant.note.title')}</h3>
                                <textarea
                                    value={selections.special_instructions as string || ""}
                                    onChange={e => setSelections({ ...selections, special_instructions: e.target.value })}
                                    className="w-full bg-[#1E293B]/50 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 outline-none focus:border-red-500 focus:bg-[#1E293B] transition-all h-28 resize-none text-sm"
                                    placeholder={t('restaurant.note.placeholder')}
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
                                    <span>{t('restaurant.btn.add')}</span>
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
            <DarkSheet open={isCartOpen} onClose={() => setIsCartOpen(false)} title={t('restaurant.cart.title')}>
                <div className="p-5 pb-[200px] flex flex-col h-full min-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* 1. CART ITEMS LIST - NOW FIRST! */}
                    <div className="space-y-4 mb-6">
                        {items.map((item, idx) => {
                            // Find original menu item to get prepTime
                            const menuItem = COMPLETE_MENU.find(m => m.name === item.name);
                            const prepTime = menuItem?.prepTime || "15 min";

                            return (
                                <div key={idx} className="flex gap-4 bg-[#1E293B] p-3 rounded-2xl border border-white/5 relative">
                                    <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden shrink-0 relative">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white truncate">{item.name}</div>
                                        <p className="text-xs text-gray-400 line-clamp-2 my-1">{item.meta}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-amber-500 font-bold">{formatDh(item.price! * 1)}</div>
                                            <div className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[10px] text-red-400 font-bold flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {prepTime}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id!)}
                                        className="absolute top-3 right-3 text-red-500 opacity-50 hover:opacity-100"
                                        aria-label="Supprimer l'article"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>



                    {/* 2. PARAMETERS - NOW SECOND */}
                    {items.length > 0 && (
                        <>
                            {/* Toggle: On The Way vs Dine In */}
                            <div className="grid grid-cols-2 bg-[#1E293B] p-1 rounded-xl mb-6 border border-white/10">
                                <button
                                    onClick={() => setOrderType('takeout')}
                                    className={`py-3 rounded-lg font-bold text-sm flex flex-col items-center gap-1 transition-all ${orderType === 'takeout'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Clock className="w-4 h-4" />
                                    {t('restaurant.cart.takeout')}
                                </button>
                                <button
                                    onClick={() => setOrderType('dine_in')}
                                    className={`py-3 rounded-lg font-bold text-sm flex flex-col items-center gap-1 transition-all ${orderType === 'dine_in'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <UtensilsCrossed className="w-4 h-4" />
                                    {t('restaurant.cart.dinein')}
                                </button>
                            </div>

                            {/* Section: Arrival Time OR Table Number */}
                            <div className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-white/10">
                                {orderType === 'takeout' ? (
                                    <>
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" /> {t('restaurant.cart.time')}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            {arrivalOptions.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => { setArrivalTime(time); setShowCustomTime(false); }}
                                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${arrivalTime === time && !showCustomTime
                                                        ? 'bg-red-600 border-blue-600 text-white'
                                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Time Button */}
                                        <button
                                            onClick={() => setShowCustomTime(!showCustomTime)}
                                            className={`w-full py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${showCustomTime
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white shadow-lg shadow-red-500/20'
                                                : 'bg-[#1E293B] border-white/10 text-gray-300 hover:bg-[#253248] hover:border-white/20'
                                                }`}
                                        >
                                            <Clock className="w-4 h-4" />
                                            {t('restaurant.cart.other_time')}
                                        </button>

                                        {/* Custom Time Input - Responsive */}
                                        {showCustomTime && (
                                            <div className="mt-4 p-4 md:p-5 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex items-end gap-2 md:gap-3 mb-3 md:mb-4">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] md:text-xs font-bold text-gray-400 mb-1 md:mb-2 block uppercase tracking-wider">Heures</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="24"
                                                            value={customHours}
                                                            onChange={(e) => setCustomHours(e.target.value)}
                                                            placeholder="0"
                                                            className="w-full bg-[#0F172A] border-2 border-white/10 rounded-xl p-2 md:p-3 text-white text-center text-xl md:text-2xl font-black outline-none focus:border-red-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                                                        />
                                                    </div>
                                                    <div className="text-white font-black text-2xl md:text-3xl pb-1 md:pb-2 opacity-50">:</div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] md:text-xs font-bold text-gray-400 mb-1 md:mb-2 block uppercase tracking-wider">Minutes</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={customMinutes}
                                                            onChange={(e) => setCustomMinutes(e.target.value)}
                                                            placeholder="0"
                                                            className="w-full bg-[#0F172A] border-2 border-white/10 rounded-xl p-2 md:p-3 text-white text-center text-xl md:text-2xl font-black outline-none focus:border-red-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleCustomTimeApply}
                                                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white font-black text-sm shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Appliquer
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="number"
                                            value={tableNumber}
                                            onChange={(e) => setTableNumber(e.target.value)}
                                            placeholder={t('restaurant.cart.table')}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold text-xl text-center outline-none focus:border-red-500"
                                        />
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {/* Blue Confirm Button - Compact on Mobile */}
                    <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-sm p-3 md:p-4 border-t border-white/10 z-50 safe-area-bottom">
                        <div className="flex justify-between items-center mb-2 md:mb-3 px-1 md:px-2 flex-row-reverse rtl:flex-row">
                            <span className="text-2xl md:text-3xl font-black text-white">{formatDh(total)}</span>
                            <span className="text-gray-400 text-sm md:text-lg">{t('restaurant.cart.total')}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting || items.length === 0}
                            className="w-full py-3 md:py-4 bg-[#2563EB] hover:bg-red-600 rounded-xl font-black text-base md:text-lg text-white shadow-lg shadow-red-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 flex-row-reverse rtl:flex-row"
                        >
                            {isSubmitting ? t('restaurant.cart.processing') : <><ChevronRight className="w-4 h-4 md:w-5 md:h-5 rotate-180 rtl:rotate-0" /> {t('restaurant.cart.confirm')}</>}
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
                            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                    {itemCount}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-wide">{t('restaurant.btn.view')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-lg">{formatDh(total)}</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
