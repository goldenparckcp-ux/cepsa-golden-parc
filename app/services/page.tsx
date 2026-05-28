"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Droplets, Hotel, Waves, ChevronRight, Star, Wrench } from "lucide-react";
import { useTranslation } from "@/lib/state/LanguageContext";


function ServicesContent() {
    const router = useRouter();
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    useEffect(() => {
        if (type === "pool") router.replace("/pool");
        // Lavage Auto temporarily disabled
        // if (type === "wash") router.replace("/services/lavage");
        if (type === "auto") router.replace("/services");
    }, [type, router]);

    const tiles = [
        /* Lavage Auto temporarily disabled
        {
            key: "wash",
            title: t('services.wash.title') || "Lavage",
            desc: t('services.wash.desc') || "30-min slots · smart duration blocking · eco-friendly products",
            to: "/services/lavage",
            icon: Droplets,
            image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200",
            badge: "Popular"
        },
        */
        {
            key: "hotel",
            title: t('services.hotel.title') || "Hotel",
            desc: t('services.hotel.desc') || "Premium rooms · day rates · soundproof · breakfast included",
            to: "/hotel",
            icon: Hotel,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
            badge: "Comfort"
        },
        {
            key: "pool",
            title: t('services.pool.title') || "Piscine",
            desc: t('services.pool.desc') || "Heated pool · lifeguard on duty · family-friendly",
            to: "/pool",
            icon: Waves,
            image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200",
            badge: "Relax"
        },
        {
            key: "lube",
            title: t('services.lube.title') || "Lubrifiants",
            desc: t('services.lube.desc') || "Changement d'huile et entretien rapide",
            to: "#",
            icon: Wrench,
            image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=1200",
            badge: "Auto Care"
        }
    ];

    const fuelPrices = {
        gasoil: "12.50 DH/L",
        sansPlomb: "14.20 DH/L",
        lastUpdate: "Updated 2h ago"
    };

    return (
        <div className="grid gap-6 text-white">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>

            {/* Enhanced Header Section */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl h-[200px]">
                <Image
                    src="/image/cepsa-station.jpg"
                    alt="Cepsa Golden Parc"
                    fill
                    className="absolute inset-0 object-cover"
                    priority
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
                        <div className="text-3xl font-extrabold text-white">{t('services.title')}</div>
                        <div className="h-1 w-8 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                    </div>
                    <div className="mt-2 text-sm text-[#94A3B8]">
                        {t('services.desc')}
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
                            className="group overflow-hidden rounded-3xl border border-white/10 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 hover:border-white/20 block bg-[linear-gradient(135deg,#1e293b_0%,#334155_100%)] backdrop-blur-[10px]"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={t.image}
                                    alt={t.title}
                                    fill
                                    className="object-cover transition-all duration-500 group-hover:scale-[1.08] group-hover:brightness-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />

                                {/* Enhanced hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-600/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                <div className="absolute left-4 top-4 flex gap-3">
                                    <span
                                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_4px_20px_rgba(220,38,38,0.4)] transition-all duration-200 group-hover:scale-110 bg-[linear-gradient(135deg,#DC2626_0%,#EF4444_100%)]"
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
                                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-extrabold transition-all duration-200 bg-[linear-gradient(135deg,rgba(234,179,8,0.2)_0%,rgba(220,38,38,0.1)_100%)] text-[#EAB308] shadow-[0_4px_15px_rgba(234,179,8,0.3)]"
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

            {/* Fuel Prices Section temporarily disabled as requested
            <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm bg-[linear-gradient(135deg,#1e293b_0%,#334155_100%)] shadow-[0_4px_20px_rgba(30,41,59,0.3)]">
                <div className="flex flex-row-reverse rtl:flex-row items-center gap-3 mb-4 rtl:justify-end">
                    <div className="text-xl font-extrabold text-white">{t('services.fuel.title')}</div>
                    <div className="h-1 flex-1 rtl:flex-none rtl:w-8 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm">
                        <div className="text-xs font-semibold text-white/70 mb-1">{t('services.fuel.gasoil')}</div>
                        <div className="text-2xl font-extrabold text-[#EAB308]">{fuelPrices.gasoil}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm">
                        <div className="text-xs font-semibold text-white/70 mb-1">{t('services.fuel.sansPlomb')}</div>
                        <div className="text-2xl font-extrabold text-[#EAB308]">{fuelPrices.sansPlomb}</div>
                    </div>
                </div>
                <div className="mt-3 text-xs text-center text-white/60">
                    {fuelPrices.lastUpdate} (mock)
                </div>
            </div>
            */}
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
