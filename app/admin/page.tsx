"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Download,
    TrendingUp, Users, RefreshCw, Lock, Key, Award, AlertTriangle,
    CheckCircle, Clock, Utensils, Bed, Waves, Wrench, Bot, Sparkles,
    BarChart3, Activity, ArrowUpRight, ArrowDownRight, Zap, Star,
    ChevronRight, Eye, EyeOff, RotateCcw
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { adminDb } from "@/lib/admin-api";
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
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
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
    const [chartRange, setChartRange] = useState<7 | 14 | 30 | 180 | 365 | "custom">(7);
    const [customDate, setCustomDate] = useState({ start: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] });
    const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("all");
    const [showPins, setShowPins] = useState(false);

    // Pins
    const [pins, setPins] = useState({ admin: "7777", hotel: "1111", kitchen: "2222", services: "3333", caisse: "4444" });
    const [pinSaved, setPinSaved] = useState(false);

    // Data
    const [stats, setStats] = useState({
        totalRevenue: 0, restoRevenue: 0, hotelRevenue: 0, poolRevenue: 0, servicesRevenue: 0,
        occupancyRate: 0, activePoolGuests: 0, pendingOrdersCount: 0, completedOrdersToday: 0,
        lavagesCount: 0, totalOrdersCount: 0, avgOrderValue: 0, totalRefunds: 0
    });
    const [topItems, setTopItems] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [hotelRooms, setHotelRooms] = useState<any[]>([]);
    const [allRestoOrders, setAllRestoOrders] = useState<any[]>([]);
    const [allHotelReservations, setAllHotelReservations] = useState<any[]>([]);
    const [allPoolBookings, setAllPoolBookings] = useState<any[]>([]);
    const [allServiceBookings, setAllServiceBookings] = useState<any[]>([]);
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeFilter]);

    // Chart data computed from raw orders and bookings across all station spaces
    const chartDays = useMemo(() => {
        if (chartRange === "custom" && customDate.start && customDate.end) {
            const days = [];
            const d = new Date(customDate.start);
            const end = new Date(customDate.end);
            while (d <= end) {
                days.push(d.toISOString().split("T")[0]);
                d.setDate(d.getDate() + 1);
            }
            return days.slice(-60); // limit to 60 days to prevent chart overflow/lag
        }
        const n = typeof chartRange === "number" ? chartRange : 7;
        return getLastNDays(n);
    }, [chartRange, customDate]);
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
                if (o.status === "completed") {
                    paid = total;
                } else if (o.deposit_paid) {
                    paid = dep;
                }
                vals[idx] += paid;
            });
        }

        // Sum Hotel Reservations
        if (chartCategory === "total" || chartCategory === "hotel") {
            allHotelReservations.forEach(r => {
                const day = (r.updated_at || r.created_at || "").split("T")[0];
                const idx = chartDays.indexOf(day);
                if (idx < 0) return;
                const total = Number(r.total_price) || Number(r.price) || 0;
                const dep = Number(r.deposit_amount) || 0;
                let paid = 0;
                if (["checked_in", "completed"].includes(r.status)) {
                    paid = total;
                } else if (r.deposit_paid) {
                    paid = dep;
                }
                if (r.status !== "cancelled") {
                    vals[idx] += paid;
                }
            });
        }

        // Sum Pool Bookings
        if (chartCategory === "total" || chartCategory === "pool") {
            allPoolBookings.forEach(b => {
                const day = (b.updated_at || b.created_at || "").split("T")[0];
                const idx = chartDays.indexOf(day);
                if (idx < 0) return;
                const total = Number(b.total_price) || Number(b.total_amount) || 0;
                const dep = Number(b.deposit_amount) || 0;
                let paid = 0;
                if (b.status === "completed") {
                    paid = total;
                } else if (b.deposit_paid) {
                    paid = dep;
                }
                vals[idx] += paid;
            });
        }

        // Subtract Refunds
        allTransactions.forEach(t => {
            if (t.type === "refund" && t.status === "completed") {
                const day = (t.created_at || "").split("T")[0];
                const idx = chartDays.indexOf(day);
                if (idx < 0) return;
                
                const table = t.booking_table || "";
                let matchesCategory = false;
                if (chartCategory === "total") {
                    matchesCategory = true;
                } else if (chartCategory === "restaurant" && table === "restaurant_orders") {
                    matchesCategory = true;
                } else if (chartCategory === "hotel" && table === "hotel_reservations") {
                    matchesCategory = true;
                } else if (chartCategory === "pool" && table === "pool_bookings") {
                    matchesCategory = true;
                }
                
                if (matchesCategory) {
                    vals[idx] -= Number(t.amount) || 0;
                }
            }
        });

        return { vals, labels: chartDays.map(d => shortDay(d)) };
    }, [allRestoOrders, allHotelReservations, allPoolBookings, allTransactions, chartDays, chartCategory]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [{ data: ro }, { data: hr }, { data: pb }, { data: sb }, { data: tx }] = await Promise.all([
                supabase.from("restaurant_orders").select("*").order("created_at", { ascending: false }),
                supabase.from("hotel_reservations").select("*").order("created_at", { ascending: false }),
                supabase.from("pool_bookings").select("*").order("created_at", { ascending: false }),
                supabase.from("service_bookings").select("*").order("created_at", { ascending: false }),
                adminDb("transactions").select("*").order("created_at", { ascending: false }),
            ]);

            const rOrders = ro || [];
            setAllRestoOrders(rOrders);
            setRecentOrders(rOrders.slice(0, 6));

            const hRes = hr || [];
            setAllHotelReservations(hRes);
            setHotelRooms(hRes.slice(0, 5));

            setAllPoolBookings(pb || []);
            setAllServiceBookings(sb || []);
            setAllTransactions(tx || []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Recalculate stats and top items reactively when date range or raw data changes
    useEffect(() => {
        if (loading) return;

        const today = new Date().toISOString().split("T")[0];
        const itemMap: Record<string, any> = {};
        
        let restoRev = 0;
        let pending = 0;
        let doneToday = 0;
        let periodPaidCount = 0;
        let periodRestoOrdersCount = 0;

        allRestoOrders.forEach(o => {
            const day = (o.updated_at || o.created_at || "").split("T")[0];
            const inPeriod = chartDays.includes(day);

            const total = Number(o.total_price) || Number(o.subtotal) || 0;
            const dep = Number(o.deposit_amount) || 0;
            let paid = 0;
            if (o.status === "completed") {
                paid = total;
            } else if (o.deposit_paid) {
                paid = dep;
            }

            // Global stats
            if (o.status === "pending" || o.status === "preparing") pending++;
            if (o.status === "completed" && day === today) doneToday++;

            // Period specific stats
            if (inPeriod) {
                periodRestoOrdersCount++;
                if (paid > 0) {
                    restoRev += paid;
                    periodPaidCount++;

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
                            itemMap[name] = { qty: 0, revenue: 0, image: m?.image || img || "", description: m?.description || "", category: m?.category || "", badge: m?.badge || "", prices: [] };
                        }
                        itemMap[name].qty += qty;
                        itemMap[name].revenue += price * qty;
                        if (price > 0) itemMap[name].prices.push(price);
                        if (!itemMap[name].image && img) itemMap[name].image = img;
                    });
                }
            }
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

        let hotelRev = 0, occupied = 0;
        allHotelReservations.forEach(r => {
            const day = (r.updated_at || r.created_at || "").split("T")[0];
            const inPeriod = chartDays.includes(day);

            const total = Number(r.total_price) || Number(r.price) || 0;
            const dep = Number(r.deposit_amount) || 0;
            let paid = 0;
            if (["checked_in", "completed"].includes(r.status)) {
                paid = total;
            } else if (r.deposit_paid) {
                paid = dep;
            }
            
            if (r.status !== "cancelled" && inPeriod) hotelRev += paid;
            if (["checked_in", "active"].includes(r.status)) occupied++;
        });

        let poolRev = 0, activePax = 0;
        allPoolBookings.forEach(b => {
            const day = (b.updated_at || b.created_at || "").split("T")[0];
            const inPeriod = chartDays.includes(day);

            const total = Number(b.total_price) || Number(b.total_amount) || 0;
            const dep = Number(b.deposit_amount) || 0;
            let paid = 0;
            if (b.status === "completed") {
                paid = total;
            } else if (b.deposit_paid) {
                paid = dep;
            }

            if (inPeriod) {
                poolRev += paid;
            }
            if (["checked_in", "active"].includes(b.status)) activePax += (Number(b.adults) || 0) + (Number(b.children) || 0);
        });

        let serviceRev = 0, lavages = 0;
        allServiceBookings.forEach(s => {
            const day = (s.updated_at || s.created_at || "").split("T")[0];
            const inPeriod = chartDays.includes(day);

            if (s.status === "completed" && inPeriod) serviceRev += Number(s.price) || Number(s.total_price) || 0;
            if (s.service_type === "lavage" && !["completed", "cancelled"].includes(s.status)) lavages++;
        });

        let periodRefunds = 0;
        allTransactions.forEach(t => {
            if (t.type === "refund" && t.status === "completed") {
                const day = (t.created_at || "").split("T")[0];
                if (chartDays.includes(day)) {
                    periodRefunds += Number(t.amount) || 0;
                }
            }
        });

        const totalRev = restoRev + hotelRev + poolRev + serviceRev;
        const netRev = totalRev - periodRefunds;

        setStats({
            totalRevenue: netRev, restoRevenue: restoRev, hotelRevenue: hotelRev,
            poolRevenue: poolRev, servicesRevenue: serviceRev,
            occupancyRate: Math.min(Math.round((occupied / 10) * 100), 100),
            activePoolGuests: activePax, pendingOrdersCount: pending, completedOrdersToday: doneToday,
            lavagesCount: lavages, totalOrdersCount: periodRestoOrdersCount,
            avgOrderValue: periodPaidCount > 0 ? Math.round(restoRev / periodPaidCount) : 0,
            totalRefunds: periodRefunds
        });
    }, [allRestoOrders, allHotelReservations, allPoolBookings, allServiceBookings, allTransactions, chartDays, loading]);

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

    
    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Chiffre d'Affaires (DH)\n";
        
        chartData.labels.forEach((label, i) => {
            csvContent += `${label},${chartData.vals[i]}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Export_Ventes.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
            <div className="bg-[#111827]/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-[0_15px_30px_rgba(0,0,0,0.2)]">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-2 h-6 rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Tableau de Bord Admin</h1>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider pl-5 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        <span className="text-gray-600">•</span>
                        Données en temps réel
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 font-black hover:text-white transition-all text-xs flex items-center gap-2 tracking-wider uppercase active:scale-95"
                        title="Exporter les données du graphique en CSV"
                    >
                        <Download className="w-4 h-4" />
                        Exporter CSV
                    </button>
                    <button onClick={fetchData} className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group active:scale-95">
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-1.5 bg-[#0F172A]/80 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide shadow-lg">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap flex-shrink-0 uppercase tracking-wider active:scale-95 ${
                            activeTab === id 
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 font-black border border-amber-400/20" 
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${activeTab === id ? 'text-black' : 'text-gray-400'}`} />
                        {label}
                        {id === "ai" && <span className={`ml-1 text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-widest font-black border ${activeTab === id ? 'bg-black/20 text-black border-black/10' : 'bg-purple-500/20 text-purple-300 border-purple-500/10'}`}>Gemini</span>}
                    </button>
                ))}
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TAB: OVERVIEW
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-200">

                    {/* Revenue KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Chiffre d'Affaires", value: fmt(stats.totalRevenue) + " DH", sub: stats.totalRefunds > 0 ? `Net (Annulés: -${stats.totalRefunds} DH)` : "Collecté net", icon: TrendingUp, color: "#10B981", spark: chartData.vals, trend: "+12%", bgGlow: "from-green-500/10 to-transparent" },
                            { label: "Occupation Hôtel", value: stats.occupancyRate + "%", sub: `${Math.round(stats.occupancyRate / 10)} / 10 chambres`, icon: Bed, color: "#F59E0B", spark: null, trend: null, bgGlow: "from-amber-500/10 to-transparent" },
                            { label: "Piscine Actifs", value: stats.activePoolGuests + " Pax", sub: "Actuellement sur place", icon: Waves, color: "#06B6D4", spark: null, trend: null, bgGlow: "from-cyan-500/10 to-transparent" },
                            { label: "File d'Attente", value: String(stats.pendingOrdersCount), sub: "Commandes cuisine", icon: Clock, color: "#EF4444", spark: null, trend: null, bgGlow: "from-red-500/10 to-transparent" },
                        ].map(({ label, value, sub, icon: Icon, color, spark, trend, bgGlow }) => (
                            <div key={label} className="bg-[#111827]/40 border border-white/5 rounded-3xl p-5 relative overflow-hidden group hover:border-white/10 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.01]">
                                {/* Subtle radial hover glow */}
                                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${bgGlow} rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                                
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
                                    <div className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: color + "15", border: `1px solid ${color}20` }}>
                                        <Icon className="w-4 h-4" style={{ color }} />
                                    </div>
                                </div>
                                
                                <div className="text-2xl font-black text-white mb-1 relative z-10 tracking-tight">{value}</div>
                                <div className="text-[10px] font-bold relative z-10 uppercase tracking-wide opacity-80" style={{ color }}>{sub}</div>
                                
                                {spark && spark.some(v => v > 0) && (
                                    <div className="mt-3 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                        <Sparkline data={spark} color={color} height={36} />
                                    </div>
                                )}
                                {trend && (
                                    <div className="absolute bottom-4 right-4 text-[9px] font-black text-green-400 flex items-center gap-0.5 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 shadow-inner">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {trend}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xs font-black text-white uppercase tracking-wider">Répartition des Revenus</h2>
                            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">{fmt(stats.totalRevenue)} DH total</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Restaurant", value: stats.restoRevenue, icon: Utensils, color: "#F97316", bgGlow: "rgba(249,115,22,0.05)" },
                                { label: "Hôtel", value: stats.hotelRevenue, icon: Bed, color: "#F59E0B", bgGlow: "rgba(245,158,11,0.05)" },
                                { label: "Piscine", value: stats.poolRevenue, icon: Waves, color: "#06B6D4", bgGlow: "rgba(6,182,212,0.05)" },
                                { label: "Services", value: stats.servicesRevenue, icon: Wrench, color: "#10B981", bgGlow: "rgba(16,185,129,0.05)" },
                            ].map(({ label, value, icon: Icon, color, bgGlow }) => {
                                const pct = stats.totalRevenue > 0 ? Math.round((value / stats.totalRevenue) * 100) : 0;
                                return (
                                    <div key={label} className="bg-[#0F172A]/60 rounded-2xl p-4 border border-white/5 hover:border-white/10 hover:shadow-lg transition-all duration-300 relative overflow-hidden group" style={{ background: `linear-gradient(135deg, #0F172A 0%, ${bgGlow} 100%)` }}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 rounded-lg" style={{ background: color + "15" }}>
                                                <Icon className="w-3.5 h-3.5" style={{ color }} />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</span>
                                        </div>
                                        <div className="text-xl font-black text-white tracking-tight">{fmt(value)} DH</div>
                                        <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000 group-hover:scale-x-[1.02] origin-left" style={{ width: `${pct}%`, background: color }} />
                                        </div>
                                        <div className="text-[9px] font-black mt-2 uppercase tracking-widest" style={{ color }}>{pct}% du total</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Refunds Alerts Bar */}
                        {stats.totalRefunds > 0 && (
                            <div className="mt-5 flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-[11px] text-red-400 font-black uppercase tracking-wider animate-in fade-in duration-300">
                                <div className="flex items-center gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    <span>Annulations & Remboursements Automatiques</span>
                                </div>
                                <span className="font-mono text-xs">-{fmt(stats.totalRefunds)} DH</span>
                            </div>
                        )}
                    </div>

                    {/* Live Queues */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Restaurant Queue */}
                        <div className="bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">File Cuisine (Resto)</h3>
                                </div>
                                <button onClick={() => router.push("/admin/restaurant")} className="text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1">
                                    Gérer <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-gray-500 bg-[#0F172A]/50 rounded-2xl border border-white/5 font-medium">Aucune commande active</div>
                                ) : recentOrders.map(o => {
                                    const statusConf: Record<string, { label: string; class: string }> = {
                                        pending: { label: "Attente", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                                        preparing: { label: "Cuisine", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                                        ready: { label: "Prêt ✓", class: "bg-green-500/10 text-green-400 border-green-500/20" },
                                        completed: { label: "Encaissé", class: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
                                        pending_payment: { label: "Pmt...", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                                    };
                                    const sc = statusConf[o.status] || statusConf.pending;
                                    return (
                                        <div key={o.id} className="flex items-center justify-between bg-[#0F172A]/60 rounded-2xl px-4 py-3 border border-white/5 hover:border-white/10 hover:shadow-md transition-all duration-200">
                                            <div>
                                                <div className="text-xs font-black text-white tracking-wider font-mono">{o.order_number}</div>
                                                <div className="text-[10px] text-gray-500 font-bold mt-0.5">{o.total_price || o.subtotal} DH</div>
                                            </div>
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${sc.class}`}>{sc.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Hotel */}
                        <div className="bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Hôtel L'Escale</h3>
                                </div>
                                <button onClick={() => router.push("/admin/hotel")} className="text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1">
                                    Gérer <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {hotelRooms.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-gray-500 bg-[#0F172A]/50 rounded-2xl border border-white/5 font-medium">Aucune réservation active</div>
                                ) : hotelRooms.map(r => {
                                    const hStatusConf: Record<string, { label: string; class: string }> = {
                                        pending: { label: "Attente", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                                        reserved: { label: "Attente", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                                        confirmed: { label: "Confirmée", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                                        checked_in: { label: "Occupée", class: "bg-green-500/10 text-green-400 border-green-500/20" },
                                        completed: { label: "Terminée", class: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
                                        cancelled: { label: "Annulée", class: "bg-red-500/10 text-red-400 border-red-500/20" },
                                    };
                                    const hsc = hStatusConf[r.status] || hStatusConf.pending;
                                    return (
                                        <div key={r.id} className="flex items-center justify-between bg-[#0F172A]/60 rounded-2xl px-4 py-3 border border-white/5 hover:border-white/10 hover:shadow-md transition-all duration-200">
                                            <div>
                                                <div className="text-xs font-black text-white tracking-wide">Chambre {r.room_number || "?"} <span className="text-[9px] font-bold text-gray-500 uppercase">({r.room_type})</span></div>
                                                <div className="text-[10px] text-gray-500 font-bold mt-0.5">{r.customer_phone || "—"}</div>
                                            </div>
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${hsc.class}`}>
                                                {hsc.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Commandes aujourd'hui ✅", value: stats.completedOrdersToday, color: "text-green-400", bgGlow: "rgba(34,197,94,0.05)" },
                            { label: "Panier moyen 🛒", value: stats.avgOrderValue + " DH", color: "text-amber-400", bgGlow: "rgba(245,158,11,0.05)" },
                            { label: "Total commandes 📦", value: stats.totalOrdersCount, color: "text-blue-400", bgGlow: "rgba(59,130,246,0.05)" },
                        ].map(({ label, value, color, bgGlow }) => (
                            <div key={label} className="bg-[#111827]/40 border border-white/5 rounded-2xl p-4 text-center backdrop-blur-2xl hover:border-white/10 hover:shadow-lg transition-all duration-300 relative overflow-hidden group" style={{ background: `linear-gradient(135deg, #111827 0%, ${bgGlow} 100%)` }}>
                                <div className={`text-xl font-mono font-black ${color} tracking-tight group-hover:scale-105 transition-transform duration-300`}>{value}</div>
                                <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Financial Transactions & Audit Log */}
                    <div className="bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    Flux Financier & Audit des Paiements
                                </h3>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Historique des transactions réelles (acompte, remboursement, recharge)</p>
                            </div>
                            <span className="text-[9px] font-black text-gray-500 uppercase bg-[#0F172A] px-2.5 py-1 rounded-md border border-white/5 self-start sm:self-center">{allTransactions.length} transactions</span>
                        </div>
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-white/5 text-[9px] text-gray-500 font-black uppercase tracking-widest">
                                        <th className="pb-3 pl-3">Date</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3">Activité</th>
                                        <th className="pb-3">Passerelle</th>
                                        <th className="pb-3">Référence Transaction</th>
                                        <th className="pb-3 text-right pr-3">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {allTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-xs text-gray-500 bg-[#0F172A]/30 rounded-2xl">Aucune transaction bancaire enregistrée</td>
                                        </tr>
                                    ) : allTransactions.slice(0, 10).map((t, idx) => {
                                        const typeLabels: Record<string, { label: string; class: string }> = {
                                            deposit: { label: "Acompte", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                                            refund: { label: "Remboursement", class: "bg-red-500/10 text-red-400 border-red-500/20" },
                                            recharge: { label: "Recharge", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
                                        };
                                        const tl = typeLabels[t.type] || { label: t.type || "Paiement", class: "bg-white/5 text-gray-400 border-white/10" };
                                        
                                        const activityLabels: Record<string, string> = {
                                            restaurant_orders: "Restaurant 🍕",
                                            hotel_reservations: "Hôtel 🏨",
                                            pool_bookings: "Piscine 🏊",
                                            service_bookings: "Services ⚙️"
                                        };
                                        const act = activityLabels[t.booking_table] || "Système";
                                        
                                        const isRefund = t.type === "refund";
                                        const formattedDate = t.created_at ? new Date(t.created_at).toLocaleString("fr-FR", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        }) : "—";

                                        return (
                                            <tr key={t.id || idx} className="text-[11px] text-gray-300 hover:bg-white/3 transition-colors">
                                                <td className="py-3 pl-3 font-medium text-gray-400">{formattedDate}</td>
                                                <td className="py-3">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${tl.class}`}>
                                                        {tl.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 font-bold text-white">{act}</td>
                                                <td className="py-3 font-bold text-gray-400 uppercase tracking-widest">{t.gateway || "cmi"}</td>
                                                <td className="py-3 font-mono text-[10px] text-gray-500 select-all">{t.gateway_reference || "—"}</td>
                                                <td className={`py-3 text-right pr-3 font-mono font-black ${isRefund ? "text-red-400" : "text-emerald-400"}`}>
                                                    {isRefund ? "-" : "+"}{t.amount} DH
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB: ANALYTICS
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === "analytics" && (
                <div className="space-y-5 animate-in fade-in duration-200">

                    {/* Revenue Chart */}
                    <div className="bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xs font-black text-white uppercase tracking-wider">Évolution des Encaissements</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                                    {chartCategory === "total" ? "Activité Globale" : chartCategory === "restaurant" ? "Restaurant" : chartCategory === "hotel" ? "Hôtel" : "Piscine"} — paiements validés par jour
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Category Switcher */}
                                <div className="flex gap-1.5 bg-[#0F172A]/80 p-1.5 rounded-xl border border-white/5">
                                    {[
                                        { id: "total", label: "Global", colorClass: "text-[#3B82F6]" },
                                        { id: "restaurant", label: "Resto", colorClass: "text-[#F97316]" },
                                        { id: "hotel", label: "Hôtel", colorClass: "text-[#F59E0B]" },
                                        { id: "pool", label: "Piscine", colorClass: "text-[#06B6D4]" }
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setChartCategory(cat.id as any)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider ${
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
                                <div className="flex gap-1.5 bg-[#0F172A]/80 p-1.5 rounded-xl border border-white/5">
                                    {([7, 14, 30] as const).map(n => (
                                          <button key={n} onClick={() => setChartRange(n)}
                                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${chartRange === n ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10" : "text-gray-500 hover:text-white"}`}
                                          >{n}j</button>
                                      ))}
                                      <button onClick={() => setChartRange("custom")}
                                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${chartRange === "custom" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10" : "text-gray-500 hover:text-white"}`}
                                      >Période...</button>
                                </div>
                            </div>
                        </div>
                        {chartRange === "custom" && (
                            <div className="flex gap-2 items-center justify-end mt-3 mb-4 animate-in fade-in zoom-in-95">
                                <input type="date" value={customDate.start} onChange={e => setCustomDate({...customDate, start: e.target.value})} className="bg-[#0F172A] border border-white/10 text-white text-[10px] px-3 py-2 rounded-lg outline-none focus:border-amber-500/50" />
                                <span className="text-gray-500 text-xs font-black uppercase">à</span>
                                <input type="date" value={customDate.end} onChange={e => setCustomDate({...customDate, end: e.target.value})} className="bg-[#0F172A] border border-white/10 text-white text-[10px] px-3 py-2 rounded-lg outline-none focus:border-amber-500/50" />
                            </div>
                        )}
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
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/5">
                            {[
                                { label: "Période", value: fmt(chartData.vals.reduce((a, b) => a + b, 0)) + " DH", color: "text-white" },
                                { label: "Moy/jour", value: fmt(Math.round(chartData.vals.reduce((a, b) => a + b, 0) / (chartData.vals.length || 1))) + " DH", color: "text-gray-300" },
                                { label: "Meilleur jour", value: fmt(Math.max(...chartData.vals)) + " DH", color: "text-green-400" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="text-center bg-[#0F172A]/50 rounded-2xl p-4 border border-white/5">
                                    <div className={`text-base font-mono font-black ${color}`}>{value}</div>
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Donut + Top items */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* Donut */}
                        <div className="lg:col-span-2 bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
                            <h2 className="text-xs font-black text-white uppercase tracking-wider mb-5">Parts d'Activité</h2>
                            {donut.length > 0 ? <DonutChart segments={donut} /> : (
                                <div className="text-center py-10 text-xs text-gray-500 bg-[#0F172A]/50 rounded-2xl border border-white/5">Pas de revenus enregistrés</div>
                            )}
                        </div>

                        {/* Top Dishes */}
                        <div className="lg:col-span-3 bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
                            <div className="flex items-center gap-2 mb-5">
                                <Award className="w-4 h-4 text-amber-400" />
                                <h2 className="text-xs font-black text-white uppercase tracking-wider">Top Plats</h2>
                                <span className="ml-auto text-[9px] font-black text-gray-500 uppercase bg-[#0F172A] px-2.5 py-1 rounded-md border border-white/5">{topItems.length} articles</span>
                            </div>
                            {topItems.length === 0 ? (
                                <div className="text-center py-10 text-xs text-gray-500 bg-[#0F172A]/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                                    <Utensils className="w-6 h-6 text-gray-700" />
                                    Aucune vente réelle enregistrée
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {topItems.slice(0, 5).map((item, i) => {
                                        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                                        const max = topItems[0]?.revenue || 1;
                                        const pct = Math.round((item.revenue / max) * 100);
                                        const colors = ["#F59E0B", "#9CA3AF", "#B45309", "#10B981", "#3B82F6"];
                                        return (
                                            <div key={i} className="flex items-center gap-4 bg-[#0F172A]/30 p-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200">
                                                <span className="text-lg w-6 text-center shrink-0">{medals[i]}</span>
                                                {item.image && (
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[#0F172A] border border-white/5">
                                                        <Image src={item.image} alt={item.name} width={40} height={40} className="object-cover w-full h-full" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1.5 gap-2">
                                                        <span className="text-xs font-black text-white truncate">{item.name}</span>
                                                        <span className="text-xs font-mono font-black text-green-400 shrink-0">{fmt(item.revenue)} DH</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-1000 origin-left" style={{ width: `${pct}%`, background: colors[i] || "#10B981" }} />
                                                    </div>
                                                    <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">
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
                        <div className="bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
                            <h2 className="text-xs font-black text-white mb-5 flex items-center gap-2 uppercase tracking-wider">
                                <Star className="w-4 h-4 text-amber-400" />
                                Fiches Détaillées des Plats
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                {topItems.map((item, i) => {
                                    const catColors: Record<string, string> = {
                                        FastFood: "#F97316", Plats: "#F59E0B", Boissons: "#06B6D4",
                                        Desserts: "#EC4899", Salades: "#10B981", Ftour: "#EAB308"
                                    };
                                    const cc = catColors[item.category] || "#6B7280";
                                    return (
                                        <div key={i} className="bg-[#0F172A]/80 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-lg transition-all duration-300 group">
                                            <div className="relative h-28 overflow-hidden bg-[#162032]">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><Utensils className="w-8 h-8 text-white/10" /></div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                                                {item.category && (
                                                    <div className="absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: cc + "20", color: cc, border: `1px solid ${cc}40` }}>
                                                        {item.category}
                                                    </div>
                                                )}
                                                {item.badge && (
                                                    <div className="absolute bottom-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white">{item.badge}</div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h4 className="text-[11px] font-black text-white leading-tight mb-2 line-clamp-2 h-7">{item.name}</h4>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <div className="bg-white/5 rounded-xl p-1.5 text-center border border-white/5">
                                                        <div className="text-[10px] font-black text-white">×{item.qty}</div>
                                                        <div className="text-[7px] text-gray-500 font-bold uppercase tracking-wider">vendus</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-1.5 text-center border border-white/5">
                                                        <div className="text-[10px] font-mono font-black text-green-400">{item.revenue}</div>
                                                        <div className="text-[7px] text-gray-500 font-bold uppercase tracking-wider">DH</div>
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
                    <div className="relative bg-[#111827]/40 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-6 overflow-hidden shadow-2xl">
                        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl shadow-lg shadow-purple-500/25 transition-transform duration-300 hover:scale-105">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-white uppercase tracking-wider">Gemini AI Business Advisor</h2>
                                        <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest mt-0.5">Propulsé par Google Gemini 2.0 Flash</p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full shadow-inner w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                    Connecté
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed mb-6 font-medium">
                                L'intelligence artificielle analyse vos ventes en temps réel ({fmt(stats.totalRevenue)} DH de CA, {stats.totalOrdersCount} commandes) 
                                et génère des conseils business personnalisés et actionnables pour optimiser votre rentabilité.
                            </p>

                            {/* Context summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {[
                                    { label: "CA Total", value: fmt(stats.totalRevenue) + " DH", color: "text-white" },
                                    { label: "Commandes", value: String(stats.totalOrdersCount), color: "text-blue-400" },
                                    { label: "En Attente", value: String(stats.pendingOrdersCount), color: "text-amber-400" },
                                    { label: "Top Plat", value: topItems[0]?.name?.split(" ").slice(0, 2).join(" ") || "—", color: "text-purple-400" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="bg-[#0F172A]/70 border border-white/5 rounded-2xl p-3.5 text-center">
                                        <div className={`text-sm font-mono font-black ${color} truncate`}>{value}</div>
                                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">{label}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={fetchAI}
                                disabled={aiLoading}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                            >
                                {aiLoading ? (
                                    <><RefreshCw className="w-5 h-5 animate-spin" /> Analyse en cours par Gemini...</>
                                ) : aiCalled ? (
                                    <><RotateCcw className="w-5 h-5" /> Régénérer les conseils</>
                                ) : (
                                    <><Sparkles className="w-5 h-5 animate-pulse" /> Analyser et générer des conseils IA</>
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
                    <div className="bg-[#111827]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
                                    <Lock className="w-4 h-4 text-amber-500" /> 
                                    Mots de passe d'Accès
                                </h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Codes PIN d'authentification pour le staff</p>
                            </div>
                            <button onClick={() => setShowPins(!showPins)} className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-white transition-all active:scale-95">
                                {showPins ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: "admin", label: "🔴 Administrateur", placeholder: "7777", color: "focus:border-red-500/50" },
                                { key: "hotel", label: "🟡 Réception Hôtel", placeholder: "1111", color: "focus:border-amber-500/50" },
                                { key: "kitchen", label: "🟠 Cuisine Restaurant", placeholder: "2222", color: "focus:border-orange-500/50" },
                                { key: "services", label: "🔵 Piscine & Services", placeholder: "3333", color: "focus:border-cyan-500/50" },
                                { key: "caisse", label: "🟢 Caisse (Scanner)", placeholder: "4444", color: "focus:border-green-500/50" },
                            ].map(({ key, label, placeholder, color }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">{label}</label>
                                    <input
                                        type={showPins ? "text" : "password"}
                                        maxLength={50}
                                        value={pins[key as keyof typeof pins]}
                                        onChange={e => setPins(p => ({ ...p, [key]: e.target.value.replace(/\s/g, "") }))}
                                        className={`w-full bg-[#0F172A]/80 border border-white/8 rounded-2xl p-4 text-white font-mono font-black text-lg outline-none ${color} tracking-widest transition-colors shadow-inner`}
                                        placeholder={showPins ? placeholder : "••••"}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={savePins}
                            className={`w-full py-4 font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.99] shadow-lg ${
                                pinSaved 
                                    ? "bg-green-500 text-white shadow-green-500/10" 
                                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400"
                            }`}
                        >
                            {pinSaved ? <><CheckCircle className="w-5 h-5" /> Codes sauvegardés !</> : <><Key className="w-5 h-5" /> Sauvegarder les codes</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
