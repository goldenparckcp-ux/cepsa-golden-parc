"use client";

import React from "react";
import { ShoppingBag, Fuel, Languages } from "lucide-react";
import { useCart } from "@/lib/state/CartContext";
import { useUI } from "@/lib/state/UIContext";

import { supabase } from "@/lib/supabase";

export function Header() {
    const { itemCount } = useCart();
    const { language, toggleLanguage, openCart } = useUI();

    const [fuelPrices, setFuelPrices] = React.useState({
        gasoil: "12.50 DH/L",
        sansPlomb: "14.20 DH/L",
        lastUpdate: "Mis à jour"
    });

    React.useEffect(() => {
        const fetchFuel = async () => {
            try {
                const { data } = await supabase.from("fuel_prices").select("*").eq("id", "current").maybeSingle();
                if (data) {
                    setFuelPrices({
                        gasoil: `${Number(data.gasoil).toFixed(2)} DH/L`,
                        sansPlomb: `${Number(data.sans_plomb).toFixed(2)} DH/L`,
                        lastUpdate: `MàJ ${new Date(data.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                    });
                }
            } catch (err) {
                console.warn("Using default fuel prices fallback:", err);
            }
        };
        fetchFuel();
    }, []);

    return (
        <header
            className="sticky top-0 z-50 border-b border-white/10"
            style={{ backgroundColor: "rgba(17,31,55,0.92)", backdropFilter: "blur(10px)" }}
        >
            <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
                <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold tracking-wide text-white md:text-base">
                        Golden Parc Station GPS
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                        <Fuel className="h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">Gasoil {fuelPrices.gasoil}</span>
                        <span className="text-white/30">|</span>
                        <span className="whitespace-nowrap">Sans Plomb {fuelPrices.sansPlomb}</span>
                        <span className="hidden text-white/40 sm:inline">({fuelPrices.lastUpdate})</span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white shadow-2xl transition hover:bg-white/10"
                        aria-label="Toggle language"
                    >
                        <Languages className="h-4 w-4" />
                        {language}
                    </button>

                    <button
                        type="button"
                        onClick={openCart}
                        className="relative inline-flex items-center justify-center rounded-xl px-3 py-2 text-white shadow-2xl transition hover:brightness-110"
                        style={{ backgroundColor: "#DC2626" }}
                        aria-label="Open cart"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {itemCount > 0 ? (
                            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold text-black" style={{ backgroundColor: "#EAB308" }}>
                                {itemCount}
                            </span>
                        ) : null}
                    </button>
                </div>
            </div>
        </header>
    );
}
