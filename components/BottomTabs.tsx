"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ServicesMenuModal } from "./modals/ServicesMenuModal";

export function BottomTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [showServicesMenu, setShowServicesMenu] = useState(false);

    const isLaMachineActive = pathname === '/menu' && searchParams?.get('tab') === 'food';
    const isHomeActive = pathname === '/';
    const isHotelActive = pathname === '/hotel';
    const isOrdersActive = pathname === '/orders';

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 z-[60] safe-area-bottom shadow-2xl">
                <div className="relative flex items-end justify-around px-2 pb-2 pt-3 max-w-md mx-auto sm:px-6">

                    {/* 1. LA MACHINE */}
                    <NavButton
                        onClick={() => router.push('/restaurant')}
                        active={pathname === '/restaurant'}
                        icon="☕"
                        label="La Machine"
                    />

                    {/* 2. SERVICES (Triggers Modal) */}
                    <NavButton
                        onClick={() => setShowServicesMenu(true)}
                        active={showServicesMenu} // Highlight if menu is open? Or never? User code: active={false}
                        icon="🚗"
                        label="Services"
                    />

                    {/* 3. HOME - CENTER FLOATING BUTTON */}
                    <div className="relative -top-8 px-2 group">
                        <button
                            onClick={() => router.push('/')}
                            className="relative flex flex-col items-center justify-center outline-none"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110 ${isHomeActive
                                ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/50 scale-110'
                                : 'bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 shadow-black/50'
                                }`}>
                                <span className="text-3xl drop-shadow-md">🏠</span>

                                {/* Animated glow ring for Home */}
                                {isHomeActive && (
                                    <>
                                        <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-xl animate-pulse" />
                                        <div className="absolute -bottom-1 w-1.5 h-1.5 bg-cyan-200 rounded-full animate-ping" />
                                    </>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold mt-2 transition-colors ${isHomeActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'
                                }`}>
                                Home
                            </span>
                        </button>
                    </div>

                    {/* 4. HOTEL */}
                    <NavButton
                        onClick={() => router.push('/hotel')}
                        active={isHotelActive}
                        icon="🛌"
                        label="Hotel"
                    />

                    {/* 5. ORDERS */}
                    <NavButton
                        onClick={() => router.push('/orders')}
                        active={isOrdersActive}
                        icon="📦"
                        label="Orders"
                    />

                </div>
            </nav>

            {/* Services Bottom Sheet */}
            <ServicesMenuModal
                isOpen={showServicesMenu}
                onClose={() => setShowServicesMenu(false)}
            />
        </>
    );
}

// Reusable Nav Component
function NavButton({ onClick, active, icon, label }: { onClick: () => void, active: boolean, icon: string, label: string }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-1 flex-col items-center gap-1 p-1 outline-none transition-transform active:scale-95"
        >
            <span className={`text-2xl transition-all duration-300 ${active ? 'text-cyan-400 scale-110 -translate-y-1' : 'text-gray-500 grayscale hover:grayscale-0 hover:text-gray-300'
                }`}>
                {icon}
            </span>
            <span className={`text-[10px] font-bold transition-colors duration-300 ${active ? 'text-cyan-400' : 'text-gray-600'
                }`}>
                {label}
            </span>
        </button>
    );
}
