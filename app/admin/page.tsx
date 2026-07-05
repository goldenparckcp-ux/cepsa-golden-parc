"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    TrendingUp, Users, RefreshCw, Lock, Key, Award, AlertTriangle,
    CheckCircle, Clock, Utensils, Bed, Waves, Wrench, Bot, Sparkles,
    BarChart3, Activity, ArrowUpRight, ArrowDownRight, Zap, Star,
    ChevronRight, Eye, EyeOff, RotateCcw
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMPLETE_MENU } from "@/lib/types/menu";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getLastNDays(n: number) {
    return Array.from({ length: n }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (n - 1 - i));
        return d.toISOString().split("T")[0];
    });
}

function shortDay(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }).replace(".", "");
}

function fmt(n: number) { return n.toLocaleString("fr-FR"); }

// ─────────────────────────────────────────────────────────────────────────────
// Mini Sparkline SVG
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#10B981", height = 36 }: { data: number[]; color?: string; height?: number }) {
    if (data.length < 2) return null;
    const max = Math.max(...data, 1);
    const w = 100, h = height;
    const pts = data.map((v, i) => [
        (i / (data.length - 1)) * w,
        h - 4 - (v / max) * (h - 8)
    ]);
    const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
    const area = [...pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)), `L${pts[pts.length - 1][0]},${h}`, `L${pts[0][0]},${h}`, "Z"].join(" ");
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
            <defs>
                <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#sg-${color.replace("#", "")})`} />
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Line Chart
// ─────────────────────────────────────────────────────────────────────────────
function LineChart({ data, labels, color = "#10B981" }: { data: number[]; labels: string[]; color?: string }) {
    if (data.length < 2) return <div className="flex items-center justify-center h-full text-gray-600 text-xs">Pas assez de données</div>;
    const [hover, setHover] = useState<number | null>(null);
    const w = 600, h = 180, px = 16, py = 16;
    const max = Math.max(...data, 1) * 1.25;
    const pts = data.map((v, i) => [px + (i / (data.length - 1)) * (w - 2 * px), h - py - (v / max) * (h - 2 * py)]);
    const line = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
    const area = [...pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)), `L${pts[pts.length - 1][0]},${h - py}`, `L${pts[0][0]},${h - py}`, "Z"].join(" ");
    return (
        <div className="relative w-full h-full">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" onMouseLeave={() => setHover(null)}>
                <defs>
                    <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f, i) => <line key={i} x1={px} y1={py + f * (h - 2 * py)} x2={w - px} y2={py + f * (h - 2 * py)} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />)}
                <path d={area} fill="url(#lcg)" />
                <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map(([x, y], i) => (
                    <g key={i} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
                        <circle cx={x} cy={y} r="14" fill="transparent" />
                        <circle cx={x} cy={y} r={hover === i ? 5 : 3.5} fill={color} stroke="#1E293B" strokeWidth="2" />
                        {hover === i && (
                            <g>
                                <rect x={x - 38} y={y - 30} width="76" height="22" rx="6" fill="#0F172A" stroke={color} strokeWidth="1" opacity="0.95" />
                                <text x={x} y={y - 15} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{fmt(data[i])} DH</text>
                            </g>
                        )}
                    </g>
                ))}
            </svg>
            <div className="flex justify-between px-4 mt-1">
                {labels.filter((_, i) => {
                    const step = Math.max(1, Math.floor(labels.length / 6));
                    return i % step === 0 || i === labels.length - 1;
                }).map((l, i) => <span key={i} className="text-[9px] text-gray-600 font-bold uppercase">{l}</span>)}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Donut Chart (real %)
// ─────────────────────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { color: string; pct: number; label: string; value: number }[] }) {
    const [hov, setHov] = useState<number | null>(null);
    const r = 15.915, circ = 2 * Math.PI * r;
    let offset = 25;
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 absolute inset-0">
                    <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3.5" />
                    {segments.map((s, i) => {
                        const dash = (s.pct / 100) * circ;
                        const gap = circ - dash;
                        const el = (
                            <circle key={i} cx="18" cy="18" r={r} fill="none" stroke={s.color}
                                strokeWidth={hov === i ? 4.5 : 3.5}
                                strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
                                strokeDashoffset={-(offset / 100) * circ}
                                strokeLinecap="butt"
                                style={{ cursor: "pointer", transition: "stroke-width 0.2s" }}
                                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                            />
                        );
                        offset += s.pct;
                        return el;
                    })}
                </svg>
                <div className="absolute flex flex-col items-center text-center pointer-events-none">
                    {hov !== null ? (
                        <>
                            <span className="text-[10px] font-bold text-gray-400">{segments[hov]?.label}</span>
                            <span className="text-base font-black text-white">{segments[hov]?.pct}%</span>
                            <span className="text-[9px] text-gray-500">{fmt(segments[hov]?.value)} DH</span>
                        </>
                    ) : (
                        <>
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Total</span>
                            <span className="text-sm font-black text-white">{fmt(segments.reduce((a, s) => a + s.value, 0))}</span>
                            <span className="text-[9px] text-gray-500">DH</span>
                        </>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                {segments.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer" onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-gray-400 truncate">{s.label}</span>
                        <span className="text-white ml-auto">{s.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI Insight Card
// ─────────────────────────────────────────────────────────────────────────────
type Insight = { type: string; icon: string; title: string; message: string; priority: string };

function InsightCard({ insight, delay }: { insight: Insight; delay: number }) {
    const typeConfig: Record<string, { border: string; bg: string; badge: string }> = {
        revenue: { border: "border-green-500/30", bg: "bg-green-500/5", badge: "bg-green-500/20 text-green-400" },
        opportunity: { border: "border-blue-500/30", bg: "bg-blue-500/5", badge: "bg-blue-500/20 text-blue-400" },
        attention: { border: "border-amber-500/30", bg: "bg-amber-500/5", badge: "bg-amber-500/20 text-amber-400" },
        warning: { border: "border-red-500/30", bg: "bg-red-500/5", badge: "bg-red-500/20 text-red-400" },
    };
    const cfg = typeConfig[insight.type] || typeConfig.attention;
    const priorityLabel = insight.priority === "high" ? "Urgent" : insight.priority === "medium" ? "Important" : "Info";

    return (
        <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4 space-y-2 animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{insight.icon}</span>
                    <h4 className="text-sm font-black text-white leading-tight">{insight.title}</h4>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${cfg.badge}`}>{priorityLabel}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{insight.message}</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "ai" | "pins">("overview");
    const [chartRange, setChartRange] = useState<7 | 14 | 30>(7);
    const [showPins, setShowPins] = useState(false);

    // Pins
    const [pins, setPins] = useState({ admin: "7777", hotel: "1111", kitchen: "2222", services: "3333", caisse: "4444" });
    const [pinSaved, setPinSaved] = useState(false);

    // Data
    const [stats, setStats] = useState({
        totalRevenue: 0, restoRevenue: 0, hotelRevenue: 0, poolRevenue: 0, servicesRevenue: 0,
        occupancyRate: 0, activePoolGuests: 0, pendingOrdersCount: 0, completedOrdersToday: 0,
        lavagesCount: 0, totalOrdersCount: 0, avgOrderValue: 0,
    });
    const [topItems, setTopItems] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [hotelRooms, setHotelRooms] = useState<any[]>([]);
    const [allRestoOrders, setAllRestoOrders] = useState<any[]>([]);
    const [allHotelReservations, setAllHotelReservations] = useState<any[]>([]);
    const [allPoolBookings, setAllPoolBookings] = useState<any[]>([]);
    const [allServiceBookings, setAllServiceBookings] = useState<any[]>([]);
    const [chartCategory, setChartCategory] = useState<"total" | "restaurant" | "hotel" | "pool">("total");

    // AI
    const [aiInsights, setAiInsights] = useState<Insight[]>([]);
    const [aiSummary, setAiSummary] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [aiCalled, setAiCalled] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("staff_session");
        if (!stored) { router.push("/admin"); return; }
        const sess = JSON.parse(stored);
        if (sess.role !== "admin") { router.push("/staff"); return; }

        setPins({
            admin: localStorage.getItem("pin_admin") || "7777",
            hotel: localStorage.getItem("pin_hotel") || "1111",
            kitchen: localStorage.getItem("pin_kitchen") || "2222",
            services: localStorage.getItem("pin_services") || "3333",
            caisse: localStorage.getItem("pin_caisse") || "4444",
        });
        fetchData();
    }, []);

    // Chart data computed from raw orders and bookings across all station spaces
    const chartDays = useMemo(() => getLastNDays(chartRange), [chartRange]);
    const chartData = useMemo(() => {
        const vals = chartDays.map(() => 0);
        
        // Sum Restaurant Orders
        if (chartCategory === "total" || chartCategory === "restaurant") {
            allRestoOrders.forEach(o => {
                const day = (o.updated_at || o.created_at || "").split("T")[0];
                const idx = chartDays.indexOf(day);
                if (idx < 0) return;
                const total = Number(o.total_price) || Number(o.subtotal) || 0;
                const dep = Number(o.deposit_amount) || 0;
                let paid = 0;
                if (o.deposit_paid) paid = (o.status === "completed" || dep >= total) ? total : dep;
                else if (o.status === "completed") paid = total;
                vals[idx] += paid;
            });
        }

        // Sum Hotel Reservations
        if (chartCategory === "total" || chartCategory === "hotel") {
            allHotelReservations.forEach(r => {
                const day = (r.updated_at || r.created_at || "").split("T")[0];
                const idx = chartDays.indexOf(day);
                if (idx < 0) return;
                if (r.status !== "cancelled") {
                    const p = Number(r.price) || Number(r.total_price) || 0;
                    vals[idx] += p;
                }
            });
        }

        // Sum Pool Bookings
        if (chartCategory === "total" || chartCategory === "pool") {
            allPoolBookings.forEach(b => {
                const day = (b.updated_at || b.created_at || "").split("T")[0];
                const idx = chartDays.indexOf(day);
                if (idx < 0) return;
                if (b.status !== "cancelled") {
                    const p = Number(b.total_price) || Number(b.total_amount) || 0;
                    vals[idx] += p;
                }
            });
        }

        return { vals, labels: chartDays.map(d => shortDay(d)) };
    }, [allRestoOrders, allHotelReservations, allPoolBookings, chartDays, chartCategory]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [{ data: ro }, { data: hr }, { data: pb }, { data: sb }] = await Promise.all([
                supabase.from("restaurant_orders").select("*").order("created_at", { ascending: false }),
                supabase.from("hotel_reservations").select("*").order("created_at", { ascending: false }),
                supabase.from("pool_bookings").select("*").order("created_at", { ascending: false }),
                supabase.from("service_bookings").select("*").order("created_at", { ascending: false }),
            ]);

            const rOrders = ro || [];
            setAllRestoOrders(rOrders);

            const today = new Date().toISOString().split("T")[0];
            const itemMap: Record<string, any> = {};
            let restoRev = 0, pending = 0, doneToday = 0;

            rOrders.forEach(o => {
                const total = Number(o.total_price) || Number(o.subtotal) || 0;
                const dep = Number(o.deposit_amount) || 0;
                let paid = 0;
                if (o.deposit_paid) paid = (o.status === "completed" || dep >= total) ? total : dep;
                else if (o.status === "completed") paid = total;

                if (paid > 0) {
                    restoRev += paid;
                    let items: any[] = [];
                    try { items = typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []); } catch { }
                    items.filter(it => !it.is_meta).forEach((it: any) => {
                        const name = it.name || "Article";
                        const qty = Number(it.quantity) || 1;
                        const price = Number(it.price) || Number(it.basePrice) || 0;
                        let img = it.image || it.img || "";
                        if (!img) { const m = COMPLETE_MENU.find(m => m.name.toLowerCase() === name.toLowerCase()); img = m?.image || ""; }
                        if (!itemMap[name]) {
                            const m = COMPLETE_MENU.find(m => m.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(m.name.split(" ")[0].toLowerCase()));
                            itemMap[name] = { qty: 0, revenue: 0, image: img || m?.image || "", description: m?.description || "", category: m?.category || "", badge: m?.badge || "", prices: [] };
                        }
                        itemMap[name].qty += qty;
                        itemMap[name].revenue += price * qty;
                        if (price > 0) itemMap[name].prices.push(price);
                        if (!itemMap[name].image && img) itemMap[name].image = img;
                    });
                }
                if (o.status === "pending" || o.status === "preparing") pending++;
                if (o.status === "completed" && (o.updated_at || o.created_at || "").split("T")[0] === today) doneToday++;
            });

            const sortedItems = Object.entries(itemMap)
                .map(([name, d]: any) => ({
                    name, ...d,
                    avgPrice: d.prices.length ? Math.round(d.prices.reduce((a: number, b: number) => a + b, 0) / d.prices.length) : 0,
                    isTest: name.startsWith("Plat Playwright") || name.startsWith("Test")
                }))
                .filter(it => !it.isTest)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 6);
            setTopItems(sortedItems);

            const hRes = hr || [];
            let hotelRev = 0, occupied = 0;
            hRes.forEach(r => {
                const p = Number(r.price) || Number(r.total_price) || 0;
                if (r.status !== "cancelled") hotelRev += p;
                if (["checked_in", "active"].includes(r.status)) occupied++;
            });

            const pBook = pb || [];
            let poolRev = 0, activePax = 0;
            pBook.forEach(b => {
                if (b.status !== "cancelled") poolRev += Number(b.total_price) || Number(b.total_amount) || 0;
                if (["checked_in", "active"].includes(b.status)) activePax += (Number(b.adults) || 0) + (Number(b.children) || 0);
            });

            const sBook = sb || [];
            let serviceRev = 0, lavages = 0;
            sBook.forEach(s => {
                if (s.status === "completed") serviceRev += Number(s.price) || Number(s.total_price) || 0;
                if (s.service_type === "lavage" && !["completed", "cancelled"].includes(s.status)) lavages++;
            });

            const totalRev = restoRev + hotelRev + poolRev + serviceRev;
            const paid = rOrders.filter(o => o.status === "completed" || (o.deposit_paid && Number(o.deposit_amount) >= (Number(o.total_price) || Number(o.subtotal)))).length;

            setStats({
                totalRevenue: totalRev, restoRevenue: restoRev, hotelRevenue: hotelRev,
                poolRevenue: poolRev, servicesRevenue: serviceRev,
                occupancyRate: Math.min(Math.round((occupied / 10) * 100), 100),
                activePoolGuests: activePax, pendingOrdersCount: pending, completedOrdersToday: doneToday,
                lavagesCount: lavages, totalOrdersCount: rOrders.length,
                avgOrderValue: paid > 0 ? Math.round(restoRev / paid) : 0,
            });

            setRecentOrders(rOrders.slice(0, 6));
            setHotelRooms(hRes.slice(0, 5));
            setAllHotelReservations(hRes);
            setAllPoolBookings(pBook);
            setAllServiceBookings(sBook);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAI = useCallback(async () => {
        setAiLoading(true);
        setAiError("");
        setAiCalled(true);
        try {
            const res = await fetch("/api/admin-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stats, topItems, recentOrders })
            });
            const data = await res.json();
            if (!res.ok) {
                setAiError(`Erreur ${res.status}: ${data.error || "Inconnue"}${data.detail ? ` — ${data.detail}` : ""}`);
                return;
            }
            if (data.error) {
                setAiError(data.error + (data.debug ? ` [${data.debug}]` : ""));
                return;
            }
            setAiInsights(data.insights || []);
            setAiSummary(data.summary || "");
        } catch (err: any) {
            setAiError(`Erreur réseau: ${err.message}`);
        } finally {
            setAiLoading(false);
        }
    }, [stats, topItems, recentOrders]);


    const savePins = () => {
        Object.entries(pins).forEach(([k, v]) => localStorage.setItem(`pin_${k}`, v));
        setPinSaved(true);
        setTimeout(() => setPinSaved(false), 3000);
    };

    // Donut segments
    const donut = useMemo(() => {
        const total = stats.totalRevenue || 1;
        return [
            { label: "Restaurant", value: stats.restoRevenue, color: "#F97316", pct: Math.round((stats.restoRevenue / total) * 100) },
            { label: "Hôtel", value: stats.hotelRevenue, color: "#F59E0B", pct: Math.round((stats.hotelRevenue / total) * 100) },
            { label: "Piscine", value: stats.poolRevenue, color: "#06B6D4", pct: Math.round((stats.poolRevenue / total) * 100) },
            { label: "Services", value: stats.servicesRevenue, color: "#10B981", pct: Math.round((stats.servicesRevenue / total) * 100) },
        ].filter(s => s.value > 0);
    }, [stats]);

    const tabs = [
        { id: "overview", label: "Vue Générale", icon: BarChart3 },
        { id: "analytics", label: "Analytiques", icon: TrendingUp },
        { id: "ai", label: "IA Advisor", icon: Bot },
        { id: "pins", label: "Codes PIN", icon: Lock },
    ] as const;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-amber-500/40 animate-spin" />
                <div className="absolute inset-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                </div>
            </div>
            <p className="text-sm font-bold text-gray-400 animate-pulse">Chargement du tableau de bord...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-300">

            {/* ── HEADER ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />
                            <h1 className="text-2xl font-black text-white">Tableau de Bord Admin</h1>
                        </div>
                        <p className="text-xs text-gray-500 font-medium pl-3.5">
                            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                            {" · "}Données en temps réel
                        </p>
                    </div>
                    <button onClick={fetchData} className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-gray-500 hover:text-white hover:bg-white/10 transition-all group">
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>

                {/* Tab Nav */}
                <div className="flex gap-1 bg-[#0F172A] p-1 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === id ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                            {id === "ai" && <span className="ml-1 text-[8px] px-1 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/20 uppercase tracking-wide">Gemini</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TAB: OVERVIEW
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-200">

                    {/* Revenue KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: "Chiffre d'Affaires", value: fmt(stats.totalRevenue) + " DH", sub: "Cumul validé", icon: TrendingUp, color: "#10B981", spark: chartData.vals, trend: "+12%" },
                            { label: "Occupation Hôtel", value: stats.occupancyRate + "%", sub: `${Math.round(stats.occupancyRate / 10)} / 10 chambres`, icon: Bed, color: "#F59E0B", spark: null, trend: null },
                            { label: "Piscine Actifs", value: stats.activePoolGuests + " personnes", sub: "Enregistrés actuellement", icon: Waves, color: "#06B6D4", spark: null, trend: null },
                            { label: "File d'Attente", value: String(stats.pendingOrdersCount), sub: "Cuisine (Resto)", icon: Clock, color: "#EF4444", spark: null, trend: null },
                        ].map(({ label, value, sub, icon: Icon, color, spark, trend }) => (
                            <div key={label} className="bg-[#1E293B]/80 border border-white/8 rounded-2xl p-4 relative overflow-hidden group hover:border-white/15 transition-all">
                                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none transition-opacity opacity-30 group-hover:opacity-60" style={{ background: color }} />
                                <div className="flex items-center justify-between mb-3 relative z-10">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</span>
                                    <div className="p-1.5 rounded-lg" style={{ background: color + "20" }}>
                                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-white mb-0.5 relative z-10">{value}</div>
                                <div className="text-[10px] font-bold relative z-10" style={{ color }}>{sub}</div>
                                {spark && spark.some(v => v > 0) && (
                                    <div className="mt-2 relative z-10 opacity-60">
                                        <Sparkline data={spark} color={color} height={32} />
                                    </div>
                                )}
                                {trend && <div className="absolute bottom-3 right-3 text-[9px] font-black text-green-400 flex items-center gap-0.5"><ArrowUpRight className="w-2.5 h-2.5" />{trend}</div>}
                            </div>
                        ))}
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="bg-[#1E293B]/80 border border-white/8 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-white uppercase tracking-wide">Répartition des Revenus</h2>
                            <span className="text-[10px] font-bold text-gray-500">{fmt(stats.totalRevenue)} DH total</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Restaurant", value: stats.restoRevenue, icon: Utensils, color: "#F97316" },
                                { label: "Hôtel", value: stats.hotelRevenue, icon: Bed, color: "#F59E0B" },
                                { label: "Piscine", value: stats.poolRevenue, icon: Waves, color: "#06B6D4" },
                                { label: "Services", value: stats.servicesRevenue, icon: Wrench, color: "#10B981" },
                            ].map(({ label, value, icon: Icon, color }) => {
                                const pct = stats.totalRevenue > 0 ? Math.round((value / stats.totalRevenue) * 100) : 0;
                                return (
                                    <div key={label} className="bg-[#0F172A] rounded-xl p-3 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className="w-3.5 h-3.5" style={{ color }} />
                                            <span className="text-[10px] font-bold text-gray-400">{label}</span>
                                        </div>
                                        <div className="text-lg font-black text-white">{fmt(value)} DH</div>
                                        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
                                        </div>
                                        <div className="text-[9px] font-bold mt-1" style={{ color }}>{pct}% du total</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Live Queues */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Restaurant Queue */}
                        <div className="bg-[#1E293B]/80 border border-white/8 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-wide">File Cuisine</h3>
                                </div>
                                <button onClick={() => router.push("/admin/restaurant")} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                                    Gérer <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-6 text-[11px] text-gray-600 bg-[#0F172A] rounded-xl border border-white/5">Aucune commande</div>
                                ) : recentOrders.map(o => {
                                    const statusConf: Record<string, { label: string; class: string }> = {
                                        pending: { label: "Attente", class: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                                        preparing: { label: "Cuisine", class: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
                                        ready: { label: "Prêt ✓", class: "bg-green-500/15 text-green-400 border-green-500/20" },
                                        completed: { label: "Encaissé", class: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
                                        pending_payment: { label: "Pmt...", class: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
                                    };
                                    const sc = statusConf[o.status] || statusConf.pending;
                                    return (
                                        <div key={o.id} className="flex items-center justify-between bg-[#0F172A] rounded-xl px-3 py-2.5 border border-white/5 hover:border-white/10 transition-all">
                                            <div>
                                                <div className="text-xs font-black text-white">{o.order_number}</div>
                                                <div className="text-[9px] text-gray-600">{o.total_price || o.subtotal} DH</div>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${sc.class}`}>{sc.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Hotel */}
                        <div className="bg-[#1E293B]/80 border border-white/8 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Bed className="w-3.5 h-3.5 text-amber-400" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-wide">Hôtel</h3>
                                </div>
                                <button onClick={() => router.push("/admin/hotel")} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                                    Gérer <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {hotelRooms.length === 0 ? (
                                    <div className="text-center py-6 text-[11px] text-gray-600 bg-[#0F172A] rounded-xl border border-white/5">Aucune réservation</div>
                                ) : hotelRooms.map(r => {
                                    const hStatusConf: Record<string, { label: string; class: string }> = {
                                        pending: { label: "Attente", class: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                                        reserved: { label: "Attente", class: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                                        confirmed: { label: "Confirmée", class: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
                                        checked_in: { label: "Occupée", class: "bg-green-500/15 text-green-400 border-green-500/20" },
                                        completed: { label: "Terminée", class: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
                                        cancelled: { label: "Annulée", class: "bg-red-500/15 text-red-400 border-red-500/20" },
                                    };
                                    const hsc = hStatusConf[r.status] || hStatusConf.pending;
                                    return (
                                        <div key={r.id} className="flex items-center justify-between bg-[#0F172A] rounded-xl px-3 py-2.5 border border-white/5 hover:border-white/10 transition-all">
                                            <div>
                                                <div className="text-xs font-black text-white">Chambre {r.room_number || "?"} <span className="text-[9px] font-normal text-gray-600 uppercase">({r.room_type})</span></div>
                                                <div className="text-[9px] text-gray-600">{r.customer_phone || "—"}</div>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${hsc.class}`}>
                                                {hsc.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Commandes aujourd'hui ✅", value: stats.completedOrdersToday, color: "text-green-400" },
                            { label: "Panier moyen 🛒", value: stats.avgOrderValue + " DH", color: "text-amber-400" },
                            { label: "Total commandes 📦", value: stats.totalOrdersCount, color: "text-blue-400" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="bg-[#1E293B]/60 border border-white/5 rounded-xl p-3 text-center">
                                <div className={`text-xl font-black ${color}`}>{value}</div>
                                <div className="text-[9px] text-gray-600 font-bold mt-0.5">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB: ANALYTICS
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === "analytics" && (
                <div className="space-y-5 animate-in fade-in duration-200">

                    {/* Revenue Chart */}
                    <div className="bg-[#1E293B]/80 border border-white/8 rounded-2xl p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-sm font-black text-white">Évolution des Encaissements</h2>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                    {chartCategory === "total" ? "Activité Globale" : chartCategory === "restaurant" ? "Restaurant" : chartCategory === "hotel" ? "Hôtel" : "Piscine"} — paiements validés par jour
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Category Switcher */}
                                <div className="flex gap-1 bg-[#0F172A] p-1 rounded-xl border border-white/5">
                                    {[
                                        { id: "total", label: "Global", colorClass: "text-[#3B82F6]" },
                                        { id: "restaurant", label: "Resto", colorClass: "text-[#F97316]" },
                                        { id: "hotel", label: "Hôtel", colorClass: "text-[#F59E0B]" },
                                        { id: "pool", label: "Piscine", colorClass: "text-[#06B6D4]" }
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setChartCategory(cat.id as any)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                                chartCategory === cat.id
                                                    ? "bg-white/10 text-white border border-white/10"
                                                    : "text-gray-500 hover:text-white"
                                            }`}
                                        >
                                            <span className={chartCategory === cat.id ? cat.colorClass : ""}>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Range Selector */}
                                <div className="flex gap-1 bg-[#0F172A] p-1 rounded-xl border border-white/5">
                                    {([7, 14, 30] as const).map(n => (
                                        <button key={n} onClick={() => setChartRange(n)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${chartRange === n ? "bg-emerald-500 text-black" : "text-gray-500 hover:text-white"}`}
                                        >{n}j</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="h-52">
                            <LineChart
                                data={chartData.vals}
                                labels={chartData.labels}
                                color={
                                    chartCategory === "total"
                                        ? "#3B82F6"
                                        : chartCategory === "restaurant"
                                        ? "#F97316"
                                        : chartCategory === "hotel"
                                        ? "#F59E0B"
                                        : "#06B6D4"
                                }
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                            {[
                                { label: "Période", value: fmt(chartData.vals.reduce((a, b) => a + b, 0)) + " DH", color: "text-white" },
                                { label: "Moy/jour", value: fmt(Math.round(chartData.vals.reduce((a, b) => a + b, 0) / (chartRange || 1))) + " DH", color: "text-gray-300" },
                                { label: "Meilleur jour", value: fmt(Math.max(...chartData.vals)) + " DH", color: "text-green-400" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="text-center bg-[#0F172A] rounded-xl p-3 border border-white/5">
                                    <div className={`text-sm font-black ${color}`}>{value}</div>
                                    <div className="text-[9px] text-gray-600 font-bold mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Donut + Top items */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* Donut */}
                        <div className="lg:col-span-2 bg-[#1E293B]/80 border border-white/8 rounded-2xl p-5">
                            <h2 className="text-sm font-black text-white mb-4">Parts d'Activité</h2>
                            {donut.length > 0 ? <DonutChart segments={donut} /> : (
                                <div className="text-center py-8 text-xs text-gray-600">Pas de revenus enregistrés</div>
                            )}
                        </div>

                        {/* Top Dishes */}
                        <div className="lg:col-span-3 bg-[#1E293B]/80 border border-white/8 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-4 h-4 text-amber-400" />
                                <h2 className="text-sm font-black text-white">Top Plats</h2>
                                <span className="ml-auto text-[9px] font-bold text-gray-600">{topItems.length} articles</span>
                            </div>
                            {topItems.length === 0 ? (
                                <div className="text-center py-8 text-xs text-gray-600 flex flex-col items-center gap-2">
                                    <Utensils className="w-6 h-6 text-gray-700" />
                                    Aucune vente réelle enregistrée
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topItems.slice(0, 5).map((item, i) => {
                                        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                                        const max = topItems[0]?.revenue || 1;
                                        const pct = Math.round((item.revenue / max) * 100);
                                        const colors = ["#F59E0B", "#9CA3AF", "#B45309", "#10B981", "#3B82F6"];
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-base w-6 text-center">{medals[i]}</span>
                                                {item.image && (
                                                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#0F172A] border border-white/5">
                                                        <Image src={item.image} alt={item.name} width={36} height={36} className="object-cover w-full h-full" unoptimized={item.image?.startsWith("http")} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1 gap-2">
                                                        <span className="text-[11px] font-bold text-white truncate">{item.name}</span>
                                                        <span className="text-[10px] font-black text-green-400 shrink-0">{fmt(item.revenue)} DH</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] || "#10B981", transition: "width 1s" }} />
                                                    </div>
                                                    <div className="flex justify-between text-[9px] text-gray-600 font-bold mt-0.5">
                                                        <span>×{item.qty} vendus</span>
                                                        <span>{item.avgPrice} DH moy.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dish Cards Grid */}
                    {topItems.length > 0 && (
                        <div className="bg-[#1E293B]/80 border border-white/8 rounded-2xl p-5">
                            <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400" />
                                Fiches Détaillées des Plats
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                {topItems.map((item, i) => {
                                    const catColors: Record<string, string> = {
                                        FastFood: "#F97316", Plats: "#F59E0B", Boissons: "#06B6D4",
                                        Desserts: "#EC4899", Salades: "#10B981", Ftour: "#EAB308"
                                    };
                                    const cc = catColors[item.category] || "#6B7280";
                                    return (
                                        <div key={i} className="bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden hover:border-white/15 transition-all group">
                                            <div className="relative h-28 overflow-hidden bg-[#162032]">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized={item.image?.startsWith("http")} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><Utensils className="w-8 h-8 text-white/10" /></div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                                                {item.category && (
                                                    <div className="absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: cc + "30", color: cc, border: `1px solid ${cc}40` }}>
                                                        {item.category}
                                                    </div>
                                                )}
                                                {item.badge && (
                                                    <div className="absolute bottom-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white">{item.badge}</div>
                                                )}
                                            </div>
                                            <div className="p-2.5">
                                                <h4 className="text-[11px] font-black text-white leading-tight mb-2 line-clamp-2">{item.name}</h4>
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="bg-white/3 rounded-lg p-1.5 text-center">
                                                        <div className="text-[11px] font-black text-white">×{item.qty}</div>
                                                        <div className="text-[7px] text-gray-600 uppercase">vendus</div>
                                                    </div>
                                                    <div className="bg-white/3 rounded-lg p-1.5 text-center">
                                                        <div className="text-[11px] font-black text-green-400">{item.revenue}</div>
                                                        <div className="text-[7px] text-gray-600 uppercase">DH</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB: AI ADVISOR
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === "ai" && (
                <div className="space-y-5 animate-in fade-in duration-200">

                    {/* AI Hero */}
                    <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F1829] border border-purple-500/20 rounded-2xl p-6 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white">Gemini AI Business Advisor</h2>
                                    <p className="text-[10px] text-purple-300 font-medium">Propulsé par Google Gemini 2.0 Flash</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Connecté
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mb-5">
                                L'IA analyse vos données en temps réel ({fmt(stats.totalRevenue)} DH de CA, {stats.totalOrdersCount} commandes)
                                et génère des conseils business personnalisés et actionnables.
                            </p>

                            {/* Context summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                                {[
                                    { label: "CA Total", value: fmt(stats.totalRevenue) + " DH" },
                                    { label: "Commandes", value: String(stats.totalOrdersCount) },
                                    { label: "En Attente", value: String(stats.pendingOrdersCount) },
                                    { label: "Top Plat", value: topItems[0]?.name?.split(" ").slice(0, 2).join(" ") || "—" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-2.5 text-center">
                                        <div className="text-xs font-black text-white truncate">{value}</div>
                                        <div className="text-[9px] text-gray-500 font-bold">{label}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={fetchAI}
                                disabled={aiLoading}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {aiLoading ? (
                                    <><RefreshCw className="w-5 h-5 animate-spin" /> Analyse en cours par Gemini...</>
                                ) : aiCalled ? (
                                    <><RotateCcw className="w-5 h-5" /> Régénérer les conseils</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Analyser et générer des conseils IA</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {aiError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-400 font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {aiError}
                        </div>
                    )}

                    {/* AI Summary */}
                    {aiSummary && (
                        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3">
                            <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-black text-purple-300 uppercase tracking-wider mb-1">Résumé Global</div>
                                <p className="text-sm font-bold text-white">{aiSummary}</p>
                            </div>
                        </div>
                    )}

                    {/* Insights Grid */}
                    {aiInsights.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Bot className="w-3.5 h-3.5" />
                                {aiInsights.length} Conseils Personnalisés
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {aiInsights.map((ins, i) => <InsightCard key={i} insight={ins} delay={i * 100} />)}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!aiLoading && !aiCalled && (
                        <div className="text-center py-12 text-gray-600">
                            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                            <p className="text-sm font-bold">Cliquez sur le bouton pour lancer l'analyse IA</p>
                            <p className="text-xs text-gray-700 mt-1">Gemini analysera vos données en temps réel</p>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB: PINS
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === "pins" && (
                <div className="animate-in fade-in duration-200 max-w-lg mx-auto">
                    <div className="bg-[#1E293B]/80 border border-white/8 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-white flex items-center gap-2"><Lock className="w-4 h-4 text-amber-400" /> Mots de passe d'Accès</h2>
                                <p className="text-[10px] text-gray-500 mt-0.5">Alphanumérique — modifiez et sauvegardez</p>
                            </div>
                            <button onClick={() => setShowPins(!showPins)} className="p-2 rounded-xl bg-white/5 border border-white/8 text-gray-500 hover:text-white transition-all">
                                {showPins ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: "admin", label: "🔴 Administrateur", placeholder: "7777", color: "focus:border-red-500/50" },
                                { key: "hotel", label: "🟡 Réception Hôtel", placeholder: "1111", color: "focus:border-amber-500/50" },
                                { key: "kitchen", label: "🟠 Cuisine Restaurant", placeholder: "2222", color: "focus:border-orange-500/50" },
                                { key: "services", label: "🔵 Piscine & Services", placeholder: "3333", color: "focus:border-cyan-500/50" },
                                { key: "caisse", label: "🟢 Caisse (Scanner)", placeholder: "4444", color: "focus:border-green-500/50" },
                            ].map(({ key, label, placeholder, color }) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
                                    <input
                                        type={showPins ? "text" : "password"}
                                        maxLength={50}
                                        value={pins[key as keyof typeof pins]}
                                        onChange={e => setPins(p => ({ ...p, [key]: e.target.value.replace(/\s/g, "") }))}
                                        className={`w-full bg-[#0F172A] border border-white/8 rounded-xl p-3.5 text-white font-mono font-black text-lg outline-none ${color} tracking-widest transition-colors`}
                                        placeholder={showPins ? placeholder : "••••"}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={savePins}
                            className={`w-full py-4 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${pinSaved ? "bg-green-500 text-white" : "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400"}`}
                        >
                            {pinSaved ? <><CheckCircle className="w-4 h-4" /> Codes sauvegardés !</> : <><Key className="w-4 h-4" /> Sauvegarder les codes</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
