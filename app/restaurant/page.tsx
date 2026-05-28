"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Plus, UtensilsCrossed, ChevronRight, Trash2, Clock, Check, Car, MapPin, Navigation, ShoppingBag, Filter, AlertTriangle, Camera, X } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/state/CartContext";
import { COMPLETE_MENU, restaurantCategories, MenuItem, MenuOption } from "@/lib/types/menu";
import { DarkSheet } from "@/components/ui/DarkSheet";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/state/LanguageContext";
import { motion, AnimatePresence } from 'framer-motion';

function formatDh(price: number) {
    return `${price.toFixed(2)} DH`;
}

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
    const { t, language } = useTranslation();
    const { items, addItem, removeItem, clear, total, itemCount } = useCart();

    // UI States
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selections, setSelections] = useState<Record<string, unknown>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);

    // Database States
    const [dbItems, setDbItems] = useState<MenuItem[]>(COMPLETE_MENU);
    const [dbCategories, setDbCategories] = useState<{id: string, label: string}[]>(restaurantCategories);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);

    useEffect(() => {
        const loadMenuFromDB = async () => {
            try {
                const { data: cats, error: catErr } = await supabase.from('restaurant_categories').select('*').order('sort_order');
                if (!catErr && cats && cats.length > 0) {
                    setDbCategories([
                        { id: 'all', label: 'Tout' },
                        ...cats.map(c => ({ id: c.id, label: c.label_fr }))
                    ]);
                }

                const { data: items, error: itemErr } = await supabase.from('restaurant_items').select('*');
                if (!itemErr && items && items.length > 0) {
                    const mappedItems: MenuItem[] = items.map(i => ({
                        id: i.id as any,
                        category: i.category_id,
                        name: i.name_fr,
                        description: i.description_fr,
                        basePrice: Number(i.base_price),
                        image: i.image_url,
                        prepTime: i.prep_time,
                        available: i.is_available,
                        badge: i.badge,
                        isFeatured: i.is_featured,
                        customizable: i.customization_json != null,
                        customization: i.customization_json
                    }));
                    setDbItems(mappedItems);
                }
            } catch (err) {
                console.error("No database connection yet, falling back to static menu");
            } finally {
                // Simulate a slight delay for visual smoothness before removing skeleton
                setTimeout(() => setIsLoadingMenu(false), 500);
            }
        };
        loadMenuFromDB();
    }, []);

    // --- "L'Âme du Projet" : Business Logic State ---
    const [locationType, setLocationType] = useState<'on_site' | 'on_way'>('on_site');
    
    // On-Site State
    const [onSiteLocation, setOnSiteLocation] = useState<'table' | 'pool' | 'room'>('table');
    const [locationDetail, setLocationDetail] = useState(""); 
    const [isScanning, setIsScanning] = useState(false);
    
    // On-Way State
    const [arrivalTime, setArrivalTime] = useState<string>("15 min");
    const [showCustomTime, setShowCustomTime] = useState(false);
    const [customHours, setCustomHours] = useState("");
    const [customMinutes, setCustomMinutes] = useState("");

    const arrivalOptions = ["10 min", "15 min", "20 min", "30 min", "45 min", "1 h"];

    const handleCustomTimeApply = () => {
        const h = parseInt(customHours) || 0;
        const m = parseInt(customMinutes) || 0;
        if (h === 0 && m === 0) return;
        const timeStr = h > 0 ? `${h}h${m > 0 ? m : ''}` : `${m} min`;
        setArrivalTime(timeStr);
        setShowCustomTime(false);
    };

    useEffect(() => {
        const reset = async () => {
            if (items.length === 0) {
                setLocationType('on_site');
                setOnSiteLocation('table');
                setLocationDetail('');
                setArrivalTime('15 min');
                setShowCustomTime(false);
                setCustomHours('');
                setCustomMinutes('');
            }
        };
        void reset();
    }, [items.length]);

    const displayItems = useMemo(() => {
        if (activeCategory === "all") return dbItems;
        return dbItems.filter(i => i.category === activeCategory);
    }, [activeCategory, dbItems]);

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
            name_ar: customizeItem.name_ar,
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

        let effectiveArrivalTime = arrivalTime;
        if (locationType === 'on_way' && showCustomTime) {
            const h = parseInt(customHours) || 0;
            const m = parseInt(customMinutes) || 0;
            effectiveArrivalTime = `${h}h${m.toString().padStart(2, '0')}`;
        }

        const deliveryInfo = {
            location_type: locationType,
            arrival_time: locationType === 'on_way' ? effectiveArrivalTime : null,
            on_site_location: locationType === 'on_site' ? onSiteLocation : null,
            location_detail: locationType === 'on_site' ? locationDetail : null,
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
    }, [locationType, arrivalTime, showCustomTime, customHours, customMinutes, onSiteLocation, locationDetail, items, total, clear]);

    const handleCheckout = async () => {
        if (items.length === 0) return;

        if (locationType === 'on_site' && !locationDetail) {
            alert("Veuillez préciser votre emplacement exact (N° de table, N° de pompe, etc.)");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        // Si le client est en route, on exige une connexion (pour la garantie de paiement plus tard)
        if (!user && locationType === 'on_way') {
            localStorage.setItem('pendingRestaurantOrder', 'true');
            router.push('/profile?redirect=/restaurant');
            return;
        }

        if (!user) {
            localStorage.setItem('pendingRestaurantOrder', 'true');
            router.push('/profile?redirect=/restaurant');
            return;
        }

        let profile = null;
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            profile = data;
        }

        await processOrder({ id: user.id, email: user.email }, profile || {});
    };

    return (
        <div className="min-h-screen pb-40 bg-[#070A13]">
            {showSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
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

            {/* Header Categories - Framer Motion sticky */}
            <div className="sticky top-0 z-30 bg-[#070A13]/90 backdrop-blur-xl border-b border-white/5 pt-4 pb-2 px-4 shadow-xl">
                <div className="flex items-center justify-between mb-4 max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20">
                            <UtensilsCrossed className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white leading-none tracking-tight">{t('restaurant.title')}</h1>
                            <p className="text-sm text-gray-400 mt-1">{t('restaurant.subtitle')}</p>
                        </div>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto pb-2 relative z-40">
                    <div className="relative inline-block">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-4 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${showFilters ? 'bg-[#1E293B] border border-white/20 text-white shadow-xl' : 'bg-[#0F172A] border border-white/5 text-gray-300 hover:bg-[#1E293B]'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-orange-500" />
                                <span className="text-sm">
                                    {activeCategory === "all" ? "Tout" : dbCategories.find(c => c.id === activeCategory)?.label || "Tout"}
                                </span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-90 text-orange-500' : 'text-gray-500'}`} />
                        </button>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 top-full mt-2 w-64 bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl overflow-y-auto z-50 flex flex-col py-2 max-h-[60vh] scrollbar-hide"
                                >
                                    {dbCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setActiveCategory(cat.id); setShowFilters(false); }}
                                            className={`w-full text-left px-5 py-3.5 text-base font-bold transition-all ${activeCategory === cat.id ? "bg-red-500/20 text-red-500 border-l-4 border-red-500" : "text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent"}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Animated Grid */}
            <motion.div layout className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto mt-4">
                <AnimatePresence>
                    {isLoadingMenu ? (
                        Array(4).fill(0).map((_, idx) => (
                            <motion.div
                                key={`skeleton-${idx}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-[#111827] border border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col shadow-xl h-64 md:h-72 animate-pulse"
                            >
                                <div className="h-32 md:h-40 bg-white/5 w-full relative">
                                    <div className="absolute bottom-3 left-3 w-16 h-6 bg-white/10 rounded" />
                                    <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10" />
                                </div>
                                <div className="p-3 md:p-4 pt-4 flex-1 space-y-3">
                                    <div className="h-4 bg-white/10 rounded w-3/4" />
                                    <div className="h-3 bg-white/5 rounded w-full" />
                                    <div className="h-3 bg-white/5 rounded w-5/6" />
                                </div>
                            </motion.div>
                        ))
                    ) : displayItems.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20 text-gray-500 font-bold">
                            {t('restaurant.empty')}
                        </motion.div>
                    ) : (
                        displayItems.map((item, idx) => (
                            <motion.button
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="group bg-[#111827] border border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden text-left flex flex-col hover:border-white/20 transition-all shadow-xl hover:shadow-2xl relative"
                        >
                            <div className={`relative overflow-hidden w-full ${item.name.includes("Couscous") ? "h-40" : "h-32 md:h-40"}`}>
                                <Image
                                    src={item.image || "/image/cepsa-hero.jpg"}
                                    alt={item.name}
                                    fill
                                    className={`object-cover transition duration-700 group-hover:scale-110 ${item.name.includes("Couscous") ? "object-bottom" : "object-center"}`}
                                />
                                {item.badge && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-wider z-20">
                                        {item.badge}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent opacity-95" />
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
                                    <div className="text-lg md:text-xl font-black text-white drop-shadow-md">{formatDh(item.basePrice)}</div>
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:bg-red-500 group-hover:text-white transition-colors shrink-0">
                                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 md:p-4 pt-1 flex-1 flex flex-col">
                                <h3 className="text-sm md:text-base font-bold text-white leading-tight mb-1 group-hover:text-red-400 transition-colors line-clamp-2">{language === "ar" ? (item.name_ar || item.name) : item.name}</h3>
                                <p className="text-[11px] md:text-xs text-gray-400 line-clamp-2 leading-relaxed">{language === "ar" ? (item.description_ar || item.description) : item.description}</p>
                            </div>
                        </motion.button>
                    )))}
                </AnimatePresence>
            </motion.div>

            {/* Customization Sheet */}
            <DarkSheet open={!!customizeItem} onClose={() => setCustomizeItem(null)} title={(language === "ar" && customizeItem?.name_ar) ? customizeItem.name_ar : (customizeItem?.name || "Personnaliser")}>
                {customizeItem && (
                    <div className="flex flex-col h-full bg-[#070A13]">
                        <div className="p-6 pb-40 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="rounded-3xl overflow-hidden h-48 w-full relative -mt-4 shadow-2xl">
                                <Image src={customizeItem.image} alt={customizeItem.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-transparent to-transparent" />
                            </div>

                            {customizeItem.customization && Object.entries(customizeItem.customization).map(([key, opt]) => (
                                <div key={key} className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                                        {opt.label}
                                        <div className="h-[1px] bg-white/10 flex-1"></div>
                                    </h3>

                                    <div className="space-y-3">
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
                                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${isSelected
                                                        ? 'bg-red-600/10 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.15)]'
                                                        : 'bg-[#1E293B]/50 border-white/5 hover:bg-[#1E293B] hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                            ? 'bg-red-500 border-red-500 scale-110'
                                                            : 'bg-transparent border-white/20 group-hover:border-white/40'
                                                            }`}>
                                                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
                                                        </div>
                                                        <span className={`font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                            {subOpt.label}
                                                        </span>
                                                    </div>

                                                    {subOpt.price ? (
                                                        <span className={`text-xs font-black px-3 py-1.5 rounded-lg ${isSelected ? 'bg-red-500 text-white shadow-lg' : 'bg-white/5 text-amber-500'}`}>
                                                            +{subOpt.price} DH
                                                        </span>
                                                    ) : null}
                                                </button>
                                            );
                                        })}

                                        {opt.type === 'stepper' && (
                                            <div className="flex items-center justify-between bg-[#1E293B] p-3 pr-4 rounded-2xl border border-white/5">
                                                <div className="px-4 py-2 bg-white/5 rounded-xl text-gray-300 text-sm font-bold">
                                                    Quantité
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <button
                                                        onClick={() => setSelections({ ...selections, [key]: Math.max(opt.min || 0, (selections[key] as number) - 1) })}
                                                        className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white font-black text-xl"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-black text-2xl text-white w-6 text-center">{selections[key] as number}</span>
                                                    <button
                                                        onClick={() => setSelections({ ...selections, [key]: Math.min(opt.max || 10, (selections[key] as number) + 1) })}
                                                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-[0_5px_15px_rgba(220,38,38,0.4)] active:scale-95 transition-all text-white font-black text-xl"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">{t('restaurant.note.title')}</h3>
                                <textarea
                                    value={selections.special_instructions as string || ""}
                                    onChange={e => setSelections({ ...selections, special_instructions: e.target.value })}
                                    className="w-full bg-[#111827] border border-white/10 rounded-2xl p-5 text-white placeholder-gray-600 outline-none focus:border-red-500 transition-all h-32 resize-none text-sm font-medium"
                                    placeholder={t('restaurant.note.placeholder')}
                                />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 z-50">
                            <div className="h-16 bg-gradient-to-t from-[#070A13] to-transparent pointer-events-none" />
                            <div className="bg-[#070A13] p-5 pt-0 pb-8 border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
                                <div className="flex items-end justify-between mb-5 px-2">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total</span>
                                        <span className="text-4xl font-black text-white leading-none mt-1">{formatDh(customizationPrice)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full py-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 rounded-2xl font-black text-xl text-white shadow-[0_10px_25px_rgba(220,38,38,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    <span>{t('restaurant.btn.add')}</span>
                                    <div className="bg-white/20 rounded-full p-1.5">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DarkSheet>

            {/* Cart Sheet - THE HEART OF THE PROJECT LOGIC */}
            <DarkSheet open={isCartOpen} onClose={() => setIsCartOpen(false)} title="Panier & Commande">
                <div className="p-5 pb-[200px] flex flex-col h-full min-h-[80vh] overflow-y-auto custom-scrollbar bg-[#070A13]">

                    {/* 1. Items */}
                    <div className="space-y-4 mb-8">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 bg-[#111827] p-4 rounded-2xl border border-white/5 relative shadow-lg">
                                <div className="w-20 h-20 rounded-xl bg-black/40 overflow-hidden shrink-0 relative">
                                    <Image src={item.image || "/image/cepsa-hero.jpg"} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="font-bold text-white text-lg truncate">{language === "ar" ? (item.name_ar || item.name) : item.name}</div>
                                    <p className="text-xs text-gray-400 line-clamp-1 my-1">{item.meta}</p>
                                    <div className="text-amber-500 font-black text-lg mt-1">{formatDh(item.price! * 1)}</div>
                                </div>
                                <button onClick={() => removeItem(item.id!)} className="absolute top-4 right-4 text-red-500 opacity-60 hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 2. Business Logic: Sur Place vs En Route */}
                    {items.length > 0 && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-white font-black text-xl mb-4 flex items-center gap-3">
                                {t('cart.where')}
                            </h3>
                            
                            {/* Toggle Location Type */}
                            <div className="flex bg-[#1E293B] p-1.5 rounded-2xl mb-6 border border-white/5 shadow-inner">
                                <button
                                    onClick={() => setLocationType('on_site')}
                                    className={`flex-1 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${locationType === 'on_site'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_5px_15px_rgba(37,99,235,0.4)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <MapPin className="w-5 h-5" />
                                    {t('cart.onsite')}
                                </button>
                                <button
                                    onClick={() => setLocationType('on_way')}
                                    className={`flex-1 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${locationType === 'on_way'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_5px_15px_rgba(245,158,11,0.4)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Navigation className="w-5 h-5" />
                                    {t('cart.onway')}
                                </button>
                            </div>

                            {/* Dynamic Details based on Location Type */}
                            <div className="bg-[#111827] rounded-[2rem] p-6 border border-white/5 shadow-xl">
                                {locationType === 'on_site' ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h4 className="text-gray-400 font-bold text-sm mb-4 uppercase tracking-wider">{t('cart.where_exact')}</h4>
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            {[
                                                { id: 'table', icon: <UtensilsCrossed className="w-4 h-4"/>, label: t('cart.loc.table') },
                                                { id: 'pool', icon: <UtensilsCrossed className="w-4 h-4"/>, label: t('cart.loc.pool') },
                                                { id: 'room', icon: <MapPin className="w-4 h-4"/>, label: t('cart.loc.room') }
                                            ].map(loc => (
                                                <button
                                                    key={loc.id}
                                                    onClick={() => setOnSiteLocation(loc.id as any)}
                                                    className={`py-3 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${onSiteLocation === loc.id
                                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {loc.icon} {loc.label}
                                                </button>
                                            ))}
                                        </div>
                                        {(onSiteLocation === 'table' || onSiteLocation === 'pool') && (
                                            <button 
                                                onClick={() => setIsScanning(true)}
                                                className="w-full text-sm text-blue-400 mb-3 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition-all p-3 rounded-xl border border-blue-500/30 flex items-center justify-center gap-3 font-bold"
                                            >
                                                <Camera className="w-5 h-5"/>
                                                Scanner le QR Code {onSiteLocation === 'table' ? 'sur votre table' : 'à votre place'}
                                            </button>
                                        )}
                                        <input
                                            type="text"
                                            value={locationDetail}
                                            onChange={(e) => setLocationDetail(e.target.value)}
                                            placeholder={
                                                onSiteLocation === 'table' ? "Saisir le N° de Table" : 
                                                onSiteLocation === 'pool' ? "Saisir le N° de Place" : 
                                                "Votre N° de Chambre (Ex: 104)"
                                            }
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-4 text-white font-bold text-lg outline-none focus:border-blue-500 transition-colors text-center"
                                        />
                                        <p className="text-xs text-green-400 mt-4 flex items-center gap-1 font-medium bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                            <Check className="w-4 h-4"/>
                                            {t('cart.onsite_note')}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h4 className="text-gray-400 font-bold text-sm mb-4 uppercase tracking-wider">{t('cart.eta.title')}</h4>
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            {arrivalOptions.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => { setArrivalTime(time); setShowCustomTime(false); }}
                                                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${arrivalTime === time && !showCustomTime
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setShowCustomTime(!showCustomTime)}
                                            className={`w-full py-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${showCustomTime
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                                                : 'bg-[#1E293B] border-white/10 text-gray-300'
                                                }`}
                                        >
                                            <Clock className="w-5 h-5" />
                                            {t('cart.eta.custom')}
                                        </button>

                                        {showCustomTime && (
                                            <div className="mt-4 p-5 bg-[#1E293B] rounded-xl border border-white/5">
                                                <div className="flex items-end gap-3 mb-4">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">{t('cart.eta.hours')}</label>
                                                        <input
                                                            type="number" min="0" max="24" value={customHours} onChange={(e) => setCustomHours(e.target.value)} placeholder="0"
                                                            className="w-full bg-[#0F172A] border-2 border-white/5 rounded-xl p-3 text-white text-center text-2xl font-black outline-none focus:border-amber-500 transition-all"
                                                        />
                                                    </div>
                                                    <div className="text-white font-black text-3xl pb-2 opacity-50">:</div>
                                                    <div className="flex-1">
                                                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">{t('cart.eta.mins')}</label>
                                                        <input
                                                            type="number" min="0" max="59" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} placeholder="0"
                                                            className="w-full bg-[#0F172A] border-2 border-white/5 rounded-xl p-3 text-white text-center text-2xl font-black outline-none focus:border-amber-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <button onClick={handleCustomTimeApply} className="w-full py-3 bg-amber-500 hover:bg-amber-400 rounded-xl text-black font-black text-sm transition-all">
                                                    {t('cart.eta.apply')}
                                                </button>
                                            </div>
                                        )}

                                        <div className="mt-4 space-y-2">
                                            <p className="text-xs text-amber-400 flex items-center gap-2 font-medium bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                                <Navigation className="w-4 h-4 shrink-0"/>
                                                {t('cart.onway_note')}
                                            </p>
                                            <p className="text-xs text-red-400 flex items-start gap-2 font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
                                                {t('cart.cancel_policy')}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom Validation Bar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-[#070A13]/95 backdrop-blur-xl p-4 md:p-6 border-t border-white/10 z-50">
                        {/* Cancellation Policy Checkbox */}
                        <div className="mb-4 px-2">
                            <label className="flex items-start gap-3 cursor-pointer group select-none">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={policyAccepted}
                                        onChange={(e) => setPolicyAccepted(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 border border-white/20 rounded bg-white/5 transition-all duration-300 flex items-center justify-center group-hover:border-amber-500 peer-checked:bg-amber-500 peer-checked:border-amber-500">
                                        {policyAccepted && <Check className="w-3.5 h-3.5 text-black stroke-[4px]" />}
                                    </div>
                                </div>
                                <span className={`text-[10px] sm:text-xs font-semibold leading-relaxed transition-colors duration-300 ${policyAccepted ? 'text-gray-200' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    {t('cart.cancel_checkbox')}
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="text-gray-400 font-bold uppercase tracking-widest">{t('restaurant.cart.total')}</span>
                            <span className="text-3xl font-black text-white">{formatDh(total)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting || items.length === 0 || !policyAccepted}
                            className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${
                                locationType === 'on_site' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/30' : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/30'
                            }`}
                        >
                            {isSubmitting ? "Traitement..." : locationType === 'on_site' ? t('cart.btn.onsite') : t('cart.btn.onway')}
                        </button>
                    </div>
                </div>
            </DarkSheet>

            {/* Scanner Modal Overlay */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center"
                    >
                        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
                            <p className="text-white font-bold text-lg">Scannez le QR Code</p>
                            <button 
                                onClick={() => setIsScanning(false)}
                                className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md"
                            >
                                <X className="w-6 h-6"/>
                            </button>
                        </div>
                        <div className="w-full max-w-sm aspect-square bg-black/50 overflow-hidden rounded-2xl relative border-2 border-blue-500">
                            <Scanner 
                                onScan={(result) => {
                                    if (result && result.length > 0) {
                                        const raw = result[0].rawValue || (result[0] as any).text;
                                        if (raw) {
                                            setLocationDetail(raw);
                                            setIsScanning(false);
                                        }
                                    }
                                }}
                                onError={(error) => console.log(error?.message)}
                            />
                        </div>
                        <p className="text-gray-400 mt-8 text-center px-8 text-sm">
                            {onSiteLocation === 'table' ? 'Visez le QR Code sur votre table' : onSiteLocation === 'pool' ? 'Visez le QR Code à votre place' : onSiteLocation === 'room' ? 'Visez le QR Code dans votre chambre' : 'Visez le QR Code'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button for Cart */}
            {itemCount > 0 && !isCartOpen && !customizeItem && (
                <div className="fixed bottom-[80px] right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="bg-gradient-to-br from-red-600 to-orange-500 rounded-full px-5 py-3 shadow-[0_8px_20px_rgba(220,38,38,0.4)] active:scale-95 transition-all flex items-center gap-3 border border-white/20"
                    >
                        <div className="relative">
                            <ShoppingBag className="w-5 h-5 text-white" />
                            <div className="absolute -top-1.5 -right-1.5 bg-white text-red-600 w-4 h-4 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm">
                                {itemCount}
                            </div>
                        </div>
                        <span className="font-black text-sm text-white">{formatDh(total)}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
