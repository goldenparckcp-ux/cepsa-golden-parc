"use client";

import React, { useMemo, useState } from "react";
import { Droplets, Car, Clock, CheckCircle2, Sparkles, Star, Loader2 } from "lucide-react";
import { DarkSheet } from "@/components/ui/DarkSheet";
import { useUI } from "@/lib/state/UIContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const THEME = {
    bg: "#0f172a",
    panel: "#1e293b",
    red: "#DC2626",
    gold: "#EAB308",
    gray: "#94A3B8",
    accent: "#f59e0b"
};

function classNames(...xs: any[]) {
    return xs.filter(Boolean).join(" ");
}

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function minutesToTime(m: number) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${pad2(h)}:${pad2(mm)}`;
}

function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map((x) => parseInt(x, 10));
    return h * 60 + m;
}

function buildSlots({ start = "10:00", end = "19:00", intervalMin = 30 }) {
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);
    const out = [];
    for (let m = s; m <= e; m += intervalMin) out.push(minutesToTime(m));
    return out;
}

function nextSlot(time: string, intervalMin: number) {
    return minutesToTime(timeToMinutes(time) + intervalMin);
}

function priceDh(n: number) {
    return `${n.toFixed(0)} DH`;
}

export default function WashPage() {
    const router = useRouter();
    const { requirePhone } = useUI();
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const vehicleTypes = useMemo(
        () => [
            { id: "city", label: "Citadine", icon: "🚗", extra: 0 },
            { id: "suv", label: "SUV/4x4", icon: "🚙", extra: 20 },
            { id: "van", label: "Van", icon: "🚐", extra: 50 }
        ],
        []
    );

    const washTypes = useMemo(
        () => [
            { id: "express", name: "Express (Ext)", durationMin: 30, basePrice: 60, items: ["Extérieur", "Séchage"] },
            {
                id: "complete",
                name: "Complet (Int+Ext)",
                durationMin: 60,
                basePrice: 110,
                items: ["Intérieur", "Extérieur", "Aspiration"]
            },
            { id: "steam", name: "Vapeur Royale", durationMin: 60, basePrice: 140, items: ["Vapeur", "Désinfection", "Finition"] }
        ],
        []
    );

    const [vehicleId, setVehicleId] = useState(vehicleTypes[0]?.id || "city");
    const [washId, setWashId] = useState(washTypes[0]?.id || "express");

    const slots = useMemo(() => buildSlots({ start: "09:00", end: "20:00", intervalMin: 30 }), []);
    const bookedSet = useMemo(() => new Set(["10:00", "12:30", "15:00", "16:30"]), []);

    const vehicle = useMemo(() => vehicleTypes.find((v) => v.id === vehicleId) || vehicleTypes[0], [vehicleId, vehicleTypes]);
    const wash = useMemo(() => washTypes.find((w) => w.id === washId) || washTypes[0], [washId, washTypes]);

    const [slot, setSlot] = useState<string | null>(null);

    const requiredSlots = useMemo(() => {
        const count = Math.max(1, Math.ceil((wash?.durationMin || 30) / 30));
        return count;
    }, [wash]);

    const blockingSlots = useMemo(() => {
        if (!slot) return [];
        const out = [slot];
        for (let i = 1; i < requiredSlots; i++) out.push(nextSlot(out[out.length - 1], 30));
        return out;
    }, [slot, requiredSlots]);

    const isSlotStartAvailable = (startTime: string) => {
        if (bookedSet.has(startTime)) return false;
        if (requiredSlots === 1) return true;

        let t = startTime;
        for (let i = 1; i < requiredSlots; i++) {
            t = nextSlot(t, 30);
            if (!slots.includes(t)) return false;
            if (bookedSet.has(t)) return false;
        }
        return true;
    };

    const price = useMemo(() => {
        const base = wash?.basePrice || 0;
        const extra = vehicle?.extra || 0;
        return base + extra;
    }, [wash, vehicle]);

    const summary = useMemo(() => {
        const when = slot ? `${slot}${requiredSlots > 1 ? ` (+${requiredSlots * 30 - 30} min)` : ""}` : "—";
        return {
            title: `Lavage · ${wash?.name || ""}`,
            detail: `${vehicle?.icon || ""} ${vehicle?.label || ""} · ${when}`,
            durationLabel: `${wash?.durationMin || 0} min`
        };
    }, [slot, requiredSlots, wash, vehicle]);

    const handleConfirmBooking = async () => {
        if (!slot) return;
        setLoading(true);

        // 1. Check if user is already logged in
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Not logged in? Trigger Auth/Phone flow
            requirePhone({
                reason: "reservation",
                onVerified: () => handleConfirmBooking() // Retry after successful login
            });
            setLoading(false);
            return;
        }

        // 2. User is logged in - Proceed with Booking
        let customerPhone = user.user_metadata?.phone || user.phone;

        // Try to fetch profile phone if not in metadata
        if (!customerPhone) {
            const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
            customerPhone = profile?.phone;
        }

        const bookingNum = `WASH-${Date.now().toString().slice(-6)}`;
        const today = new Date().toISOString().split('T')[0];

        const { error } = await supabase.from('service_bookings').insert({
            booking_number: bookingNum,
            user_id: user.id,
            customer_phone: customerPhone || null, // Allow null unless strictly required
            service_type: 'lavage',
            service_name: summary.title,
            booking_date: today,
            time_slot: slot,
            total_price: price,
            status: 'pending',
            price: price,
            notes: summary.detail
        });

        if (error) {
            console.error("Booking Error:", error);
            alert(`Erreur lors de la réservation: ${error.message || JSON.stringify(error)}`);
        } else {
            setIsConfirmOpen(false);
            router.push('/profile');
        }
        setLoading(false);
    };

    return (
        <div className="grid gap-6 pb-32" style={{ color: "#fff" }}>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>

            {/* Enhanced Header Section */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl h-[280px]">
                <img
                    src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200"
                    alt="Car Wash Service"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-amber-400 rounded-full opacity-60 animate-pulse"></div>
                    <div className="absolute top-20 right-16 w-3 h-3 bg-red-400 rounded-full opacity-40 animate-pulse animation-delay-1000"></div>
                    <div className="absolute bottom-10 left-20 w-2 h-2 bg-blue-400 rounded-full opacity-50 animate-pulse animation-delay-2000"></div>
                    <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-amber-300 rounded-full opacity-30 animate-pulse animation-delay-3000"></div>
                </div>

                <div className="relative p-8 h-full flex flex-col justify-end">
                    <div className="flex items-center gap-4">
                        <span
                            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-2xl transition-all duration-200 hover:scale-110"
                            style={{
                                background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
                                boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)"
                            }}
                        >
                            <Droplets className="h-7 w-7" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                                <div className="text-3xl font-extrabold text-white text-shadow-lg">Lavage Premium</div>
                                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                            </div>
                            <div className="text-base text-white/90 leading-relaxed font-medium">
                                Smart booking · 30-min slots · Duration auto-blocking
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 animate-fade-in">
                {/* 1) Vehicle Profile */}
                <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm" style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)"
                }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-1 w-6 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                        <div className="text-lg font-extrabold text-white">1) Vehicle Profile</div>
                        <div className="h-1 w-6 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {vehicleTypes.map((v) => {
                            const active = v.id === vehicleId;
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => setVehicleId(v.id)}
                                    className={classNames(
                                        "relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02]",
                                        active ? "border-white/30 shadow-2xl scale-[1.02]" : "border-white/10 hover:border-white/20"
                                    )}
                                    style={{
                                        background: active
                                            ? "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)"
                                            : "rgba(255,255,255,0.03)",
                                        boxShadow: active ? "0 4px 20px rgba(234,179,8,0.3)" : "none"
                                    }}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-4xl">{v.icon}</div>
                                        <div className="text-sm font-extrabold text-white">{v.label}</div>
                                        {v.extra > 0 && (
                                            <div className="text-xs font-bold" style={{ color: THEME.gold }}>
                                                +{priceDh(v.extra)}
                                            </div>
                                        )}
                                        {active && (
                                            <div className="absolute top-2 right-2 animate-scale-in">
                                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2) Wash Type */}
                <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm" style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)"
                }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-1 w-6 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                        <div className="text-lg font-extrabold text-white">2) Wash Type</div>
                        <div className="h-1 w-6 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        {washTypes.map((w) => {
                            const active = w.id === washId;
                            return (
                                <button
                                    key={w.id}
                                    type="button"
                                    onClick={() => {
                                        setWashId(w.id);
                                        setSlot(null);
                                    }}
                                    className={classNames(
                                        "relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 hover:scale-[1.02]",
                                        active ? "border-white/30 shadow-2xl scale-[1.02]" : "border-white/10 hover:border-white/20"
                                    )}
                                    style={{
                                        background: active
                                            ? "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)"
                                            : "rgba(255,255,255,0.03)",
                                        boxShadow: active ? "0 4px 20px rgba(234,179,8,0.3)" : "none"
                                    }}
                                >
                                    <div className="text-sm font-extrabold text-white">{w.name}</div>
                                    <div className="mt-1 flex items-center justify-between text-xs text-white/70">
                                        <span className="flex items-center gap-1 font-semibold">
                                            <Clock className="h-3 w-3" />
                                            {w.durationMin} min
                                        </span>
                                        <span className="font-extrabold" style={{ color: THEME.gold }}>{priceDh(w.basePrice)}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-white/60 font-medium">
                                        {w.items.join(" · ")}
                                    </div>
                                    {active && (
                                        <div className="absolute top-2 right-2 animate-scale-in">
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3) Smart Time Slots */}
                <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm" style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)"
                }}>
                    <div className="flex items-start gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                                <div className="text-lg font-extrabold text-white">3) Smart Time Slots</div>
                                <div className="h-1 w-6 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                            </div>
                            <div className="mt-2 text-sm text-white/80 leading-relaxed font-medium">
                                30-min intervals · Selecting a 1h wash blocks the next slot automatically
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold border border-white/20" style={{
                            background: "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)",
                            color: THEME.gold,
                            boxShadow: "0 4px 15px rgba(234,179,8,0.3)"
                        }}>
                            <Car className="h-4 w-4" /> {wash?.durationMin || 0} min
                        </div>
                    </div>

                    <div className="mt-6 overflow-auto pb-1">
                        <div className="flex gap-3 flex-wrap">
                            {slots.map((t) => {
                                const available = isSlotStartAvailable(t);
                                const isSelected = slot === t;
                                const isBooked = bookedSet.has(t);
                                const isBlocked = slot ? blockingSlots.includes(t) && t !== slot : false;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        disabled={!available}
                                        onClick={() => setSlot(t)}
                                        className={classNames(
                                            "whitespace-nowrap rounded-2xl border px-4 py-3 text-xs font-extrabold transition-all duration-200 hover:scale-105",
                                            isSelected ? "border-white/30 shadow-2xl scale-110" : "border-white/10",
                                            available ? "hover:border-white/30" : "cursor-not-allowed opacity-50"
                                        )}
                                        style={{
                                            background: isSelected
                                                ? "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
                                                : isBlocked
                                                    ? "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)"
                                                    : isBooked
                                                        ? "rgba(255,255,255,0.04)"
                                                        : "rgba(255,255,255,0.03)",
                                            boxShadow: isSelected ? "0 4px 20px rgba(220, 38, 38, 0.4)" : "none"
                                        }}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Replaces "Verify Phone & Book Slot" with "Open Sheet" */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a]/95 backdrop-blur-md border-t border-white/10 z-40 safe-area-bottom">
                <button
                    type="button"
                    disabled={!slot}
                    onClick={() => setIsConfirmOpen(true)}
                    className={classNames(
                        "w-full rounded-2xl px-6 py-4 text-base font-extrabold text-white transition-all duration-200 shadow-xl",
                        slot ? "hover:scale-[1.01] hover:shadow-2xl hover:brightness-110" : "opacity-60 cursor-not-allowed"
                    )}
                    style={{
                        background: slot
                            ? "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
                            : "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
                        boxShadow: slot ? "0 4px 20px rgba(220, 38, 38, 0.4)" : "none"
                    }}
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        {slot ? (
                            <>Réserver à <span className="text-amber-300">{slot}</span> · {priceDh(price)}</>
                        ) : 'Sélectionnez un créneau'}
                    </span>
                </button>
            </div>

            {/* Confirmation Sheet */}
            <DarkSheet open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirmer la réservation">
                <div className="p-6 flex flex-col h-full overflow-y-auto pb-40">
                    <div className="flex-1 space-y-6">
                        {/* Summary Card */}
                        <div className="bg-[#1E293B] p-5 rounded-2xl border border-white/10">
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Récapitulatif</h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Service</span>
                                    <span className="font-bold text-white text-right">{wash?.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Véhicule</span>
                                    <span className="font-bold text-white text-right">{vehicle?.label}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Date</span>
                                    <span className="font-bold text-white text-right">Aujourd'hui</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Horaire</span>
                                    <span className="font-bold text-amber-500 text-lg">{slot}</span>
                                </div>

                                <div className="bg-white/5 p-3 rounded-xl mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 font-bold">Total à payer</span>
                                        <span className="font-black text-2xl text-green-400">{priceDh(price)}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1 text-right">Paiement sur place</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-200 leading-relaxed">
                                En confirmant, votre créneau sera réservé instantanément. Vous recevrez une notification de confirmation.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handleConfirmBooking}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-xl font-black text-white text-lg shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Confirmer la Réservation"}
                        </button>
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="w-full mt-3 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </DarkSheet>
        </div>
    );
}
