"use client";

import React, { useMemo, useState } from "react";
import { restaurantCategories, MenuItem, COMPLETE_MENU } from "@/lib/types/menu";
import { FoodCard } from "@/components/restaurant/FoodCard";
import { DarkSheet } from "@/components/ui/DarkSheet";
import { ProductCustomizer } from "@/components/restaurant/ProductCustomizer";
import { Toast } from "@/components/ui/Toast";
import { useCart } from "@/lib/state/CartContext";

export default function LaMachinePage() {
    const [active, setActive] = useState(restaurantCategories[0].id);
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const { addItem } = useCart();

    const filteredItems = useMemo(() => {
        if (active === 'all') return COMPLETE_MENU;
        // Map category IDs to Menu Item Categories if needed, or precise match
        // In data.ts: 'Ftour', 'Snacks', 'Plats', 'Boissons', 'Desserts'
        // In Items: 'Ftour', 'Snacks', 'Plats', 'Boissons', 'Desserts'
        // They seem to match perfectly.
        return COMPLETE_MENU.filter(item => item.category === active);
    }, [active]);

    // Toast auto-dismiss
    React.useEffect(() => {
        if (!toast) return;
        const t = window.setTimeout(() => setToast(null), 1200);
        return () => window.clearTimeout(t);
    }, [toast]);

    const handleItemSelect = (item: MenuItem) => {
        if (!item.available) return;
        setCustomizeItem(item);
    };

    const handleAddToCart = (cartItem: any) => {
        addItem(cartItem);
        setToast("Ajouté au panier!");
        setCustomizeItem(null);
    };

    return (
        <div className="grid gap-6 pb-40">
            <Toast message={toast} />

            {/* Enhanced Header Section */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl h-56 md:h-80">
                <img
                    src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1600&q=80"
                    alt="La Machine"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent" />
                <div className="relative p-8 h-full flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"></div>
                        <div className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{
                            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                        }}>
                            La Machine
                        </div>
                        <div className="h-2 w-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse delay-75"></div>
                    </div>
                    <div className="mt-4 max-w-2xl">
                        <div className="text-base md:text-lg text-white/90 leading-relaxed font-medium">
                            Premium food & coffee · Always show preparation times · Guest-first ordering
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
                            <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-amber-400 border border-amber-500/30">
                                🍽️ 20+ Plats
                            </span>
                            <span className="inline-flex items-center rounded-full bg-red-500/20 px-3 py-1 text-red-400 border border-red-500/30">
                                ☕ 10+ Boissons
                            </span>
                            <span className="inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-green-400 border border-green-500/30">
                                🍰 5+ Desserts
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enhanced Category Tabs */}
            <div className="sticky top-[60px] z-30 -mx-4 px-4 bg-[#0f172a] py-2 border-b border-white/5">
                <div className="overflow-x-auto scrollbar-hide touch-pan-x">
                    <div className="flex gap-3 pb-2 min-w-max px-1">
                        {restaurantCategories.map((c) => {
                            const isActive = c.id === active;
                            // Precalculate count
                            const itemCount = c.id === 'all'
                                ? COMPLETE_MENU.length
                                : COMPLETE_MENU.filter(i => i.category === c.id).length;

                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setActive(c.id)}
                                    className={[
                                        "flex-shrink-0 whitespace-nowrap rounded-xl border px-5 py-2.5 text-sm font-extrabold transition-all duration-200",
                                        isActive
                                            ? "border-white/30 text-white shadow-lg scale-105"
                                            : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                    ].join(" ")}
                                    style={isActive ? {
                                        background: "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)",
                                        boxShadow: "0 4px 15px rgba(234,179,8,0.15)"
                                    } : undefined}
                                    aria-pressed={isActive}
                                >
                                    <span className="flex items-center gap-2">
                                        {c.label}
                                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                                            {itemCount}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Food Grid with enhanced spacing */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                {filteredItems.map((item) => (
                    <FoodCard key={item.id} item={item} onSelect={handleItemSelect} />
                ))}
            </div>

            {/* Empty state for categories */}
            {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-white/5 bg-white/5">
                    <div className="text-4xl mb-4 opacity-50">🍽️</div>
                    <div className="text-xl font-extrabold text-white mb-2">
                        Coming Soon
                    </div>
                    <div className="text-sm text-white/60">
                        This category will be available soon
                    </div>
                </div>
            )}

            {/* Customization Sheet */}
            <DarkSheet
                open={!!customizeItem}
                title="Customize"
                onClose={() => setCustomizeItem(null)}
            >
                {customizeItem && (
                    <ProductCustomizer
                        item={customizeItem}
                        onAddToCart={handleAddToCart}
                        onClose={() => setCustomizeItem(null)}
                    />
                )}
            </DarkSheet>
        </div>
    );
}
