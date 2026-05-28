"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ServicesMenuModal } from "./modals/ServicesMenuModal";
import { User, Home, UtensilsCrossed, Car, BedDouble } from "lucide-react";
import { useTranslation } from "@/lib/state/LanguageContext";

// Reusable Nav Component with smooth animations
function NavButton({ onClick, active, icon, label }: { onClick: () => void, active: boolean, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-1 flex-col items-center justify-end h-16 pb-2 outline-none"
        >
            {/* Active Indicator Glow (RED) */}
            {active && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600/20 rounded-full blur-xl animate-pulse" />
            )}

            <div className={`relative transition-all duration-300 ease-out transform ${active
                ? '-translate-y-1 text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                : 'text-slate-500 group-hover:text-slate-300 group-active:scale-95'
                }`}>
                {icon}
            </div>

            <span className={`text-[10px] font-bold mt-1.5 transition-all duration-300 ${active
                ? 'text-red-500 opacity-100 translate-y-0'
                : 'text-slate-500 opacity-80 group-hover:text-slate-300'
                }`}>
                {label}
            </span>
        </button>
    );
}



export default function BottomTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation();
    const [showServicesMenu, setShowServicesMenu] = useState(false);

    // Hide bottom tabs on admin and staff pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/staff')) return null;

    const isHomeActive = pathname === '/';
    const isRestaurantActive = pathname === '/restaurant';
    const isHotelActive = pathname === '/hotel';
    const isProfileActive = pathname === '/profile';

    return (
        <>
            {/* Main Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-[60] safe-area-bottom md:hidden">
                {/* Glass Background with Gradient Border Top */}
                <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]"></div>

                <div className="relative flex items-end justify-around px-4 max-w-lg mx-auto h-[70px]">

                    {/* 1. RESTO (Ex-Machine) */}
                    <NavButton
                        onClick={() => router.push('/restaurant')}
                        active={isRestaurantActive}
                        icon={<UtensilsCrossed className="w-6 h-6" />}
                        label={t('nav.restaurant') || "Resto"}
                    />

                    {/* 2. SERVICES */}
                    <NavButton
                        onClick={() => setShowServicesMenu(true)}
                        active={showServicesMenu}
                        icon={<Car className="w-6 h-6" />}
                        label={t('nav.services') || "Services"}
                    />

                    {/* 3. HOME - CENTRAL FLOATING ORB (RED THEME) */}
                    <div className="relative -top-6 px-4 group z-10">
                        <button
                            onClick={() => router.push('/')}
                            className="relative flex flex-col items-center justify-center outline-none"
                        >
                            {/* Outer Glow Ring */}
                            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isHomeActive ? 'bg-red-600/30 blur-2xl scale-125' : 'opacity-0'}`} />

                            {/* The Orb Button */}
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 relative overflow-hidden transition-all duration-300 transform group-active:scale-95 ${isHomeActive
                                ? 'bg-gradient-to-br from-[#1E293B] to-[#0A0F1C] border-[#0F172A] shadow-red-600/20'
                                : 'bg-[#1E293B] border-[#0F172A] shadow-black/50 hover:bg-[#253248]'
                                }`}>
                                {/* Gradient Overlay for active state */}
                                {isHomeActive && <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />}

                                <Home className={`w-7 h-7 relative z-10 transition-all duration-300 ${isHomeActive ? 'text-red-500 fill-red-500/20' : 'text-slate-400 group-hover:text-white'
                                    }`} />
                            </div>

                            <span className={`text-[10px] font-bold mt-2 transition-opacity duration-300 ${isHomeActive ? 'text-red-500' : 'text-slate-500'}`}>
                                {t('nav.home') || 'Home'}
                            </span>
                        </button>
                    </div>

                    {/* 4. HOTEL */}
                    <NavButton
                        onClick={() => router.push('/hotel')}
                        active={isHotelActive}
                        icon={<BedDouble className="w-6 h-6" />}
                        label={t('nav.hotel') || "Hotel"}
                    />

                    {/* 5. PROFILE */}
                    <NavButton
                        onClick={() => router.push('/profile')}
                        active={isProfileActive}
                        icon={<User className="w-6 h-6" />}
                        label={t('nav.profile') || "Profile"}
                    />

                </div>
            </nav>

            <ServicesMenuModal
                isOpen={showServicesMenu}
                onClose={() => setShowServicesMenu(false)}
            />
        </>
    );
}
