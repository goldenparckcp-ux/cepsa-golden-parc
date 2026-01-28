"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, UtensilsCrossed, Car, BedDouble, Droplets, BarChart3, TrendingUp } from 'lucide-react';

// Import Dashboard Components
import KitchenDashboard from './kitchen/page';
import ServicesDashboard from './services/page';
import HotelDashboard from './hotel/page';
import PoolDashboard from './pool/page';

interface DashboardStats {
    orders: number;
    services: number;
    hotel: number;
    pool: number;
    revenue: number;
    pending_orders: number;
    pending_services: number;
    pending_hotel: number;
    pending_pool: number;
}

interface RecentActivity {
    type: 'order' | 'service' | 'hotel' | 'pool';
    date: string;
    label: string;
    status: string;
}

interface DataItem {
    id: string;
    status: string;
    created_at: string;
    total_amount?: number;
    price?: number;
    total_price?: number;
    order_number?: string;
    service_type?: string;
    service_name?: string;
    room_number?: string;
    adults?: number;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<DashboardStats>({
        orders: 0,
        services: 0,
        hotel: 0,
        pool: 0,
        revenue: 0,
        pending_orders: 0,
        pending_services: 0,
        pending_hotel: 0,
        pending_pool: 0,
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [currentTime, setCurrentTime] = useState("");
    const [now, setNow] = useState(0);

    // Helper: Calculate Time Ago
    const timeAgo = (dateStr: string) => {
        const diff = now - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} h`;
        return `${Math.floor(hours / 24)} j`;
    };

    const fetchData = useCallback(async () => {

        try {
            // 1. Optimized Fetch: Select ONLY what we need for stats & feed
            const { data: orders } = await supabase.from('restaurant_orders').select('id, status, created_at, total_amount, order_number').order('created_at', { ascending: false });
            const { data: services } = await supabase.from('service_bookings').select('id, status, created_at, service_type, service_name, price').order('created_at', { ascending: false });
            const { data: hotel } = await supabase.from('hotel_reservations').select('id, status, created_at, total_price, room_number').order('created_at', { ascending: false });
            const { data: pool } = await supabase.from('pool_bookings').select('id, status, created_at, total_price, adults').order('created_at', { ascending: false });

            // 2. Calculate Totals & Revenue
            const safeRev = (items: DataItem[] | null, defaultPrice = 0) => {
                return (items || []).reduce((acc, item) => {
                    const price = Number(item.total_amount) || Number(item.total_price) || Number(item.price) || defaultPrice;
                    return acc + price;
                }, 0);
            };

            const revOrders = safeRev(orders, 0);
            const revServices = safeRev(services, 100);
            const revHotel = safeRev(hotel, 0);
            const revPool = safeRev(pool, 150);

            // 3. Pending Counts
            const pOrders = (orders || []).filter((o: DataItem) => o.status === 'pending').length;
            const pServices = (services || []).filter((s: DataItem) => s.status === 'scheduled' || s.status === 'pending').length;
            const pHotel = (hotel || []).filter((h: DataItem) => h.status === 'reserved' || h.status === 'pending').length;
            const pPool = (pool || []).filter((p: DataItem) => p.status === 'pending').length;

            setStats({
                orders: (orders || []).length,
                services: (services || []).length,
                hotel: (hotel || []).length,
                pool: (pool || []).length,
                revenue: revOrders + revHotel + revPool + revServices,
                pending_orders: pOrders,
                pending_services: pServices,
                pending_hotel: pHotel,
                pending_pool: pPool
            });

            // 4. Build Activity Feed (Mix top 5 from each source to avoid heavy sorting of thousands)
            const mixOrders = (orders || []).slice(0, 5).map((x: DataItem) => ({ type: 'order' as const, date: x.created_at, label: `Commande #${x.order_number || '?'}`, status: x.status }));
            const mixServices = (services || []).slice(0, 5).map((x: DataItem) => ({ type: 'service' as const, date: x.created_at, label: `${x.service_type === 'lavage' ? 'Lavage' : 'Méca'}`, status: x.status }));
            const mixHotel = (hotel || []).slice(0, 5).map((x: DataItem) => ({ type: 'hotel' as const, date: x.created_at, label: `Chambre ${x.room_number || '?'}`, status: x.status }));
            const mixPool = (pool || []).slice(0, 5).map((x: DataItem) => ({ type: 'pool' as const, date: x.created_at, label: `Piscine (${x.adults || 1})`, status: x.status }));

            const feed = [...mixOrders, ...mixServices, ...mixHotel, ...mixPool];
            feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setRecentActivity(feed);

        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        }
    }, []);

    useEffect(() => {
        // Initial Fetch
        fetchData();

        // Realtime Subscriptions
        const channels = [
            supabase.channel('admin-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_orders' }, () => fetchData()).subscribe(),
            supabase.channel('admin-services').on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings' }, () => fetchData()).subscribe(),
            supabase.channel('admin-hotel').on('postgres_changes', { event: '*', schema: 'public', table: 'hotel_reservations' }, () => fetchData()).subscribe(),
            supabase.channel('admin-pool').on('postgres_changes', { event: '*', schema: 'public', table: 'pool_bookings' }, () => fetchData()).subscribe()
        ];

        // Clock
        setCurrentTime(new Date().toLocaleTimeString());
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
            setNow(Date.now());
        }, 1000);

        return () => {
            channels.forEach(ch => ch.unsubscribe());
            clearInterval(timer);
        };
    }, [fetchData]);

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">

            {/* Top Bar */}
            <header className="bg-[#1E293B] border-b border-white/10 p-4 sticky top-0 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
                        👑
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Admin Dashboard</h1>
                        <p className="text-xs text-gray-400 font-mono">Cepsa Golden Park • Live</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4 text-xs font-bold text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Online
                        </div>
                        <div>{currentTime}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                        AD
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar Navigation */}
                <aside className="w-20 md:w-64 bg-[#1E293B] border-r border-white/10 flex flex-col items-center md:items-stretch py-6 gap-2 shrink-0 z-40">
                    <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Vue d'Ensemble" />
                    <div className="h-px bg-white/5 my-2 mx-4" />
                    <NavButton active={activeTab === 'kitchen'} onClick={() => setActiveTab('kitchen')} icon={UtensilsCrossed} label="Cuisine" />
                    <NavButton active={activeTab === 'services'} onClick={() => setActiveTab('services')} icon={Car} label="Services Auto" />
                    <NavButton active={activeTab === 'hotel'} onClick={() => setActiveTab('hotel')} icon={BedDouble} label="Hôtel" />
                    <NavButton active={activeTab === 'pool'} onClick={() => setActiveTab('pool')} icon={Droplets} label="Piscine" />
                    <div className="h-px bg-white/5 my-2 mx-4" />
                    <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart3} label="Analytiques" />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-[#0F172A] relative">
                    {activeTab === 'overview' && (
                        <div className="p-8 animate-fade-in space-y-8">

                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <KPICard title="Commandes (Resto)" value={stats.orders.toString()} icon={<UtensilsCrossed />} color="text-yellow-500" bg="bg-yellow-500/10" border="border-yellow-500/20" />
                                <KPICard title="Services Auto" value={stats.services.toString()} icon={<Car />} color="text-blue-500" bg="bg-blue-500/10" border="border-blue-500/20" />
                                <KPICard title="Hôtel & Repos" value={stats.hotel.toString()} icon={<BedDouble />} color="text-purple-500" bg="bg-purple-500/10" border="border-purple-500/20" />
                                <KPICard title="Revenu Total" value={`${stats.revenue.toLocaleString()} DH`} icon={<TrendingUp />} color="text-green-500" bg="bg-green-500/10" border="border-green-500/20" />
                            </div>

                            {/* Data Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Activity Feed */}
                                <div className="lg:col-span-2 bg-[#1E293B] rounded-3xl border border-white/10 p-6">
                                    <h3 className="font-black text-xl mb-6 flex items-center gap-3">
                                        <LayoutDashboard className="w-6 h-6 text-cyan-400" />
                                        Activité Récente
                                    </h3>
                                    <div className="space-y-3">
                                        {recentActivity.map((item, idx) => {
                                            let icon = <div />;
                                            let color = 'text-gray-400';
                                            let bg = 'bg-gray-500/10';

                                            if (item.type === 'order') { icon = <UtensilsCrossed className="w-4 h-4" />; color = 'text-yellow-400'; bg = 'bg-yellow-500/10'; }
                                            if (item.type === 'service') { icon = <Car className="w-4 h-4" />; color = 'text-blue-400'; bg = 'bg-blue-500/10'; }
                                            if (item.type === 'hotel') { icon = <BedDouble className="w-4 h-4" />; color = 'text-purple-400'; bg = 'bg-purple-500/10'; }
                                            if (item.type === 'pool') { icon = <Droplets className="w-4 h-4" />; color = 'text-cyan-400'; bg = 'bg-cyan-500/10'; }

                                            return (
                                                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0F172A] border border-white/5 hover:border-white/10 transition-all">
                                                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                                                        {icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-white font-bold text-sm">{item.label}</div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">{item.status || 'N/A'}</div>
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-500">{timeAgo(item.date)}</div>
                                                </div>
                                            );
                                        })}
                                        {recentActivity.length === 0 && (
                                            <div className="text-center py-10 text-gray-500 text-sm">Chargement...</div>
                                        )}
                                    </div>
                                </div>

                                {/* Pending / Action Required */}
                                <div className="bg-[#1E293B] rounded-3xl border border-white/10 p-6 flex flex-col">
                                    <h3 className="font-black text-xl mb-6 flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-orange-400" />
                                        À Traiter
                                    </h3>

                                    <div className="flex-1 space-y-4">
                                        <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/5 flex justify-between items-center group cursor-pointer hover:border-yellow-500/50 transition-colors" onClick={() => setActiveTab('kitchen')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold">{stats.pending_orders}</div>
                                                <div className="text-sm font-bold text-gray-300 group-hover:text-white">Commandes Resto</div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                        </div>

                                        <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/5 flex justify-between items-center group cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => setActiveTab('services')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">{stats.pending_services}</div>
                                                <div className="text-sm font-bold text-gray-300 group-hover:text-white">Véhicules (Attente)</div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        </div>

                                        <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/5 flex justify-between items-center group cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => setActiveTab('hotel')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">{stats.pending_hotel}</div>
                                                <div className="text-sm font-bold text-gray-300 group-hover:text-white">Check-ins Hôtel</div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white text-center shadow-lg shadow-indigo-500/20">
                                        <div className="text-xs font-bold uppercase opacity-80 mb-1">Revenu du Jour (Est.)</div>
                                        <div className="text-2xl font-black">{stats.revenue.toLocaleString()} DH</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'kitchen' && <KitchenDashboard />}
                    {activeTab === 'services' && <ServicesDashboard />}
                    {activeTab === 'hotel' && <HotelDashboard />}
                    {activeTab === 'pool' && <PoolDashboard />}

                    {activeTab === 'analytics' && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Analytics Module Coming Soon
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
}

function NavButton({ active, onClick, icon: Icon, label }: NavButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-3 w-full transition-all border-l-4 ${active
                ? 'bg-white/5 border-cyan-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
        >
            <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : ''}`} />
            <span className="font-bold text-sm hidden md:block">{label}</span>
        </button>
    );
}

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
}

function KPICard({ title, value, icon, color, bg, border }: KPICardProps) {
    return (
        <div className={`p-6 rounded-2xl border ${bg} ${border} backdrop-blur-sm`}>
            <div className="flex justify-between items-start mb-4">
                <span className={`text-3xl p-3 bg-white/10 rounded-xl ${color}`}>{icon}</span>
                <span className={`text-xs font-bold uppercase tracking-wider opacity-60 ${color}`}>{title}</span>
            </div>
            <div className="text-3xl font-black text-white">{value}</div>
        </div>
    );
}



