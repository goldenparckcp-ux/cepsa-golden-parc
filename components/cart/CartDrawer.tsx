"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/state/CartContext";
import { useUI } from "@/lib/state/UIContext";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle, Loader2, Utensils, Car, Clock, MapPin, CreditCard, Banknote, Lock } from "lucide-react";
import { createOrder } from "@/lib/supabase";

export function CartDrawer() {
    const { items, total, addItem, removeItem, setQuantity, clear } = useCart();
    const { isCartOpen, closeCart, requirePhone } = useUI();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

    // New Order Details State
    const [serviceType, setServiceType] = useState<'dine_in' | 'pre_order'>('pre_order');
    const [tableNumber, setTableNumber] = useState('');
    const [arrivalTime, setArrivalTime] = useState('15 min');
    const [customTimeMode, setCustomTimeMode] = useState(false);

    // Deposit Mode (Arboune)
    const [isDepositMode, setIsDepositMode] = useState(false);

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        // Validation
        if (serviceType === 'dine_in' && !tableNumber) {
            alert("Please enter your table number");
            return;
        }

        // 1. Require Phone Verification First
        requirePhone({
            reason: "checkout",
            onVerified: async (phone) => {
                await submitOrder(phone);
            }
        });
    };

    const submitOrder = async (phone: string) => {
        setIsSubmitting(true);
        try {
            await createOrder({
                customer_phone: phone,
                total: total,
                items: items,
                status: "pending",
                notes: isDepositMode ? `MODE ARBOUNE: Acompte ${(total * 0.3).toFixed(0)} DH payé. Reste ${(total * 0.7).toFixed(0)} DH à régler sur place.` : "",
                service_type: serviceType,
                table_number: serviceType === 'dine_in' ? tableNumber : undefined,
                arrival_time: serviceType === 'pre_order' ? arrivalTime : undefined
            });

            setSuccess(true);
            setTimeout(() => {
                clear();
                setSuccess(false);
                closeCart();
            }, 3000);
        } catch (error) {
            console.error("Order failed:", error);
            alert("Order failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-500 font-medium mb-4">Kitchen has received your order.</p>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm">
                        <p className="font-bold text-gray-900">
                            {serviceType === 'dine_in' ? `Table #${tableNumber}` : `Arrival: ${arrivalTime}`}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const PRESET_TIMES = ['10 min', '15 min', '20 min', '30 min', '45 min', '1 h'];

    return (
        <div className="fixed inset-0 z-[90] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-[#0F172A] h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-white/10">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1E293B]">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500/20 p-2 rounded-xl text-red-400">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Your Cart</h2>
                            <p className="text-xs text-gray-400">{items.length} items</p>
                        </div>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"
                        aria-label="Close cart"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10">

                    {/* Cart Items List */}
                    <div className="space-y-4 mb-8">
                        {items.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <ShoppingBag className="w-16 h-16 mb-4 text-gray-600" />
                                <p className="text-xl font-bold text-gray-400">Your cart is empty</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="bg-[#1E293B] p-4 rounded-2xl flex gap-4 border border-white/5 animate-fade-in">
                                    {item.image && (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-white truncate pr-2">{item.name}</h3>
                                            <span className="font-bold text-red-400 shrink-0">
                                                {(item.totalPrice * (item.quantity || 1)).toFixed(0)} DH
                                            </span>
                                        </div>

                                        {/* Customizations display */}
                                        <div className="text-xs text-gray-400 mb-3 space-y-0.5">
                                            {/* If we have meta string from ProductCustomizer, use it. Or iterate customizations */}
                                            {item.meta && item.meta.split(' · ').map((m: string, i: number) => (
                                                <div key={i}>• {m}</div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-3 bg-[#0F172A] rounded-lg p-1 border border-white/5">
                                                <button
                                                    onClick={() => setQuantity(item.id || "", (item.quantity || 1) - 1)}
                                                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-md text-white transition"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-sm font-bold text-white w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(item.id || "", (item.quantity || 1) + 1)}
                                                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-md text-white transition"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id || "")}
                                                className="text-red-400 hover:text-red-300 p-2 transition"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Details Form */}
                    {items.length > 0 && (
                        <div className="space-y-6 border-t border-white/10 pt-6">

                            {/* Logic to check if we need Food Options */}
                            {(() => {
                                const hasFood = items.some(i => {
                                    // Normalize string to handle accents (Mécanique -> mecanique)
                                    const n = i.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                    return !(
                                        n.includes('lavage') ||
                                        n.includes('wash') ||
                                        n.includes('hotel') ||
                                        n.includes('chambre') ||
                                        n.includes('room') ||
                                        n.includes('mecanique') ||
                                        n.includes('vapeur') ||
                                        n.includes('vidange') ||
                                        n.includes('pool') ||
                                        n.includes('piscine')
                                    );
                                });

                                if (!hasFood) return null;

                                return (
                                    <>
                                        {/* Service Type Toggle */}
                                        <div className="grid grid-cols-2 gap-3 p-1 bg-[#1E293B] rounded-xl border border-white/5">
                                            <button
                                                onClick={() => setServiceType('pre_order')}
                                                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-lg transition-all ${serviceType === 'pre_order'
                                                    ? 'bg-red-600 text-white shadow-lg'
                                                    : 'text-gray-400 hover:bg-white/5'
                                                    }`}
                                            >
                                                <Car className="w-5 h-5" />
                                                <span className="text-xs font-bold">On The Way</span>
                                            </button>
                                            <button
                                                onClick={() => setServiceType('dine_in')}
                                                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-lg transition-all ${serviceType === 'dine_in'
                                                    ? 'bg-orange-500 text-white shadow-lg'
                                                    : 'text-gray-400 hover:bg-white/5'
                                                    }`}
                                            >
                                                <Utensils className="w-5 h-5" />
                                                <span className="text-xs font-bold">Dine In</span>
                                            </button>
                                        </div>

                                        {/* Conditional Inputs */}
                                        <div className="animate-fade-in">
                                            {serviceType === 'dine_in' ? (
                                                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/5">
                                                    <label className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" /> Table Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: 5"
                                                        value={tableNumber}
                                                        onChange={(e) => setTableNumber(e.target.value)}
                                                        className="w-full bg-[#0F172A] border border-white/10 text-white rounded-lg px-4 py-3 focus:border-orange-500 outline-none font-bold text-center text-lg"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/5">
                                                    <label className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-2">
                                                        <Clock className="w-4 h-4" /> Arrival Time
                                                    </label>

                                                    {!customTimeMode ? (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {PRESET_TIMES.map(time => (
                                                                <button
                                                                    key={time}
                                                                    onClick={() => setArrivalTime(time)}
                                                                    className={`py-2 rounded-lg text-sm font-bold border transition ${arrivalTime === time
                                                                        ? 'bg-red-600 border-red-500 text-white'
                                                                        : 'bg-[#0F172A] border-white/10 text-gray-400 hover:border-white/30'
                                                                        }`}
                                                                >
                                                                    {time}
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={() => { setCustomTimeMode(true); setArrivalTime(""); }}
                                                                className="col-span-3 py-2 rounded-lg text-xs font-bold border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition"
                                                            >
                                                                Other Time...
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Ex: 4 hours, 18:30..."
                                                                value={arrivalTime}
                                                                onChange={(e) => setArrivalTime(e.target.value)}
                                                                className="w-full bg-[#0F172A] border border-white/10 text-white rounded-lg px-4 py-3 focus:border-red-500 outline-none font-bold"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => setCustomTimeMode(false)}
                                                                className="px-4 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                                                                aria-label="Cancel custom time"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}

                        </div>
                    )}

                    {/* --- PAYMENT METHOD SELECTOR --- */}
                    {items.length > 0 && (
                        <div className="px-6 pb-6 animate-fade-in border-t border-white/5 pt-6">

                            {/* ARBOUNE (DEPOSIT) TOGGLE */}
                            <div className="mb-6 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-4 rounded-xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                <div className="flex items-center justify-between mb-2 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-amber-500/20 p-1.5 rounded-lg text-amber-500">
                                            <Banknote className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-white">Mode Arboune (30%)</span>
                                    </div>

                                    {/* IOS Style Toggle */}
                                    <button
                                        onClick={() => setIsDepositMode(!isDepositMode)}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${isDepositMode ? 'bg-amber-500' : 'bg-gray-700'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${isDepositMode ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed relative z-10">
                                    Payez <span className="text-amber-500 font-bold">30% maintenant</span> pour confirmer, et le reste sur place. Idéal pour les grosses commandes.
                                </p>
                            </div>

                            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Mode de Paiement</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Cash Option */}
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`relative p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash'
                                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                        : 'bg-[#0F172A] border-white/10 text-gray-500 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="bg-emerald-500/20 p-2 rounded-full">
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold">Sur Place</span>
                                    {paymentMethod === 'cash' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    )}
                                </button>

                                {/* Card Option (YouCan Pay Style) */}
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`relative p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card'
                                        ? 'bg-red-600/10 border-red-500 text-red-400'
                                        : 'bg-[#0F172A] border-white/10 text-gray-500 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="bg-red-500/20 p-2 rounded-full">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold">Carte Bancaire</span>
                                    {paymentMethod === 'card' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    )}
                                </button>
                            </div>

                            {/* Trust Badges */}
                            {paymentMethod === 'card' && (
                                <div className="mt-4 p-3 bg-red-500/5 rounded-lg border border-red-500/10 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[10px] text-gray-400 mb-2">Paiement sécurisé via <b>YouCan Pay</b> (CMI)</p>
                                    <div className="flex items-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all">
                                        {/* Mock Logos */}
                                        <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                                        <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white">MasterCard</div>
                                        <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white">CMI</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* ------------------------------- */}

                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 bg-[#1E293B] border-t border-white/10 safe-area-bottom">
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Total Commande</span>
                                <span className="text-xl font-bold text-white">{total.toFixed(0)} <span className="text-sm text-gray-500">DH</span></span>
                            </div>

                            {isDepositMode && (
                                <>
                                    <div className="flex justify-between items-center text-amber-500">
                                        <span className="text-sm font-bold flex items-center gap-1">✨ Acompte (30%)</span>
                                        <span className="text-xl font-black">{(total * 0.3).toFixed(0)} DH</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-500 text-sm">
                                        <span>Reste à payer sur place (70%)</span>
                                        <span>{(total * 0.7).toFixed(0)} DH</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className={`w-full text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 transition shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group ${isDepositMode
                                ? 'bg-gradient-to-r from-amber-500 to-amber-700 shadow-amber-500/20'
                                : (paymentMethod === 'card'
                                    ? 'bg-gradient-to-r from-red-600 to-red-800 shadow-red-500/20' // Card
                                    : 'bg-gradient-to-r from-red-600 to-red-700 shadow-red-500/20') // Cash
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {paymentMethod === 'card'
                                        ? `Payer ${isDepositMode ? (total * 0.3).toFixed(0) : total.toFixed(0)} DH`
                                        : 'Confirmer la commande'}
                                    {paymentMethod === 'card' ? <Lock className="w-5 h-5" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 3px; }
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
