"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';
import { LayoutDashboard, UtensilsCrossed, Car, BedDouble, Droplets, BarChart3, TrendingUp, Users } from 'lucide-react';

// Import Dashboard Components
import KitchenDashboard from './kitchen/page';
import ServicesDashboard from './services/page';
import HotelDashboard from './hotel/page';
import PoolDashboard from './pool/page';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        orders: 0,
        services: 0,
        hotel: 0,
        pool: 0,
        revenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            // Very basic stats counting
            const { count: orderCount } = await supabase.from('restaurant_orders').select('*', { count: 'exact', head: true });
            const { count: serviceCount } = await supabase.from('service_bookings').select('*', { count: 'exact', head: true });
            const { count: hotelCount } = await supabase.from('hotel_reservations').select('*', { count: 'exact', head: true });
            const { count: poolCount } = await supabase.from('pool_bookings').select('*', { count: 'exact', head: true });

            setStats({
                orders: orderCount || 0,
                services: serviceCount || 0,
                hotel: hotelCount || 0,
                pool: poolCount || 0,
                revenue: (orderCount || 0) * 150 + (serviceCount || 0) * 100 + (hotelCount || 0) * 200 // Mock revenue calc
            });
        };
        fetchStats();
    }, []);

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
                        <div>{new Date().toLocaleTimeString()}</div>
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
                                <KPICard title="Total Commandes" value={stats.orders.toString()} icon={'🍽️'} color="text-yellow-500" bg="bg-yellow-500/10" border="border-yellow-500/20" />
                                <KPICard title="Services Auto" value={stats.services.toString()} icon={'🚗'} color="text-blue-500" bg="bg-blue-500/10" border="border-blue-500/20" />
                                <KPICard title="Hôtel & Repos" value={stats.hotel.toString()} icon={'🛌'} color="text-purple-500" bg="bg-purple-500/10" border="border-purple-500/20" />
                                <KPICard title="Revenu Estimé" value={`${stats.revenue} DH`} icon={'💰'} color="text-green-500" bg="bg-green-500/10" border="border-green-500/20" />
                            </div>

                            {/* Activity Feed Placeholder */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-[#1E293B] rounded-2xl border border-white/10 p-6 min-h-[300px]">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-cyan-400" /> Activité Récente
                                    </h3>
                                    <div className="space-y-4">
                                        <ActivityItem icon="🍽️" text="Nouvelle commande #R-1024" time="2 min" />
                                        <ActivityItem icon="🚗" text="Lavage réservé #L-552" time="5 min" />
                                        <ActivityItem icon="🛌" text="Check-in Chambre 12" time="12 min" />
                                        <ActivityItem icon="✔️" text="Commande #R-1021 servie" time="15 min" />
                                    </div>
                                </div>

                                <div className="bg-[#1E293B] rounded-2xl border border-white/10 p-6 min-h-[300px]">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-orange-400" /> Staff Actif
                                    </h3>
                                    <div className="space-y-3">
                                        <StaffItem name="Ahmed (Cuisine)" status="online" />
                                        <StaffItem name="Karim (Lavage)" status="online" />
                                        <StaffItem name="Sara (Réception)" status="away" />
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

function NavButton({ active, onClick, icon: Icon, label }: any) {
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

function KPICard({ title, value, icon, color, bg, border }: any) {
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

function ActivityItem({ icon, text, time }: any) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xl">{icon}</span>
            <div className="flex-1 text-sm font-medium">{text}</div>
            <div className="text-xs text-gray-500 font-mono">{time}</div>
        </div>
    );
}

function StaffItem({ name, status }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="font-bold text-sm">{name}</div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase">
                <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                {status}
            </div>
        </div>
    );
}
