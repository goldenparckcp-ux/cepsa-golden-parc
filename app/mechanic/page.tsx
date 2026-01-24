"use client";

import React, { useMemo, useState } from "react";
import { Wrench, Droplets, Snowflake, Search, AlertTriangle, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/state/CartContext";
import { useUI } from "@/lib/state/UIContext";

const THEME = {
    bg: "#0f172a",
    panel: "#1e293b",
    red: "#DC2626",
    gold: "#EAB308",
    gray: "#94A3B8"
};

function classNames(...xs: any[]) {
    return xs.filter(Boolean).join(" ");
}

function priceDh(n: number) {
    return `${n.toFixed(0)} DH`;
}

const HOURS = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
];

export default function MechanicPage() {
    const { addItem } = useCart();
    const { requirePhone } = useUI();

    const services = useMemo(
        () => [
            { id: "vidange", label: "Vidange", icon: Droplets, basePrice: 180, duration: "45-60 min" },
            { id: "freins_pneu", label: "Freins / Pneu", icon: Wrench, basePrice: 120, duration: "30-60 min" },
            { id: "clim", label: "Clim", icon: Snowflake, basePrice: 150, duration: "45-75 min" },
            { id: "diagnostic", label: "Diagnostic", icon: Search, basePrice: 100, duration: "30-45 min" }
        ],
        []
    );

    const [brandModel, setBrandModel] = useState("");
    const [plate, setPlate] = useState("");

    const [selected, setSelected] = useState<string[]>([]);
    const [notes, setNotes] = useState("");

    const [date, setDate] = useState(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    });
    const [time, setTime] = useState<string | null>(null);

    const [urgent, setUrgent] = useState(false);

    const selectedServices = useMemo(() => services.filter((s) => selected.includes(s.id)), [services, selected]);

    const total = useMemo(() => {
        const base = selectedServices.reduce((acc, s) => acc + s.basePrice, 0);
        return base;
    }, [selectedServices]);

    const summary = useMemo(() => {
        const serviceText = selectedServices.length ? selectedServices.map((s) => s.label).join(" · ") : "—";
        const carText = brandModel.trim() ? brandModel.trim() : "—";
        const plateText = plate.trim() ? plate.trim() : "(no plate)";
        const when = date && time ? `${date} · ${time}` : "—";
        return {
            title: "Mécanique · Siyana",
            detail: `${carText} ${plateText} · ${serviceText} · ${when}`
        };
    }, [brandModel, plate, selectedServices, date, time]);

    const canBook = !urgent && brandModel.trim() && selectedServices.length > 0 && date && time;

    return (
        <div className="grid gap-6 pb-20" style={{ color: "#fff" }}>
            <div className="rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #111827 100%)",
                }}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative flex items-center gap-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg animate-pulse-slow"
                        style={{
                            background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                            boxShadow: "0 4px 20px rgba(220, 38, 38, 0.3)"
                        }}>
                        <Wrench className="h-8 w-8" />
                    </span>
                    <div className="min-w-0">
                        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                            Mécanique (Siyana)
                        </div>
                        <div className="mt-2 text-base font-medium" style={{ color: THEME.gray }}>
                            Appointment-based · Smart urgency handling
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm shadow-xl"
                style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-6 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                    <div className="text-lg font-extrabold text-white">1) Car Details</div>
                    <div className="h-1 w-6 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="group">
                        <div className="text-xs font-bold mb-2 ml-1" style={{ color: THEME.gray }}>Marque & Modèle</div>
                        <input
                            value={brandModel}
                            onChange={(e) => setBrandModel(e.target.value)}
                            placeholder="Ex: Golf 7"
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                    </div>
                    <div className="group">
                        <div className="text-xs font-bold mb-2 ml-1" style={{ color: THEME.gray }}>Matricule (optionnel)</div>
                        <input
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            placeholder="Ex: 12345-A-6"
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm shadow-xl"
                style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-6 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                    <div className="text-lg font-extrabold text-white">2) Service Selection</div>
                    <div className="h-1 w-6 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((s) => {
                        const Icon = s.icon;
                        const active = selected.includes(s.id);
                        return (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                    setSelected((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]));
                                }}
                                className={classNames(
                                    "relative rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02]",
                                    active ? "border-white/30 shadow-lg scale-[1.02]" : "border-white/10 hover:border-white/20"
                                )}
                                style={{
                                    background: active
                                        ? "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)"
                                        : "rgba(255,255,255,0.03)",
                                    boxShadow: active ? "0 4px 15px rgba(234,179,8,0.15)" : "none"
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <span className={classNames(
                                        "inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                                        active ? "bg-red-500 text-white" : "bg-white/10 text-white/70"
                                    )}>
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-extrabold text-white">{s.label}</div>
                                        <div className="mt-1 flex items-center justify-between text-xs font-medium" style={{ color: THEME.gray }}>
                                            <span>{s.duration}</span>
                                            <span className="font-extrabold text-gold-400" style={{ color: THEME.gold }}>{priceDh(s.basePrice)}</span>
                                        </div>
                                    </div>
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

                <div className="mt-6">
                    <div className="text-xs font-bold mb-2 ml-1" style={{ color: THEME.gray }}>Describe the issue…</div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Ex: Bruit au freinage, vibration, clim ne refroidit pas…"
                        className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/20"
                    />
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm shadow-xl"
                style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
                <div className="flex items-start justify-between gap-3 mb-6">
                    <div className="min-w-0">
                        <div className="text-lg font-extrabold text-white">3) Calendar & Time</div>
                        <div className="mt-1 text-xs font-medium" style={{ color: THEME.gray }}>
                            Choose a day and a specific hour
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setUrgent((v) => !v)}
                        className={classNames(
                            "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition-all duration-200",
                            urgent ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-white/10 hover:border-white/20 text-white/70 hover:text-white hover:bg-white/5"
                        )}
                        aria-pressed={urgent}
                    >
                        <AlertTriangle className="h-4 w-4" /> Panne Urgente?
                    </button>
                </div>

                {urgent ? (
                    <div className="rounded-2xl border border-red-500/30 p-6 bg-red-500/10 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            <div className="text-lg font-extrabold text-white">Urgent Breakdown</div>
                        </div>
                        <div className="text-sm text-white/80 leading-relaxed">
                            For urgent breakdowns, please call the hotline instead of booking.
                        </div>
                        <div className="mt-4 rounded-xl bg-black/40 px-6 py-4 text-center text-lg font-extrabold text-white tracking-wider border border-white/5">
                            Hotline: <span className="text-red-400">06 61 69 01 79</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 animate-fade-in">
                        <div>
                            <div className="text-xs font-bold mb-2 ml-1" style={{ color: THEME.gray }}>Day</div>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-semibold text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-bold mb-2 ml-1" style={{ color: THEME.gray }}>Hour</div>
                            <div className="overflow-auto pb-2 scrollbar-hide">
                                <div className="flex gap-2.5">
                                    {HOURS.map((h) => {
                                        const active = time === h;
                                        return (
                                            <button
                                                key={h}
                                                type="button"
                                                onClick={() => setTime(h)}
                                                className={classNames(
                                                    "whitespace-nowrap rounded-xl border px-5 py-3 text-sm font-extrabold transition-all duration-200",
                                                    active ? "border-white/30 scale-105 shadow-lg" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                                )}
                                                style={active ? { backgroundColor: THEME.red } : { backgroundColor: "rgba(255,255,255,0.03)" }}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" /> {h}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 rounded-3xl border border-white/10 p-6 backdrop-blur-sm"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-1 w-4 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                        <div className="text-sm font-extrabold text-white">Booking Summary</div>
                        <div className="h-1 w-4 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                    </div>
                    <div className="text-lg font-extrabold text-white">{summary.title}</div>
                    <div className="mt-1 text-sm font-medium text-white/60">{summary.detail}</div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <div className="text-sm font-semibold text-white/50">Estimated total</div>
                        <div className="text-xl font-extrabold" style={{ color: THEME.gold }}>{priceDh(total)}</div>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={!canBook}
                    onClick={() => {
                        if (!canBook) return;
                        requirePhone({
                            reason: "reservation",
                            onVerified: () => {
                                addItem({
                                    id: `mechanic-${Date.now()}`,
                                    name: summary.title,
                                    type: "mechanic",
                                    price: total,
                                    quantity: 1,
                                    totalPrice: total,
                                    image: "/image/mechanic.jpg", // Dummy image
                                    meta: summary.detail + (notes.trim() ? ` · Notes: ${notes.trim()}` : "")
                                });
                            }
                        });
                    }}
                    className={classNames(
                        "mt-6 w-full rounded-2xl px-6 py-5 text-base font-extrabold text-white transition-all duration-300",
                        canBook ? "hover:scale-[1.01] hover:shadow-2xl hover:brightness-110" : "opacity-50 cursor-not-allowed grayscale"
                    )}
                    style={{
                        background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                        boxShadow: canBook ? "0 4px 25px rgba(220, 38, 38, 0.4)" : "none"
                    }}
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-6 w-6" /> Verify Phone · Book Appointment
                    </span>
                </button>
            </div>
        </div>
    );
}
