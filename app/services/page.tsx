"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Wrench, Droplets, Fuel, Hotel, Waves, ChevronRight, Star } from "lucide-react";

const THEME = {
    bg: "#0f172a",
    panel: "#1e293b",
    red: "#DC2626",
    gold: "#EAB308",
    gray: "#94A3B8",
    accent: "#f59e0b"
};

function ServicesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    if (type === "pool") router.replace("/pool");
    if (type === "wash") router.replace("/wash");
    if (type === "mechanic") router.replace("/mechanic");
    if (type === "auto") router.replace("/services");

    const tiles = [
        {
            key: "wash",
            title: "Lavage",
            desc: "30-min slots · smart duration blocking · eco-friendly products",
            to: "/wash",
            icon: Droplets,
            image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200",
            badge: "Popular"
        },
        {
            key: "mechanic",
            title: "Mécanique (Siyana)",
            desc: "Professional diagnostics · urgent repairs · genuine parts",
            to: "/mechanic",
            icon: Wrench,
            image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200",
            badge: "Expert"
        },
        {
            key: "hotel",
            title: "Hotel",
            desc: "Premium rooms · day rates · soundproof · breakfast included",
            to: "/hotel",
            icon: Hotel,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
            badge: "Comfort"
        },
        {
            key: "pool",
            title: "Piscine",
            desc: "Heated pool · lifeguard on duty · family-friendly",
            to: "/pool",
            icon: Waves,
            image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200",
            badge: "Relax"
        }
    ];

    const fuelPrices = {
        gasoil: "12.50 DH/L",
        sansPlomb: "14.20 DH/L",
        lastUpdate: "Updated 2h ago"
    };

    return (
        <div className="grid gap-6" style={{ color: "#fff" }}>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>

            {/* Enhanced Header Section */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <img
                    src="/image/cepsa-station.jpg"
                    alt="Cepsa Golden Parc"
                    className="absolute inset-0 h-full w-full object-cover"
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

                <div className="relative p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-1 w-8 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                        <div className="text-3xl font-extrabold text-white">Internal Services</div>
                        <div className="h-1 w-8 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                    </div>
                    <div className="mt-2 text-sm" style={{ color: THEME.gray }}>
                        Lavage, Siyana, Hotel & Piscine — smart booking flows with premium service quality.
                    </div>
                </div>
            </section>

            {/* Enhanced Services Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {tiles.map((t) => {
                    const Icon = t.icon;
                    return (
                        <Link
                            key={t.key}
                            href={t.to}
                            className="group overflow-hidden rounded-3xl border border-white/10 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 hover:border-white/20 block"
                            style={{
                                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                                backdropFilter: "blur(10px)"
                            }}
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={t.image}
                                    alt={t.title}
                                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.08] group-hover:brightness-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />

                                {/* Enhanced hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-600/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                <div className="absolute left-4 top-4 flex gap-3">
                                    <span
                                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-2xl transition-all duration-200 group-hover:scale-110"
                                        style={{
                                            background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
                                            boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)"
                                        }}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    {t.badge && (
                                        <span className="inline-flex items-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-extrabold text-white shadow-lg">
                                            <Star className="h-3.5 w-3.5 mr-1" />
                                            {t.badge}
                                        </span>
                                    )}
                                    <div className="max-w-[280px] truncate rounded-2xl bg-black/60 backdrop-blur-sm px-4 py-3 text-xs font-extrabold text-white">
                                        {t.title}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="text-sm font-semibold text-white/90 leading-relaxed">{t.desc}</div>
                                <div className="mt-5 flex items-center justify-between">
                                    <div
                                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-extrabold transition-all duration-200"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)",
                                            color: THEME.gold,
                                            boxShadow: "0 4px 15px rgba(234,179,8,0.3)"
                                        }}
                                    >
                                        Open booking
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-white/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/80" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Enhanced Fuel Prices Section */}
            <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm" style={{
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)"
            }}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-8 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                    <div className="text-xl font-extrabold text-white">Fuel Prices</div>
                    <div className="h-1 w-8 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm">
                        <div className="text-xs font-semibold text-white/70 mb-1">Gasoil</div>
                        <div className="text-2xl font-extrabold" style={{ color: THEME.gold }}>{fuelPrices.gasoil}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm">
                        <div className="text-xs font-semibold text-white/70 mb-1">Sans Plomb</div>
                        <div className="text-2xl font-extrabold" style={{ color: THEME.gold }}>{fuelPrices.sansPlomb}</div>
                    </div>
                </div>
                <div className="mt-3 text-xs text-center text-white/60">
                    {fuelPrices.lastUpdate} (mock) · Real-time updates available
                </div>
            </div>
        </div>
    );
}

export default function ServicesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ServicesContent />
        </Suspense>
    );
}
