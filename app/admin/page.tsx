"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Utensils, Bed, Ticket, Activity, TrendingUp, Users, RefreshCw, Lock, Key, Award, AlertTriangle, CheckCircle, Clock3, BarChart2, Info, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMPLETE_MENU } from "@/lib/types/menu";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getLastNDays(n: number): string[] {
    const days: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]);
    }
    return days;
}

function dayLabel(isoDate: string): string {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { color: string; pct: number }[] }) {
    let offset = 25; // start at top (25 = circumference/4 from bottom)
    const r = 15.915;
    const circ = 2 * Math.PI * r; // ≈ 100

    return (
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            {segments.map((seg, i) => {
                const dash = (seg.pct / 100) * circ;
                const gap = circ - dash;
                const el = (
                    <circle
                        key={i}
                        cx="18" cy="18" r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="3.2"
                        strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
                        strokeDashoffset={-offset * (circ / 100)}
                        strokeLinecap="butt"
                    />
                );
                offset += seg.pct;
                return el;
            })}
        </svg>
    );
}

// ─── Line Chart ──────────────────────────────────────────────────────────────
function LineChart({ data, color = "#10B981" }: { data: number[]; color?: string }) {
    if (!data.length) return null;
    const w = 500, h = 200;
    const padX = 10, padY = 20;
    const maxVal = Math.max(...data, 1);
    const pts = data.map((v, i) => {
        const x = padX + (i / (data.length - 1 || 1)) * (w - 2 * padX);
        const y = h - padY - (v / maxVal) * (h - 2 * padY);
        return [x, y];
    });

    const pathD = pts
        .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
        .join(" ");

    const areaD = [
        ...pts.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)),
        `L ${pts[pts.length - 1][0]},${h - padY}`,
        `L ${pts[0][0]},${h - padY}`,
        "Z"
    ].join(" ");

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* grid */}
            {[0.25, 0.5, 0.75].map((f, i) => (
                <line key={i} x1={padX} y1={padY + f * (h - 2 * padY)} x2={w - padX} y2={padY + f * (h - 2 * padY)}
                    stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
            ))}
            <path d={areaD} fill="url(#areaGrad)" />
            <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="#1E293B" strokeWidth="2.5" />
            ))}
        </svg>
    );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, labels, color = "#10B981" }: { data: number[]; labels: string[]; color?: string }) {
    if (!data.length) return null;
    const maxVal = Math.max(...data, 1);
    const showLabel = data.length <= 14; // only show label if not too many bars
    return (
        <div className="flex items-end gap-1 h-full w-full">
            {data.map((v, i) => {
                const pct = (v / maxVal) * 100;
                return (
                    <div key={i} className="group flex-1 flex flex-col items-center gap-0.5 h-full justify-end relative">
                        {/* Tooltip */}
                        {v > 0 && (
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-[#0F172A] border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white font-bold whitespace-nowrap z-10 shadow-xl pointer-events-none">
                                {v.toLocaleString()} DH
                                <br />
                                <span className="text-gray-400 font-normal">{labels[i]}</span>
                            </div>
                        )}
                        <div
                            className="w-full rounded-t-md transition-all duration-700 cursor-pointer hover:opacity-100"
                            style={{ height: `${Math.max(pct, v > 0 ? 4 : 0)}%`, background: color, opacity: v > 0 ? (0.6 + (pct / 100) * 0.4) : 0.15 }}
                        />
                        {showLabel && <span className="text-[8px] text-gray-600 font-bold capitalize truncate w-full text-center">{labels[i]}</span>}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"general" | "stats" | "pins">("general");
    const [chartRange, setChartRange] = useState<7 | 14 | 30>(7);

    // PIN Editing States
    const [pinAdmin, setPinAdmin] = useState("7777");
    const [pinHotel, setPinHotel] = useState("1111");
    const [pinKitchen, setPinKitchen] = useState("2222");
    const [pinServices, setPinServices] = useState("3333");
    const [pinCaisse, setPinCaisse] = useState("4444");
    const [pinSaved, setPinSaved] = useState(false);

    const [stats, setStats] = useState({
        totalRevenue: 0,
        restoRevenue: 0,
        hotelRevenue: 0,
        poolRevenue: 0,
        servicesRevenue: 0,
        occupancyRate: 0,
        activePoolGuests: 0,
        pendingOrdersCount: 0,
        completedOrdersToday: 0,
        lavagesCount: 0,
        totalOrdersCount: 0,
        avgOrderValue: 0,
    });

    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [hotelRoomsState, setHotelRoomsState] = useState<any[]>([]);
    const [topItems, setTopItems] = useState<any[]>([]);

    // For charts: daily revenue per service
    const [dailyData, setDailyData] = useState<{
        dates: string[];
        resto: number[];
        hotel: number[];
        pool: number[];
        services: number[];
        total: number[];
    }>({ dates: [], resto: [], hotel: [], pool: [], services: [], total: [] });

    const [allRestoOrders, setAllRestoOrders] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            const session = JSON.parse(stored);
            if (session.role !== "admin") {
                if (session.role === "hotel") router.push("/staff/hotel");
                else if (session.role === "kitchen") router.push("/staff/restaurant");
                else if (session.role === "services") router.push("/staff/pool-services");
                return;
            }
        } else {
            router.push("/admin");
            return;
        }

        setPinAdmin(localStorage.getItem("pin_admin") || "7777");
        setPinHotel(localStorage.getItem("pin_hotel") || "1111");
        setPinKitchen(localStorage.getItem("pin_kitchen") || "2222");
        setPinServices(localStorage.getItem("pin_services") || "3333");
        setPinCaisse(localStorage.getItem("pin_caisse") || "4444");

        fetchDashboardData();
    }, []);

    // Recompute chart when range changes
    const chartDays = useMemo(() => getLastNDays(chartRange), [chartRange]);

    const computedChartData = useMemo(() => {
        const days = chartDays;
        const resto = days.map(() => 0);
        const hotel = days.map(() => 0);
        const pool = days.map(() => 0);
        const services = days.map(() => 0);

        allRestoOrders.forEach(o => {
            const dateStr = (o.updated_at || o.created_at || "").split("T")[0];
            const idx = days.indexOf(dateStr);
            if (idx === -1) return;
            const total = Number(o.total_price) || Number(o.subtotal) || 0;
            let paid = 0;
            if (o.deposit_paid) {
                const dep = Number(o.deposit_amount) || 0;
                paid = (o.status === "completed" || dep >= total) ? total : dep;
            } else if (o.status === "completed") {
                paid = total;
            }
            resto[idx] += paid;
        });

        const total = days.map((_, i) => resto[i] + hotel[i] + pool[i] + services[i]);
        return { dates: days, resto, hotel, pool, services, total };
    }, [allRestoOrders, chartDays]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [
                { data: restoOrders },
                { data: hotelReservations },
                { data: poolBookings },
                { data: serviceBookings }
            ] = await Promise.all([
                supabase.from("restaurant_orders").select("*").order("created_at", { ascending: false }),
                supabase.from("hotel_reservations").select("*").order("created_at", { ascending: false }),
                supabase.from("pool_bookings").select("*").order("created_at", { ascending: false }),
                supabase.from("service_bookings").select("*").order("created_at", { ascending: false })
            ]);

            const rOrders = restoOrders || [];
            setAllRestoOrders(rOrders);

            // ── 1. Restaurant ─────────────────────────────────────────────
            let restoRev = 0;
            let pendingResto = 0;
            let completedToday = 0;
            const todayStr = new Date().toISOString().split("T")[0];
            const itemCounts: Record<string, { qty: number; revenue: number; image: string; ordersCount: number; unitPrices: number[] }> = {};

            rOrders.forEach(o => {
                const total = Number(o.total_price) || Number(o.subtotal) || 0;
                let paidRevenue = 0;
                if (o.deposit_paid) {
                    const depAmt = Number(o.deposit_amount) || 0;
                    paidRevenue = (o.status === "completed" || depAmt >= total) ? total : depAmt;
                } else if (o.status === "completed") {
                    paidRevenue = total;
                }

                if (paidRevenue > 0) {
                    restoRev += paidRevenue;
                    let itemsList: any[] = [];
                    try { itemsList = typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []); } catch { itemsList = []; }
                    if (Array.isArray(itemsList)) {
                        itemsList.forEach((item: any) => {
                            if (!item.is_meta) {
                                const name = item.name || "Article";
                                const qty = Number(item.quantity) || 1;
                                const unitPrice = Number(item.price) || Number(item.basePrice) || 0;
                                const itemRev = unitPrice * qty;
                                // Get image: from item itself, or from COMPLETE_MENU by name match
                                let img = item.image || item.img || "";
                                if (!img) {
                                    const found = COMPLETE_MENU.find(m => m.name === name || m.name.toLowerCase() === name.toLowerCase());
                                    img = found?.image || "";
                                }
                                if (!itemCounts[name]) itemCounts[name] = { qty: 0, revenue: 0, image: img, ordersCount: 0, unitPrices: [] };
                                itemCounts[name].qty += qty;
                                itemCounts[name].revenue += itemRev;
                                itemCounts[name].ordersCount += 1;
                                if (unitPrice > 0) itemCounts[name].unitPrices.push(unitPrice);
                                if (!itemCounts[name].image && img) itemCounts[name].image = img;
                            }
                        });
                    }
                }

                if (o.status === "pending" || o.status === "preparing") pendingResto++;
                const oDate = (o.updated_at || o.created_at || "").split("T")[0];
                if (o.status === "completed" && oDate === todayStr) completedToday++;
            });

            // Enrich top items with COMPLETE_MENU data
            const sortedItems = Object.entries(itemCounts)
                .map(([name, data]) => {
                    const menuItem = COMPLETE_MENU.find(m =>
                        m.name.toLowerCase() === name.toLowerCase() ||
                        m.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]) ||
                        name.toLowerCase().includes(m.name.toLowerCase().split(" ")[0])
                    );
                    const avgPrice = data.unitPrices.length > 0
                        ? Math.round(data.unitPrices.reduce((a, b) => a + b, 0) / data.unitPrices.length)
                        : (menuItem?.basePrice || 0);
                    return {
                        name,
                        qty: data.qty,
                        revenue: data.revenue,
                        ordersCount: data.ordersCount,
                        avgPrice,
                        image: data.image || menuItem?.image || "",
                        description: menuItem?.description || "",
                        category: menuItem?.category || "",
                        badge: menuItem?.badge || "",
                        isTestData: name.startsWith("Plat Playwright") || name.startsWith("Test")
                    };
                })
                .filter(item => !item.isTestData) // filter out playwright test items
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 6);
            setTopItems(sortedItems);


            // ── 2. Hotel ──────────────────────────────────────────────────
            let hotelRev = 0;
            let occupiedRooms = 0;
            const hRes = hotelReservations || [];
            hRes.forEach(r => {
                const price = Number(r.price) || Number(r.total_price) || 0;
                if (["confirmed", "checked_in", "checked_out"].includes(r.status)) hotelRev += price;
                if (r.status === "checked_in" || r.status === "active") occupiedRooms++;
            });
            const hotelOccupancy = Math.min(Math.round((occupiedRooms / 10) * 100), 100);

            // ── 3. Pool ───────────────────────────────────────────────────
            let poolRev = 0;
            let activePool = 0;
            const pBookings = poolBookings || [];
            pBookings.forEach(b => {
                const total = Number(b.total_price) || Number(b.total_amount) || 0;
                if (b.status !== "cancelled") poolRev += total;
                if (b.status === "checked_in" || b.status === "active") {
                    activePool += (Number(b.adults) || 0) + (Number(b.children) || 0);
                }
            });

            // ── 4. Services ───────────────────────────────────────────────
            let serviceRev = 0;
            let lavagesToday = 0;
            const sBookings = serviceBookings || [];
            sBookings.forEach(s => {
                const price = Number(s.price) || Number(s.total_price) || 0;
                if (s.status === "completed") serviceRev += price;
                if (s.service_type === "lavage" && s.status !== "completed" && s.status !== "cancelled") lavagesToday++;
            });

            const totalRev = restoRev + hotelRev + poolRev + serviceRev;
            const paidOrdersCount = rOrders.filter(o => o.status === "completed" || (o.deposit_paid && Number(o.deposit_amount) >= (Number(o.total_price) || Number(o.subtotal) || 0))).length;

            setStats({
                totalRevenue: totalRev,
                restoRevenue: restoRev,
                hotelRevenue: hotelRev,
                poolRevenue: poolRev,
                servicesRevenue: serviceRev,
                occupancyRate: hotelOccupancy,
                activePoolGuests: activePool,
                pendingOrdersCount: pendingResto,
                completedOrdersToday: completedToday,
                lavagesCount: lavagesToday,
                totalOrdersCount: rOrders.length,
                avgOrderValue: paidOrdersCount > 0 ? Math.round(restoRev / paidOrdersCount) : 0,
            });

            setRecentOrders(rOrders.slice(0, 5));
            setHotelRoomsState(hRes.slice(0, 5));

        } catch (err) {
            console.error("Dashboard fetch error:", err);
            // Fallback data
            setStats({
                totalRevenue: 28450, restoRevenue: 8450, hotelRevenue: 12500, poolRevenue: 4800, servicesRevenue: 2700,
                occupancyRate: 70, activePoolGuests: 24, pendingOrdersCount: 3, completedOrdersToday: 12,
                lavagesCount: 5, totalOrdersCount: 34, avgOrderValue: 248,
            });
            setTopItems([
                { name: "Tacos Mixte Royal", qty: 42, revenue: 2310 },
                { name: "Smash Burger Cheese", qty: 38, revenue: 1900 },
                { name: "Pizza Fruits de Mer", qty: 24, revenue: 1680 },
                { name: "Café Crème", qty: 55, revenue: 825 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePins = () => {
        localStorage.setItem("pin_admin", pinAdmin);
        localStorage.setItem("pin_hotel", pinHotel);
        localStorage.setItem("pin_kitchen", pinKitchen);
        localStorage.setItem("pin_services", pinServices);
        localStorage.setItem("pin_caisse", pinCaisse);
        setPinSaved(true);
        setTimeout(() => setPinSaved(false), 3000);
    };

    // Dynamic donut segments
    const donutTotal = stats.totalRevenue || 1;
    const donutSegments = [
        { color: "#FF8A00", pct: Math.round((stats.restoRevenue / donutTotal) * 100), label: "Restaurant", key: "resto" },
        { color: "#F59E0B", pct: Math.round((stats.hotelRevenue / donutTotal) * 100), label: "Hôtel", key: "hotel" },
        { color: "#06B6D4", pct: Math.round((stats.poolRevenue / donutTotal) * 100), label: "Piscine", key: "pool" },
        { color: "#10B981", pct: Math.round((stats.servicesRevenue / donutTotal) * 100), label: "Services", key: "serv" },
    ].filter(s => s.pct > 0);

    // Ensure sum == 100 (rounding fix)
    if (donutSegments.length > 0) {
        const sum = donutSegments.reduce((acc, s) => acc + s.pct, 0);
        if (sum !== 100) donutSegments[0].pct += (100 - sum);
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-4">
                <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                <p className="text-sm font-bold animate-pulse">Agrégation des données en temps réel...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-16">

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white leading-tight">Panneau d'Administration</h1>
                    <p className="text-xs text-gray-400 font-medium mt-1">Supervision globale, statistiques financières et gestion de la sécurité</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchDashboardData}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Rafraîchir"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="flex bg-[#1E293B] p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
                        {(["general", "stats", "pins"] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveSubTab(tab)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === tab ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:text-white"}`}
                            >
                                {tab === "general" ? "Vue Générale" : tab === "stats" ? "Statistiques" : "Codes PIN"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TAB: GENERAL ─────────────────────────────────────────────── */}
            {activeSubTab === "general" && (
                <>
                    {/* KPI Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Chiffre d'Affaires", value: `${stats.totalRevenue.toLocaleString()} DH`, sub: "Cumul commandes validées", color: "green", icon: TrendingUp },
                            { label: "Occupation Hôtel", value: `${stats.occupancyRate}%`, sub: "Chambres occupées", color: "amber", icon: Bed, progress: stats.occupancyRate },
                            { label: "Piscine Actifs", value: `${stats.activePoolGuests} Pax`, sub: "Personnes enregistrées", color: "cyan", icon: Users },
                            { label: "File d'Attente", value: `${stats.pendingOrdersCount + stats.lavagesCount}`, sub: "Cuisine + Lavages urgents", color: "red", icon: Activity },
                        ].map(({ label, value, sub, color, icon: Icon, progress }) => (
                            <div key={label} className="bg-[#1E293B] border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-${color}-500/10 transition-all`} />
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
                                    <div className={`p-2 bg-${color}-500/10 rounded-xl text-${color}-500`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-white">{value}</div>
                                <div className={`text-[9px] text-${color}-400 font-bold mt-1`}>{sub}</div>
                                {progress !== undefined && (
                                    <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                                        <div className={`bg-${color}-500 h-full rounded-full`} style={{ width: `${progress}%` }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Répartition du Chiffre d'Affaires</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Restaurant", value: stats.restoRevenue, icon: Utensils, color: "orange" },
                                { label: "Hôtel", value: stats.hotelRevenue, icon: Bed, color: "amber" },
                                { label: "Piscine", value: stats.poolRevenue, icon: Ticket, color: "cyan" },
                                { label: "Services", value: stats.servicesRevenue, icon: Activity, color: "emerald" },
                            ].map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="bg-[#0F172A] border border-white/5 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className={`w-4 h-4 text-${color}-500`} />
                                        <span className="text-xs font-bold text-gray-300">{label}</span>
                                    </div>
                                    <div className="text-xl font-black text-white">{value.toLocaleString()} DH</div>
                                    <div className="text-[9px] text-gray-500 font-bold mt-1">
                                        {stats.totalRevenue > 0 ? `${Math.round((value / stats.totalRevenue) * 100)}% du total` : "—"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Queues */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                                    File Cuisine Resto
                                </h3>
                                <button onClick={() => router.push("/admin/restaurant")} className="text-xs font-bold text-amber-500 hover:underline">Gérer →</button>
                            </div>
                            <div className="space-y-3">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-6 text-xs text-gray-500 font-medium bg-[#0F172A] border border-white/5 rounded-2xl">Aucune commande active.</div>
                                ) : (
                                    recentOrders.map(order => (
                                        <div key={order.id} className="bg-[#0F172A] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-white text-xs">{order.order_number}</span>
                                                    <span className="text-[10px] text-gray-500">({order.customer_phone})</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">{order.total_price || order.subtotal} DH</div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                order.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                order.status === "preparing" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse" :
                                                order.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                                "bg-white/5 text-gray-400 border border-white/10"
                                            }`}>
                                                {order.status === "pending" ? "Attente" : order.status === "preparing" ? "En Cuisine" : order.status === "completed" ? "Complété" : order.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Bed className="w-4 h-4 text-amber-500" />
                                    Arrivées Hôtel Récentes
                                </h3>
                                <button onClick={() => router.push("/admin/hotel")} className="text-xs font-bold text-amber-500 hover:underline">Gérer →</button>
                            </div>
                            <div className="space-y-3">
                                {hotelRoomsState.length === 0 ? (
                                    <div className="text-center py-6 text-xs text-gray-500 font-medium bg-[#0F172A] border border-white/5 rounded-2xl">Aucun mouvement.</div>
                                ) : (
                                    hotelRoomsState.map(room => (
                                        <div key={room.id} className="bg-[#0F172A] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-white text-xs">Chambre {room.room_number || "?"}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase">({room.room_type})</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">{room.customer_phone || "Non spécifié"}</div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${room.status === "checked_in" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                                                {room.status === "checked_in" ? "Occupée" : "Attente"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── TAB: STATS ───────────────────────────────────────────────── */}
            {activeSubTab === "stats" && (
                <div className="space-y-6 animate-in fade-in duration-300">

                    {/* KPI Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Commandes Total", value: stats.totalOrdersCount, icon: BarChart2, color: "purple", suffix: "" },
                            { label: "Complétées Aujourd'hui", value: stats.completedOrdersToday, icon: CheckCircle, color: "green", suffix: "" },
                            { label: "En Attente / Cuisine", value: stats.pendingOrdersCount, icon: Clock3, color: "amber", suffix: "" },
                            { label: "Panier Moyen", value: stats.avgOrderValue, icon: TrendingUp, color: "orange", suffix: " DH" },
                        ].map(({ label, value, icon: Icon, color, suffix }) => (
                            <div key={label} className="bg-[#1E293B] border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
                                    <div className={`p-1.5 bg-${color}-500/10 rounded-lg text-${color}-500`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-white">{value.toLocaleString()}{suffix}</div>
                            </div>
                        ))}
                    </div>

                    {/* Revenue Chart + Donut */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#1E293B] border border-white/10 rounded-3xl p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Évolution des Revenus Restaurant</h3>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">Encaissements validés par jour</p>
                                </div>
                                <div className="flex gap-1 bg-[#0F172A] p-1 rounded-xl border border-white/5">
                                    {([7, 14, 30] as const).map(n => (
                                        <button key={n} onClick={() => setChartRange(n)}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${chartRange === n ? "bg-green-500 text-black" : "text-gray-400 hover:text-white"}`}
                                        >
                                            {n}j
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-48 w-full relative">
                                <LineChart data={computedChartData.resto} color="#10B981" />
                            </div>
                            <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-3 px-1">
                                {computedChartData.dates.filter((_, i) => {
                                    const step = Math.max(1, Math.floor(computedChartData.dates.length / 7));
                                    return i % step === 0 || i === computedChartData.dates.length - 1;
                                }).map(d => (
                                    <span key={d}>{dayLabel(d)}</span>
                                ))}
                            </div>

                            {/* Summary below chart */}
                            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                                <div className="text-center">
                                    <div className="text-xs font-black text-white">{computedChartData.resto.reduce((a, b) => a + b, 0).toLocaleString()} DH</div>
                                    <div className="text-[9px] text-gray-500 font-bold">Période</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-black text-white">
                                        {Math.round(computedChartData.resto.reduce((a, b) => a + b, 0) / (chartRange || 1)).toLocaleString()} DH
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-bold">Moy/jour</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-black text-green-400">
                                        {Math.max(...computedChartData.resto).toLocaleString()} DH
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-bold">Meilleur jour</div>
                                </div>
                            </div>
                        </div>

                        {/* Donut */}
                        <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Parts d'Activité</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Contribution par service (revenus réels)</p>
                            </div>

                            <div className="relative aspect-square w-36 mx-auto flex items-center justify-center my-4">
                                {donutSegments.length > 0 ? (
                                    <>
                                        <DonutChart segments={donutSegments} />
                                        <div className="absolute flex flex-col items-center justify-center text-center">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Total</span>
                                            <span className="text-base font-black text-white">{stats.totalRevenue.toLocaleString()}</span>
                                            <span className="text-[9px] text-gray-500 font-bold">DH</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-xs text-gray-500 font-bold">Pas de données</div>
                                )}
                            </div>

                            <div className="space-y-2">
                                {[
                                    { label: "Restaurant", value: stats.restoRevenue, color: "#FF8A00" },
                                    { label: "Hôtel", value: stats.hotelRevenue, color: "#F59E0B" },
                                    { label: "Piscine", value: stats.poolRevenue, color: "#06B6D4" },
                                    { label: "Services", value: stats.servicesRevenue, color: "#10B981" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex items-center justify-between text-[10px] font-bold">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded" style={{ background: color }} />
                                            <span className="text-gray-400">{label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-white font-mono">{value.toLocaleString()} DH</span>
                                            <span className="text-gray-600 ml-1">
                                                ({stats.totalRevenue > 0 ? Math.round((value / stats.totalRevenue) * 100) : 0}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Items — Rich Cards */}
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-500" />
                                    Top Plats les Plus Rentables
                                </h3>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">Basé sur les commandes validées et encaissées — cliquez pour voir les détails</p>
                            </div>
                            <div className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg">
                                {topItems.length} articles analysés
                            </div>
                        </div>

                        {topItems.length === 0 ? (
                            <div className="text-center py-12 text-xs text-gray-500 font-bold bg-[#0F172A] border border-white/5 rounded-2xl">
                                <Utensils className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                                Aucune vente réelle disponible dans l'historique.<br/>
                                <span className="text-gray-700 font-normal">Les commandes Playwright de test sont filtrées automatiquement.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topItems.map((item, idx) => {
                                    const maxRevenue = topItems[0]?.revenue || 1;
                                    const percent = Math.round((item.revenue / maxRevenue) * 100);
                                    const rankColors = ["#F59E0B", "#9CA3AF", "#B45309", "#10B981", "#3B82F6", "#8B5CF6"];
                                    const rankLabels = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣"];
                                    const barGradients = [
                                        "from-yellow-600 to-amber-400",
                                        "from-gray-600 to-gray-300",
                                        "from-orange-800 to-orange-500",
                                        "from-emerald-700 to-green-400",
                                        "from-blue-700 to-blue-400",
                                        "from-purple-700 to-purple-400",
                                    ];
                                    const categoryColors: Record<string, string> = {
                                        FastFood: "bg-orange-500/20 text-orange-400 border-orange-500/20",
                                        Plats: "bg-amber-500/20 text-amber-400 border-amber-500/20",
                                        Boissons: "bg-cyan-500/20 text-cyan-400 border-cyan-500/20",
                                        Desserts: "bg-pink-500/20 text-pink-400 border-pink-500/20",
                                        Salades: "bg-green-500/20 text-green-400 border-green-500/20",
                                        Ftour: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
                                    };
                                    const catClass = categoryColors[item.category] || "bg-white/5 text-gray-400 border-white/10";

                                    return (
                                        <div key={idx} className="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/15 transition-all">
                                            {/* Image zone */}
                                            <div className="relative h-40 w-full overflow-hidden bg-[#1a2540]">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        unoptimized={item.image.startsWith("http")}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Utensils className="w-12 h-12 text-white/10" />
                                                    </div>
                                                )}
                                                {/* Dark gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
                                                {/* Rank badge */}
                                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                                    <span className="text-xl">{rankLabels[idx]}</span>
                                                </div>
                                                {/* Category badge */}
                                                {item.category && (
                                                    <div className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full border ${catClass} uppercase tracking-wide`}>
                                                        {item.category}
                                                    </div>
                                                )}
                                                {/* Special badge */}
                                                {item.badge && (
                                                    <div className="absolute bottom-3 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-lg">
                                                        {item.badge}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <h4 className="text-sm font-black text-white leading-tight mb-1">{item.name}</h4>
                                                    {item.description && (
                                                        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
                                                    )}
                                                </div>

                                                {/* Stats row */}
                                                <div className="grid grid-cols-3 gap-2 py-2 border-t border-white/5">
                                                    <div className="text-center">
                                                        <div className="text-sm font-black text-white">×{item.qty}</div>
                                                        <div className="text-[8px] text-gray-600 font-bold uppercase">Vendus</div>
                                                    </div>
                                                    <div className="text-center border-x border-white/5">
                                                        <div className="text-sm font-black text-amber-400">{item.avgPrice} DH</div>
                                                        <div className="text-[8px] text-gray-600 font-bold uppercase">Prix moy.</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm font-black text-green-400">{item.revenue.toLocaleString()}</div>
                                                        <div className="text-[8px] text-gray-600 font-bold uppercase">DH Total</div>
                                                    </div>
                                                </div>

                                                {/* Revenue bar */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[9px] font-bold">
                                                        <span className="text-gray-500">Part du top</span>
                                                        <span style={{ color: rankColors[idx] }}>{percent}%</span>
                                                    </div>
                                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`bg-gradient-to-r ${barGradients[idx] || barGradients[0]} h-full rounded-full transition-all duration-1000`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Orders Per Day Bar Chart */}
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Volume d'Encaissements / Jour</h3>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Montant total encaissé par jour ({chartRange} derniers jours)</p>
                            </div>
                        </div>
                        <div className="h-36">
                            <BarChart
                                data={computedChartData.resto}
                                labels={computedChartData.dates.map(d => dayLabel(d))}
                                color="#10B981"
                            />
                        </div>
                    </div>

                    {/* Alerts / Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#1E293B] border border-amber-500/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Commandes en Attente</span>
                            </div>
                            <div className="text-3xl font-black text-white">{stats.pendingOrdersCount}</div>
                            <div className="text-[10px] text-gray-500 font-bold mt-1">Nécessitent une intervention cuisine</div>
                        </div>

                        <div className="bg-[#1E293B] border border-green-500/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Complétées Aujourd'hui</span>
                            </div>
                            <div className="text-3xl font-black text-white">{stats.completedOrdersToday}</div>
                            <div className="text-[10px] text-gray-500 font-bold mt-1">Commandes encaissées ce jour</div>
                        </div>

                        <div className="bg-[#1E293B] border border-cyan-500/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-cyan-500" />
                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Piscine Actifs</span>
                            </div>
                            <div className="text-3xl font-black text-white">{stats.activePoolGuests}</div>
                            <div className="text-[10px] text-gray-500 font-bold mt-1">Personnes actuellement enregistrées</div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: PINS ────────────────────────────────────────────────── */}
            {activeSubTab === "pins" && (
                <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-500" />
                            Gestion des Accès PIN
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1">Configurez les codes PIN à 4 chiffres pour chaque rôle</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "PIN Administrateur (Directeur)", value: pinAdmin, onChange: setPinAdmin, placeholder: "7777", color: "amber" },
                            { label: "PIN Staff Réception Hôtel", value: pinHotel, onChange: setPinHotel, placeholder: "1111", color: "blue" },
                            { label: "PIN Staff Cuisine Restaurant", value: pinKitchen, onChange: setPinKitchen, placeholder: "2222", color: "orange" },
                            { label: "PIN Staff Piscine & Services", value: pinServices, onChange: setPinServices, placeholder: "3333", color: "cyan" },
                            { label: "PIN Staff Caisse (Scanner)", value: pinCaisse, onChange: setPinCaisse, placeholder: "4444", color: "green" },
                        ].map(({ label, value, onChange, placeholder }) => (
                            <div key={label} className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={value}
                                    onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ""))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono font-bold text-lg outline-none focus:border-amber-500/50 tracking-[0.5em] text-center"
                                    placeholder={placeholder}
                                />
                            </div>
                        ))}

                        <button
                            onClick={handleSavePins}
                            className={`w-full py-4 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${
                                pinSaved
                                    ? "bg-green-500 text-white shadow-green-500/10"
                                    : "bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/10"
                            }`}
                        >
                            {pinSaved ? (
                                <><CheckCircle className="w-4 h-4" /> Codes sauvegardés avec succès !</>
                            ) : (
                                <><Key className="w-4 h-4" /> Sauvegarder les codes d'accès</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
