"use client";

import React, { useMemo, useState } from "react";
import { Droplets, Car, Clock, CheckCircle2, Sparkles, Star } from "lucide-react";
import { useCart } from "@/lib/state/CartContext";
import { useUI } from "@/lib/state/UIContext";

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
    const { addItem } = useCart();
    const { requirePhone } = useUI();

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

    return (
        <div className="grid gap-6 pb-20" style={{ color: "#fff" }}>
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

                {/* Animated particles */}
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
                                Smart booking · 30-min slots · Duration auto-blocking · Eco-friendly products
                            </div>
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 text-xs font-extrabold text-white border border-green-400/30">
                                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                                    Professional Service
                                </span>
                                <span className="inline-flex items-center rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 px-3 py-1 text-xs font-extrabold text-white border border-amber-400/30">
                                    <Star className="h-3.5 w-3.5 mr-1" />
                                    Quality Guaranteed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 animate-fade-in">
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
                                        active
                                            ? "border-white/30 shadow-2xl scale-[1.02]"
                                            : "border-white/10 hover:border-white/20"
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
                                        active
                                            ? "border-white/30 shadow-2xl scale-[1.02]"
                                            : "border-white/10 hover:border-white/20"
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

                    <div className="mt-6 rounded-3xl border border-white/10 p-5 backdrop-blur-sm" style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                        boxShadow: "0 4px 15px rgba(255,255,255,0.1)"
                    }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-1 w-4 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                            <div className="text-sm font-extrabold text-white">Booking Summary</div>
                            <div className="h-1 w-4 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                        </div>
                        <div className="text-sm font-extrabold text-white">{summary.title}</div>
                        <div className="mt-2 text-xs text-white/70 font-medium">{summary.detail}</div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs text-white/60 font-semibold">Estimated Price</div>
                            <div className="text-lg font-extrabold" style={{
                                background: "linear-gradient(135deg, #EAB308 0%, #F59E0B 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}>
                                {priceDh(price)}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={!slot}
                        onClick={() => {
                            if (!slot) return;
                            requirePhone({
                                reason: "reservation",
                                onVerified: () => {
                                    addItem({
                                        id: `wash-${Date.now()}`, // Added an ID
                                        price: price, // Added price
                                        quantity: 1, // Added quantity
                                        type: "wash", // extra field
                                        name: summary.title,
                                        detail: summary.detail, // extra field
                                        prepTime: `⏱️ ${summary.durationLabel}`, // extra field, mapped to CartItem interface?
                                        totalPrice: price,
                                        image: "/image/cepsa-station.jpg", // Added dummy image
                                        meta: summary.detail // mapped to meta
                                    });
                                }
                            });
                        }}
                        className={classNames(
                            "mt-6 w-full rounded-2xl px-6 py-4 text-sm font-extrabold text-white transition-all duration-200",
                            slot ? "hover:scale-[1.02] hover:shadow-3xl hover:brightness-110" : "opacity-60 cursor-not-allowed"
                        )}
                        style={{
                            background: slot
                                ? "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
                                : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                            boxShadow: slot ? "0 4px 20px rgba(220, 38, 38, 0.4)" : "none"
                        }}
                    >
                        <span className="inline-flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5" /> Verify Phone · Book Slot
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
