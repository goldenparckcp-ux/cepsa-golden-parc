"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, UtensilsCrossed, ChevronRight, Trash2, Clock, Check, Car, MapPin, Navigation, ShoppingBag, Filter, AlertTriangle, Camera, X, Banknote, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/state/CartContext";
import { COMPLETE_MENU, restaurantCategories, MenuItem, MenuOption } from "@/lib/types/menu";
import { DarkSheet } from "@/components/ui/DarkSheet";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/state/LanguageContext";
import { motion, AnimatePresence } from 'framer-motion';
import PaymentModal from "@/components/PaymentModal";

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

interface RestaurantClientProps {
    initialCategories: { id: string; label: string }[];
    initialItems: MenuItem[];
}

// Memoized menu item card to prevent parent checkout state re-renders from triggering catalog card updates
const MenuItemCard = React.memo(function MenuItemCard({
    item,
    onClick,
    language,
}: {
    item: MenuItem;
    onClick: () => void;
    language: string;
}) {
    const name = language === "ar" ? (item.name_ar || item.name) : item.name;
    const description = language === "ar" ? (item.description_ar || item.description) : item.description;

    return (
        <button
            onClick={onClick}
            type="button"
            className="group bg-[#111827] border border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden text-left flex flex-col hover:border-white/20 transition-all shadow-xl hover:shadow-2xl relative"
        >
            <div className={`relative overflow-hidden w-full ${item.name.includes("Couscous") ? "h-40" : "h-32 md:h-40"}`}>
                {item.image && (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 250px"
                        className={`object-cover transition duration-700 group-hover:scale-110 ${item.name.includes("Couscous") ? "object-bottom" : "object-center"}`}
                    />
                )}
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
                <h3 className="text-sm md:text-base font-bold text-white leading-tight mb-1 group-hover:text-red-400 transition-colors line-clamp-2">{name}</h3>
                <p className="text-[11px] md:text-xs text-gray-400 line-clamp-2 leading-relaxed">{description}</p>
            </div>
        </button>
    );
});
MenuItemCard.displayName = "MenuItemCard";

// Self-contained cart drawer content component to encapsulate typing, scanning, and payment selection states
function CartDrawerContent({
    onClose,
    onSuccess
}: {
    onClose: () => void;
    onSuccess: (orderNum: string) => void;
}) {
    const { t, language } = useTranslation();
    const { items, removeItem, clear, total, setQuantity } = useCart();
    const router = useRouter();

    const [locationType, setLocationType] = useState<'on_site' | 'on_way'>('on_site');
    const [onSiteLocation, setOnSiteLocation] = useState<'table' | 'pool' | 'room'>('table');
    const [locationDetail, setLocationDetail] = useState(""); 
    const [isScanning, setIsScanning] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [arrivalTime, setArrivalTime] = useState<string>("15 min");
    const [showCustomTime, setShowCustomTime] = useState(false);
    const [customHours, setCustomHours] = useState("");
    const [customMinutes, setCustomMinutes] = useState("");
    const [policyAccepted, setPolicyAccepted] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
    const [isDepositMode, setIsDepositMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingPayment, setPendingPayment] = useState<{ id: string; amount: number; num: string; paymentType: 'full_discounted' | 'deposit' | 'full' } | null>(null);

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
        const storedScan = sessionStorage.getItem("scan_location");
        if (storedScan) {
            try {
                const scan = JSON.parse(storedScan);
                if (scan.type === 'restaurant') {
                    setOnSiteLocation('table');
                } else if (scan.type === 'pool') {
                    setOnSiteLocation('pool');
                } else if (scan.type === 'hotel') {
                    setOnSiteLocation('room');
                }
                const labelStr = scan.loc || "";
                const numOnly = labelStr.replace(/\D/g, '');
                setLocationDetail(numOnly || labelStr);
                setLocationType('on_site');
            } catch (e) {
                console.error("Failed to parse scan_location", e);
            }
        }

        const storedPayment = sessionStorage.getItem("scan_payment");
        if (storedPayment === "cash") {
            setPaymentMethod('cash');
        } else if (storedPayment === "online") {
            setPaymentMethod('card');
        }

        if (!storedScan && items.length === 0) {
            setLocationType('on_site');
            setOnSiteLocation('table');
            setLocationDetail('');
            setArrivalTime('15 min');
            setShowCustomTime(false);
            setCustomHours('');
            setCustomMinutes('');
        }
    }, [items.length]);

    useEffect(() => {
        if (locationType === 'on_way' && paymentMethod === 'cash') {
            setPaymentMethod('card');
            setIsDepositMode(true);
        }
    }, [locationType, paymentMethod]);

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

        const requiresPayment = (paymentMethod === 'card' || isDepositMode);
        const depositAmount = Math.min(total, Math.max(20, Math.round(total * 0.3)));
        const paymentAmount = isDepositMode 
            ? depositAmount 
            : (paymentMethod === 'card' ? Math.round(total * 0.90) : total);

        const { data, error } = await supabase.from('restaurant_orders').insert({
            order_number: orderNum,
            user_id: user.id,
            customer_phone: profile?.phone || profile?.email || user.email || null,
            items: finalItems,
            status: requiresPayment ? 'pending_payment' : 'pending',
            subtotal: total,
            total_price: paymentMethod === 'card' && !isDepositMode ? Math.round(total * 0.90) : total,
            deposit_paid: false,
            deposit_amount: isDepositMode ? depositAmount : (paymentMethod === 'card' ? Math.round(total * 0.90) : 0),
            created_at: new Date().toISOString()
        }).select().single();

        if (error || !data) {
            console.error(error);
            alert("Erreur: " + (error?.message || "Impossible de créer la commande"));
            setIsSubmitting(false);
        } else {
            if (requiresPayment) {
                setPendingPayment({
                    id: data.id,
                    amount: paymentAmount,
                    num: orderNum,
                    paymentType: isDepositMode ? 'deposit' : 'full_discounted'
                });
                setIsSubmitting(false);
            } else {
                onSuccess(orderNum);
                clear();
                onClose();
                setIsSubmitting(false);
            }
        }
    }, [locationType, arrivalTime, showCustomTime, customHours, customMinutes, onSiteLocation, locationDetail, items, total, clear, paymentMethod, isDepositMode, onSuccess, onClose]);

    const handleCheckout = async () => {
        if (items.length === 0) return;

        if (locationType === 'on_site' && !locationDetail) {
            alert("Veuillez préciser votre emplacement exact (N° de table, N° de pompe, etc.)");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
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
        <div className="p-5 pb-[200px] flex flex-col h-full min-h-[80vh] overflow-y-auto custom-scrollbar bg-[#070A13]">
            {/* 1. Items */}
            <div className="space-y-4 mb-8">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 bg-[#111827] p-4 rounded-2xl border border-white/5 relative shadow-lg animate-in fade-in">
                        <div className="w-20 h-20 rounded-xl bg-black/40 overflow-hidden shrink-0 relative">
                            {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between pr-6">
                            <div>
                                <div className="font-bold text-white text-base truncate">{language === "ar" ? (item.name_ar || item.name) : item.name}</div>
                                {item.meta && <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.meta}</p>}
                            </div>
                            <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                                <div className="text-amber-500 font-black text-base">
                                    {formatDh(item.price! * (item.quantity || 1))}
                                </div>
                                <div className="flex items-center gap-2 bg-[#1E293B] p-0.5 rounded-lg border border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(item.id!, Math.max(0, (item.quantity || 1) - 1))}
                                        className="w-7 h-7 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white font-black text-sm"
                                    >
                                        -
                                    </button>
                                    <span className="font-black text-sm text-white w-5 text-center">{item.quantity || 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(item.id!, (item.quantity || 1) + 1)}
                                        className="w-7 h-7 rounded bg-red-600 flex items-center justify-center hover:bg-red-500 active:scale-95 transition-all text-white font-black text-sm shadow-md"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => removeItem(item.id!)} className="absolute top-4 right-4 text-red-500 opacity-60 hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
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
                            onClick={() => {
                                setLocationType('on_site');
                                setIsDepositMode(false);
                                setPaymentMethod('cash');
                            }}
                            className={`flex-1 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${locationType === 'on_site'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_5px_15px_rgba(37,99,235,0.4)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <MapPin className="w-5 h-5" />
                            {t('cart.onsite')}
                        </button>
                        <button
                            onClick={() => {
                                setLocationType('on_way');
                                setPaymentMethod('card');
                                setIsDepositMode(true);
                            }}
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
                            <div className="animate-in fade-in duration-300">
                                {locationDetail ? (
                                    <div className="w-full mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between animate-in fade-in">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                    {onSiteLocation === 'table' ? 'Table scannée' : onSiteLocation === 'pool' ? 'Place scannée' : 'Chambre'}
                                                </p>
                                                <p className="text-lg font-black text-white leading-none mt-1">
                                                    {onSiteLocation === 'table' 
                                                        ? (language === 'ar' ? `طاولة رقم ${locationDetail}` : `Table N° ${locationDetail}`) 
                                                        : onSiteLocation === 'pool' 
                                                            ? (locationDetail.toLowerCase().includes('pool') || locationDetail.toLowerCase().includes('pisci')
                                                                ? (language === 'ar' ? 'منطقة المسبح' : 'Espace Piscine')
                                                                : (language === 'ar' ? `مكان رقم ${locationDetail}` : `Place N° ${locationDetail}`))
                                                            : (language === 'ar' ? `غرفة رقم ${locationDetail}` : `Chambre N° ${locationDetail}`)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLocationDetail('');
                                                setShowManualInput(false);
                                            }}
                                            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setIsScanning(true);
                                            }}
                                            className="w-full text-sm text-blue-400 mb-3 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition-all p-4 rounded-xl border border-blue-500/30 flex items-center justify-center gap-3 font-black shadow-[0_4px_15px_rgba(59,130,246,0.15)] animate-in fade-in"
                                        >
                                            <Camera className="w-5 h-5"/>
                                            {language === 'ar' ? 'مسح رمز الاستجابة السريعة (QR)' : 'Scanner le QR Code sur votre table/emplacement'}
                                        </button>

                                        {/* Manual Input Toggle */}
                                        {!showManualInput ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowManualInput(true)}
                                                className="w-full text-[11px] font-bold text-gray-500 hover:text-white transition-colors py-1 text-center"
                                            >
                                                {language === 'ar' ? 'إدخال يدوي' : 'Saisir manuellement'}
                                            </button>
                                        ) : (
                                            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 animate-in fade-in duration-200">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                        {language === 'ar' ? 'إدخال يدوي' : 'Saisir manuellement'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowManualInput(false);
                                                        }}
                                                        className="text-[10px] text-gray-500 hover:text-white font-bold"
                                                    >
                                                        {language === 'ar' ? 'إلغاء' : 'Annuler'}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: 'table', label: language === 'ar' ? 'طاولة' : 'Table' },
                                                        { id: 'pool', label: language === 'ar' ? 'مسبح' : 'Piscine' },
                                                        { id: 'room', label: language === 'ar' ? 'غرفة' : 'Chambre' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setOnSiteLocation(opt.id as any);
                                                                if (opt.id === 'pool') {
                                                                    setLocationDetail('Piscine');
                                                                } else {
                                                                    setLocationDetail('');
                                                                }
                                                            }}
                                                            className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${onSiteLocation === opt.id
                                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                {onSiteLocation !== 'pool' && (
                                                    <input
                                                        type="text"
                                                        value={locationDetail}
                                                        onChange={(e) => setLocationDetail(e.target.value)}
                                                        placeholder={onSiteLocation === 'table' ? (language === 'ar' ? 'رقم الطاولة (مثال: 9)' : 'N° de Table (Ex: 9)') : (language === 'ar' ? 'رقم الغرفة (مثال: 104)' : 'N° de Chambre (Ex: 104)')}
                                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-white font-bold text-sm outline-none focus:border-blue-500 text-center"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <p className="text-xs text-green-400 mt-4 flex items-center gap-1 font-medium bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                    <Check className="w-4 h-4"/>
                                    {t('cart.onsite_note')}
                                </p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                <h4 className="text-gray-400 font-bold text-sm mb-4 uppercase tracking-wider">{t('cart.eta.title')}</h4>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {arrivalOptions.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => { setArrivalTime(time); setShowCustomTime(false); }}
                                            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${arrivalTime === time && !showCustomTime
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-lg'
                                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setShowCustomTime(true)}
                                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${showCustomTime
                                            ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-lg'
                                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        {t('cart.eta.custom')}
                                    </button>
                                </div>

                                {showCustomTime && (
                                    <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/5 space-y-3 mt-4 animate-in slide-in-from-top-2">
                                        <div className="flex items-center gap-3 justify-center">
                                            <input
                                                type="number"
                                                placeholder="HH"
                                                value={customHours}
                                                onChange={e => setCustomHours(e.target.value)}
                                                className="w-16 bg-[#111827] border border-white/10 rounded-xl p-3 text-center text-white font-black text-xl outline-none focus:border-amber-500"
                                            />
                                            <span className="text-white font-black text-xl">:</span>
                                            <input
                                                type="number"
                                                placeholder="MM"
                                                value={customMinutes}
                                                onChange={e => setCustomMinutes(e.target.value)}
                                                className="w-16 bg-[#111827] border border-white/10 rounded-xl p-3 text-center text-white font-black text-xl outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCustomTimeApply}
                                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-sm transition-all"
                                        >
                                            {t('cart.eta.apply')}
                                        </button>
                                    </div>
                                )}

                                <p className="text-xs text-amber-400 mt-4 flex items-center gap-1.5 font-medium bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                    <Clock className="w-4 h-4"/>
                                    {t('cart.eta.desc').replace('{time}', arrivalTime)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Summary & Payment */}
            {items.length > 0 && (
                <div className="mt-8 border-t border-white/5 pt-6 space-y-6 animate-in fade-in duration-500">
                    {/* --- PAYMENT OPTIONS SELECTOR --- */}
                    <div className="space-y-3 px-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {language === 'ar' ? 'طريقة الدفع' : 'Mode de Paiement'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Cash Option */}
                            {locationType === 'on_site' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentMethod('cash');
                                        setIsDepositMode(false);
                                    }}
                                    className={`relative p-3 rounded-2xl border flex flex-col items-start gap-1 transition-all text-left ${
                                        paymentMethod === 'cash' && !isDepositMode
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                            : 'bg-[#1E293B] border-white/5 text-gray-400 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="font-bold text-sm text-white">
                                        {language === 'ar' ? 'نقداً (في المحطة)' : 'Sur Place (Cash)'}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        {language === 'ar' ? 'الدفع في المحطة' : 'Régler à la station'}
                                    </div>
                                    {paymentMethod === 'cash' && !isDepositMode && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    )}
                                </button>
                            )}
                            {/* Arboune Option */}
                            {locationType === 'on_way' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentMethod('card');
                                        setIsDepositMode(true);
                                    }}
                                    className={`relative p-3 rounded-2xl border flex flex-col items-start gap-1 transition-all text-left ${
                                        paymentMethod === 'card' && isDepositMode
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                                            : 'bg-[#1E293B] border-white/5 text-gray-400 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="font-bold text-sm text-white">
                                        {language === 'ar' ? 'عربون (30%)' : 'Arboune (30%)'}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        {language === 'ar' ? 'تسبيق والباقي ف المحطة' : 'Acompte en ligne'}
                                    </div>
                                    {paymentMethod === 'card' && isDepositMode && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                    )}
                                </button>
                            )}

                            {/* Online Option (10% Discount) */}
                            <button
                                type="button"
                                onClick={() => {
                                    setPaymentMethod('card');
                                    setIsDepositMode(false);
                                }}
                                className={`relative p-3 rounded-2xl border flex flex-col items-start gap-1 transition-all text-left ${
                                    paymentMethod === 'card' && !isDepositMode
                                        ? 'bg-red-500/10 border-red-500 text-red-400'
                                        : 'bg-[#1E293B] border-white/5 text-gray-400 hover:bg-white/5'
                                }`}
                            >
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow animate-pulse">
                                    -10%
                                </span>
                                <div className="font-bold text-sm text-white">
                                    {language === 'ar' ? 'دفع إلكتروني كامل' : 'En ligne (-10%)'}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                    {language === 'ar' ? 'تخفيض فوري 10%' : '10% de remise incluse'}
                                </div>
                                {paymentMethod === 'card' && !isDepositMode && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    {(paymentMethod === 'card' || isDepositMode) && (
                        <div className="mt-4 p-3 bg-red-500/5 rounded-lg border border-red-500/10 flex flex-col items-center text-center animate-in fade-in duration-300">
                            <p className="text-[10px] text-gray-400 mb-2">
                                {language === 'ar' ? 'دفع آمن بنسبة 100% عبر PayPal' : 'Paiement 100% sécurisé via PayPal'}
                            </p>
                            <div className="flex items-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all">
                                <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                                <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white">MasterCard</div>
                                <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white">PayPal</div>
                            </div>
                        </div>
                    )}

                    {/* PRICING DETAILS */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-gray-400 text-sm font-bold">{t('cart.subtotal')}</span>
                            <span className="text-white font-bold text-lg">{formatDh(total)}</span>
                        </div>
                        <div className="flex justify-between items-center px-2">
                            <span className="text-gray-400 text-sm font-bold">{t('cart.delivery')}</span>
                            <span className="text-green-500 font-bold text-sm">{language === 'ar' ? 'مجاني' : 'Gratuit'}</span>
                        </div>
                        {paymentMethod === 'card' && !isDepositMode && (
                            <div className="flex justify-between items-center px-2 text-red-400 text-sm font-bold animate-in fade-in">
                                <span>🎁 {language === 'ar' ? 'خصم الدفع الإلكتروني (10%-)' : 'Remise En Ligne (-10%)'}</span>
                                <span>-{formatDh(Math.round(total * 0.10))}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center px-2 pt-2 border-t border-white/5">
                            <span className="text-white font-black text-lg">{t('cart.total')}</span>
                            <span className="text-amber-500 font-black text-2xl">
                                {formatDh(paymentMethod === 'card' && !isDepositMode ? Math.round(total * 0.90) : total)}
                            </span>
                        </div>
                    </div>

                    {/* CHECKBOX AND SUBMIT BUTTON */}
                    <div className="pt-2 space-y-3">
                        <label className="flex items-start gap-3 px-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={policyAccepted}
                                onChange={(e) => setPolicyAccepted(e.target.checked)}
                                className="w-5 h-5 rounded border-white/10 bg-[#1E293B] text-red-500 focus:ring-0 cursor-pointer mt-0.5"
                            />
                            <span className="text-xs text-gray-500 leading-relaxed font-bold">
                                {language === 'ar' ? (
                                    <>
                                        أوافق على الدفع الإلكتروني لتأكيد الطلب وفقًا لـ <Link href="/terms" className="text-red-500 hover:underline">شروط الاستخدام</Link> و <Link href="/privacy" className="text-red-500 hover:underline">سياسة الخصوصية</Link>.
                                    </>
                                ) : (
                                    <>
                                        J&apos;accepte le paiement en ligne sécurisé pour confirmer ma commande selon les <Link href="/terms" className="text-red-500 hover:underline">Conditions d&apos;utilisation</Link> et la <Link href="/privacy" className="text-red-500 hover:underline">Politique de confidentialité</Link>.
                                    </>
                                )}
                            </span>
                        </label>

                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting || !policyAccepted}
                            className={`w-full py-5 rounded-2xl font-black text-xl text-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 shadow-lg ${
                                isDepositMode 
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-700 shadow-amber-500/20' 
                                    : 'bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_10px_25px_rgba(220,38,38,0.3)]'
                            }`}
                        >
                            {isSubmitting ? (
                                <span>{language === 'ar' ? 'جاري الإرسال...' : 'Envoi en cours...'}</span>
                            ) : (
                                <>
                                    <span>
                                        {paymentMethod === 'card' || isDepositMode
                                            ? (language === 'ar' 
                                                ? `دفع ${isDepositMode ? Math.min(total, Math.max(20, Math.round(total * 0.3))).toFixed(0) : Math.round(total * 0.90).toFixed(0)} درهم` 
                                                : `Payer ${isDepositMode ? Math.min(total, Math.max(20, Math.round(total * 0.3))).toFixed(0) : Math.round(total * 0.90).toFixed(0)} DH`)
                                            : t('cart.btn.confirm')}
                                    </span>
                                    <div className="bg-white/20 rounded-full p-1.5">
                                        {paymentMethod === 'card' || isDepositMode ? (
                                            <Lock className="w-5 h-5 text-white" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* QR Scanner Overlay Modal */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col justify-center items-center p-6"
                    >
                        <button 
                            type="button"
                            onClick={() => {
                                setIsScanning(false);
                            }}
                            className="absolute top-6 right-6 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white transition-colors"
                        >
                            <X className="w-6 h-6"/>
                        </button>
                        
                        <div className="w-72 h-72 rounded-3xl overflow-hidden border-4 border-blue-500/50 shadow-2xl relative">
                            <Scanner
                                constraints={{ facingMode: 'environment' }}
                                onScan={(result) => {
                                    console.log("Scanner raw result:", result);
                                    if (result && result.length > 0) {
                                        const text = result[0]?.rawValue;
                                        if (!text) {
                                            console.warn("Scanner returned empty rawValue");
                                            return;
                                        }
                                        
                                        setIsScanning(false);
                                        
                                        try {
                                            if (text.startsWith('http://') || text.startsWith('https://')) {
                                                const url = new URL(text);
                                                const typeParam = url.searchParams.get('type');
                                                const locParam = url.searchParams.get('loc');
                                                const tokenParam = url.searchParams.get('t');
                                                const tableParam = url.searchParams.get('table');
                                                const poolParam = url.searchParams.get('pool');
                                                
                                                if (typeParam && locParam) {
                                                    if (typeParam === 'restaurant' || typeParam === 'table') {
                                                        setOnSiteLocation('table');
                                                    } else if (typeParam === 'pool') {
                                                        setOnSiteLocation('pool');
                                                    } else if (typeParam === 'hotel') {
                                                        setOnSiteLocation('room');
                                                    }
                                                    const numOnly = locParam.replace(/\D/g, '');
                                                    setLocationDetail(numOnly || locParam);
                                                } else if (tableParam) {
                                                    setOnSiteLocation('table');
                                                    setLocationDetail(tableParam);
                                                } else if (poolParam) {
                                                    setOnSiteLocation('pool');
                                                    setLocationDetail(poolParam);
                                                } else {
                                                    const numOnly = text.replace(/\D/g, '');
                                                    setLocationDetail(numOnly || text);
                                                }
                                                
                                                if (tokenParam) {
                                                    supabase
                                                        .from('qr_locations')
                                                        .select('type, label')
                                                        .eq('token', tokenParam)
                                                        .eq('is_active', true)
                                                        .maybeSingle()
                                                        .then(({ data, error }) => {
                                                            if (error) {
                                                                console.error("Supabase scanner verify error:", error);
                                                            }
                                                            if (data) {
                                                                if (data.type === 'restaurant') {
                                                                    setOnSiteLocation('table');
                                                                } else if (data.type === 'pool') {
                                                                    setOnSiteLocation('pool');
                                                                } else if (data.type === 'hotel') {
                                                                    setOnSiteLocation('room');
                                                                }
                                                                const numOnly = data.label.replace(/\D/g, '');
                                                                setLocationDetail(numOnly || data.label);
                                                            }
                                                        })
                                                        .catch(err => {
                                                            console.error("Supabase scanner promise catch:", err);
                                                        });
                                                }
                                            } else {
                                                // Raw string scanned
                                                const cleaned = text.trim();
                                                const numOnly = cleaned.replace(/\D/g, '');
                                                setLocationDetail(numOnly || cleaned);
                                            }
                                        } catch (e) {
                                            console.error("Scanner parsing error:", e);
                                            const cleaned = String(text || '').trim();
                                            if (cleaned) {
                                                const numOnly = cleaned.replace(/\D/g, '');
                                                setLocationDetail(numOnly || cleaned);
                                            }
                                        }
                                    }
                                }}
                                onError={(error) => console.log("Scanner error:", error?.message)}
                            />
                        </div>
                        <p className="text-gray-400 mt-8 text-center px-8 text-sm">
                            {language === 'ar' ? 'قم بتوجيه الكاميرا إلى رمز QR الخاص بمكانك' : 'Visez le QR Code sur votre table ou emplacement'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {pendingPayment && (
                <PaymentModal
                    bookingId={pendingPayment.id}
                    amount={pendingPayment.amount}
                    serviceType="restaurant"
                    tableName="restaurant_orders"
                    paymentType={pendingPayment.paymentType}
                    onSuccess={() => {
                        setPendingPayment(null);
                        clear();
                        onClose();
                        onSuccess(pendingPayment.num);
                    }}
                    onClose={() => setPendingPayment(null)}
                />
            )}
        </div>
    );
}

export default function RestaurantClient({ initialCategories, initialItems }: RestaurantClientProps) {
    const router = useRouter();
    const { t, language } = useTranslation();
    const { addItem, total, itemCount } = useCart();

    // UI States
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selections, setSelections] = useState<Record<string, unknown>>({});
    const [customizeQty, setCustomizeQty] = useState(1);

    // Database States (Pre-loaded from Server)
    const [dbItems, setDbItems] = useState<MenuItem[]>(initialItems);
    const [dbCategories, setDbCategories] = useState<{id: string, label: string}[]>(initialCategories);
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);

    const displayItems = useMemo(() => {
        if (activeCategory === "all") return dbItems;
        return dbItems.filter(i => i.category === activeCategory);
    }, [activeCategory, dbItems]);

    const handleItemClick = useCallback((item: MenuItem) => {
        if (!item.available) return;
        setCustomizeItem(item);
        setSelections(initSelections(item));
        setCustomizeQty(1);
    }, []);

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
            quantity: customizeQty,
            customizations: selections,
            meta: metaParts.join(" · ")
        });
        setCustomizeItem(null);
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

            {/* Optimized Grid */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto mt-4">
                {isLoadingMenu ? (
                    Array(4).fill(0).map((_, idx) => (
                        <div
                            key={`skeleton-${idx}`}
                            className="bg-[#111827] border border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col shadow-xl h-64 md:h-72 animate-pulse"
                        >
                            <div className="h-32 md:h-40 bg-white/5 w-full relative" />
                            <div className="p-3 md:p-4 pt-4 flex-1 space-y-3">
                                <div className="h-4 bg-white/10 rounded w-3/4" />
                                <div className="h-3 bg-white/5 rounded w-full" />
                            </div>
                        </div>
                    ))
                ) : displayItems.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500 font-bold">
                        {t('restaurant.empty')}
                    </div>
                ) : (
                    displayItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onClick={() => handleItemClick(item)}
                            language={language}
                        />
                    ))
                )}
            </div>

            {/* Customization Sheet */}
            <DarkSheet open={!!customizeItem} onClose={() => setCustomizeItem(null)} title={(language === "ar" && customizeItem?.name_ar) ? customizeItem.name_ar : (customizeItem?.name || "Personnaliser")}>
                {customizeItem && (
                    <div className="flex flex-col h-full bg-[#070A13]">
                        <div className="p-6 pb-[250px] space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="rounded-3xl overflow-hidden h-48 w-full relative -mt-4 shadow-2xl">
                                {customizeItem.image && <Image src={customizeItem.image} alt={customizeItem.name} fill className="object-cover" />}
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
                                                    type="button"
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
                                                        type="button"
                                                        onClick={() => setSelections({ ...selections, [key]: Math.max(opt.min || 0, (selections[key] as number) - 1) })}
                                                        className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white font-black text-xl"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-black text-2xl text-white w-6 text-center">{selections[key] as number}</span>
                                                    <button
                                                        type="button"
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
                                {/* Quantity Stepper */}
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <span className="text-gray-400 font-bold text-sm">
                                        {language === "ar" ? "الكمية" : "Quantité"}
                                    </span>
                                    <div className="flex items-center gap-4 bg-[#1E293B] p-1 rounded-xl border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setCustomizeQty(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white font-black text-lg"
                                        >
                                            -
                                        </button>
                                        <span className="font-black text-lg text-white w-6 text-center">{customizeQty}</span>
                                        <button
                                            type="button"
                                            onClick={() => setCustomizeQty(q => q + 1)}
                                            className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center hover:bg-red-500 active:scale-95 transition-all text-white font-black text-lg shadow-md"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mb-5 px-2">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total</span>
                                        <span className="text-4xl font-black text-white leading-none mt-1">{formatDh(customizationPrice * customizeQty)}</span>
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

            {/* Cart Sheet */}
            <DarkSheet open={isCartOpen} onClose={() => setIsCartOpen(false)} title="Panier & Commande">
                <CartDrawerContent 
                    onClose={() => setIsCartOpen(false)} 
                    onSuccess={(orderNum) => setShowSuccess(orderNum)} 
                />
            </DarkSheet>

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
