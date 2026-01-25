"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Minus, Plus, ShoppingCart, Check, Phone, X, Mail, Coffee } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/state/CartContext";
import { useUI } from "@/lib/state/UIContext";
import { COMPLETE_MENU, restaurantCategories, MenuItem } from "@/lib/types/menu";

const COLORS = {
    bg: "#1A2332",
    header: "#2C3E50",
    red: "#DC2626",
    gold: "#EAB308",
    white: "#FFFFFF",
    gray: "#94A3B8"
};

function classNames(...xs: any[]) {
    return xs.filter(Boolean).join(" ");
}

function formatDh(price: number) {
    return `${price.toFixed(2)} DH`;
}

function stableStringify(obj: any): string {
    if (obj === null || obj === undefined) return "";
    if (typeof obj !== "object") return String(obj);
    if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${k}:${stableStringify(obj[k])}`).join(",")}}`;
}

function initSelections(item: MenuItem): Record<string, any> {
    const out: any = {};
    const cfg = item?.customization || {};
    Object.entries(cfg).forEach(([key, opt]) => {
        if (opt.type === "stepper") out[key] = opt.default ?? opt.min ?? 0;
        if (opt.type === "radio") out[key] = opt.default ?? opt.options?.[0]?.id ?? null;
        if (opt.type === "checkbox") out[key] = [];
        if (opt.type === "checkbox-group") {
            const defaults = (opt.options || []).filter((o: any) => o.included).map((o: any) => o.id);
            out[key] = defaults;
        }
    });
    out.special_instructions = "";
    return out;
}

function calcPrice(item: MenuItem, selections: any): number {
    let price = item.basePrice;
    const cfg = item.customization || {};

    Object.entries(cfg).forEach(([key, opt]) => {
        const value = selections?.[key];

        if (opt.type === "radio") {
            const selected = opt.options?.find((o: any) => o.id === value);
            if (typeof selected?.price === "number") price += selected.price;
        }

        if (opt.type === "checkbox") {
            const ids = Array.isArray(value) ? value : [];
            const freeCount = opt.freeCount || 0;
            const extraPrice = opt.extraPrice || 0;
            const extraCount = Math.max(0, ids.length - freeCount);
            price += extraCount * extraPrice;

            ids.forEach((id: string) => {
                const selected = opt.options?.find((o: any) => o.id === id);
                if (typeof selected?.price === "number") price += selected.price;
            });
        }

        if (opt.type === "checkbox-group") {
            const ids = Array.isArray(value) ? value : [];
            ids.forEach((id: string) => {
                const selected = opt.options?.find((o: any) => o.id === id);
                if (selected && !selected.included && typeof selected.price === "number") price += selected.price;
            });
        }
    });

    return price;
}

function Toast({ message }: { message: string | null }) {
    if (!message) return null;
    return (
        <div className="fixed left-0 right-0 top-20 z-[90]">
            <div className="mx-auto w-full max-w-md px-4">
                <div className="animate-fade-in rounded-2xl bg-black/60 px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl backdrop-blur">
                    {message}
                </div>
            </div>
        </div>
    );
}

function DarkSheet({ open, title, children, onClose }: { open: boolean; title?: string; children: React.ReactNode; onClose: () => void }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[80]">
            <button
                type="button"
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
                aria-label="Close"
            />
            <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6">
                <div
                    className="animate-slide-up max-h-[90dvh] overflow-auto rounded-t-3xl border border-white/10 bg-[#2C3E50] md:max-h-[85dvh] md:w-full md:max-w-2xl md:rounded-3xl"
                    style={{ backgroundColor: COLORS.header }}
                >
                    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[#2C3E50] p-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/15"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex-1 text-center text-lg font-extrabold text-white">{title}</div>
                        <div className="w-9" />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}



// ... (keeping imports and helpers as is, just invalidating this block for rename)

function MenuContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Map legacy params or default to 'all'
    const initialCategory =
        searchParams.get('tab') === 'drinks' ? 'Boissons' :
            searchParams.get('tab') === 'food' ? 'Snacks' :
                'all';

    const [activeKey, setActiveKey] = useState(initialCategory);
    const [toast, setToast] = useState<string | null>(null);

    const { items: cart, addItem, removeItem, setQuantity, total, itemCount } = useCart();
    const { openCart, isCartOpen, closeCart, openCheckout } = useUI();

    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [selections, setSelections] = useState<any>({});

    // Update active key if tab param changes
    React.useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'drinks' && activeKey !== 'Boissons') setActiveKey('Boissons');
    }, [searchParams]);

    React.useEffect(() => {
        if (!toast) return;
        const t = window.setTimeout(() => setToast(null), 1200);
        return () => window.clearTimeout(t);
    }, [toast]);

    const featured = useMemo(() => COMPLETE_MENU.find((m) => m.isFeatured), []);

    // Filter list based on the active category
    const list = useMemo(() => {
        if (activeKey === 'all') return COMPLETE_MENU.filter(item => !item.isFeatured);
        return COMPLETE_MENU.filter(item => item.category === activeKey);
    }, [activeKey]);

    const handleItemClick = (item: MenuItem) => {
        if (!item.available) return;

        if (item.customizable) {
            setCustomizeItem(item);
            setSelections(initSelections(item));
            return;
        }

        addItem({
            id: item.id.toString(),
            name: item.name,
            totalPrice: item.basePrice,
            price: item.basePrice,
            quantity: 1,
            image: item.image
        });
        setToast("Ajouté au panier!");
    };

    const customizationPrice = useMemo(() => {
        if (!customizeItem) return 0;
        return calcPrice(customizeItem, selections);
    }, [customizeItem, selections]);

    return (
        <div className="min-h-dvh pb-28 md:pb-20" style={{ backgroundColor: COLORS.bg }}>
            <Toast message={toast} />

            {/* Categories Sticky Header - REPLACED WITH UNIFIED STYLE */}
            <div className="sticky top-[60px] z-30 bg-[#1A2332] -mx-4 px-4 border-b border-white/5 pb-2" style={{ backgroundColor: COLORS.bg }}>
                <div className="mx-auto w-full max-w-5xl overflow-x-auto scrollbar-hide touch-pan-x">
                    <div className="flex items-center gap-3 py-2 min-w-max px-1">
                        {restaurantCategories.map((c) => {
                            const active = c.id === activeKey;
                            const count = c.id === 'all'
                                ? COMPLETE_MENU.length
                                : COMPLETE_MENU.filter(i => i.category === c.id).length;

                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setActiveKey(c.id)}
                                    className={classNames(
                                        "flex-shrink-0 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-extrabold transition-all duration-200",
                                        active
                                            ? "border-white/30 text-white shadow-lg scale-105"
                                            : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                    )}
                                    style={active ? {
                                        background: "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)",
                                        boxShadow: "0 4px 15px rgba(234,179,8,0.15)",
                                        borderColor: COLORS.gold
                                    } : undefined}
                                    aria-pressed={active}
                                >
                                    <span className="flex items-center gap-2">
                                        {c.label}
                                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                                            {count}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-5xl px-0 mt-4">
                {featured && activeKey === 'all' ? (

                    <section className="px-0 pt-2 mb-6">
                        <button
                            type="button"
                            onClick={() => handleItemClick(featured)}
                            className="relative block h-64 w-full overflow-hidden rounded-2xl text-left shadow-2xl sm:h-96"
                            aria-label={`Open ${featured.name}`}
                        >
                            <img
                                src={featured.image}
                                alt={featured.name}
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-8">
                                <div
                                    className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-extrabold sm:px-3 sm:py-1 sm:text-sm"
                                    style={{ backgroundColor: COLORS.gold, color: "#000" }}
                                >
                                    {featured.badge}
                                </div>
                                <div className="mt-2 text-2xl font-extrabold leading-tight sm:mt-3 sm:text-4xl">{featured.name}</div>
                                <div className="mt-1 max-w-xl text-xs text-white/90 line-clamp-2 sm:mt-2 sm:text-base">{featured.description}</div>

                                <div className="mt-3 flex items-center justify-between sm:mt-5">
                                    <div className="text-xl font-extrabold sm:text-3xl" style={{ color: COLORS.gold }}>
                                        {formatDh(featured.basePrice)}
                                    </div>
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-2xl transition active:scale-95 sm:h-14 sm:w-14"
                                        style={{ backgroundColor: COLORS.red }}
                                    >
                                        <Plus className="h-5 w-5 sm:h-7 sm:w-7" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    </section>
                ) : null}

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-2xl bg-[#2C3E50] shadow-xl border border-white/5 flex flex-col"
                            style={{ backgroundColor: COLORS.header }}
                        >
                            <button
                                type="button"
                                onClick={() => handleItemClick(item)}
                                className="flex flex-col h-full w-full text-left"
                                aria-label={`Open ${item.name}`}
                            >
                                {/* Image Section: BIG & PREMIUM */}
                                <div className="relative h-56 w-full shrink-0 sm:h-64">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {!item.available ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                            <div className="text-lg font-extrabold text-white">Épuisé</div>
                                        </div>
                                    ) : null}
                                    <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                                        ⏱️ {item.prepTime}
                                    </div>
                                </div>

                                {/* Content Section: SPACIOUS & BOLD */}
                                <div className="flex flex-1 flex-col justify-between p-5">
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="text-xl font-extrabold leading-tight text-white sm:text-2xl">
                                                {item.name}
                                            </div>
                                        </div>
                                        <div className="mt-2 line-clamp-2 text-sm text-slate-400 font-medium">
                                            {item.description}
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between">
                                        <div className="text-2xl font-extrabold" style={{ color: COLORS.gold }}>
                                            {item.basePrice.toFixed(0)}.00 <span className="text-sm font-bold text-white/60">DH</span>
                                        </div>

                                        <div
                                            className={classNames(
                                                "flex h-12 w-12 items-center justify-center rounded-full text-white shadow-2xl transition-transform active:scale-90 touch-manipulation",
                                                item.available ? "hover:brightness-110" : "cursor-not-allowed opacity-50"
                                            )}
                                            style={{ backgroundColor: COLORS.red }}
                                        >
                                            <Plus className="h-6 w-6 stroke-[3]" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* Customization Sheet */}
            <DarkSheet
                open={!!customizeItem}
                title="Customize"
                onClose={() => setCustomizeItem(null)}
            >
                {customizeItem ? (
                    <div className="p-4 pb-10">
                        <div className="overflow-hidden rounded-2xl mb-4">
                            <img
                                src={customizeItem.image}
                                alt={customizeItem.name}
                                className="h-48 w-full object-cover"
                                loading="lazy"
                            />
                        </div>

                        <div className="mt-4 rounded-2xl bg-[#1A2332] p-4" style={{ backgroundColor: COLORS.bg }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-lg font-extrabold text-white">{customizeItem.name}</div>
                                    <div className="mt-1 text-sm" style={{ color: COLORS.gray }}>
                                        {customizeItem.description}
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-extrabold text-white">
                                    <Coffee className="h-4 w-4" /> {customizeItem.prepTime}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4">
                            {Object.entries(customizeItem.customization || {}).map(([key, opt]: [string, any]) => {
                                const value = selections[key];

                                return (
                                    <div
                                        key={key}
                                        className="rounded-2xl bg-[#1A2332] p-4"
                                        style={{ backgroundColor: COLORS.bg }}
                                    >
                                        <div className="mb-3 flex items-center gap-2">
                                            <div className="text-sm font-extrabold text-white">{opt.label}</div>
                                            {opt.required ? <div className="text-xs font-extrabold text-red-300">*</div> : null}
                                        </div>

                                        {opt.type === "stepper" ? (
                                            <div className="flex items-center justify-center gap-4 rounded-xl bg-white/5 p-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelections((s: any) => ({
                                                            ...s,
                                                            [key]: Math.max(opt.min ?? 0, (s[key] ?? opt.default ?? 0) - 1)
                                                        }))
                                                    }
                                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl font-extrabold text-white hover:bg-white/15"
                                                >
                                                    −
                                                </button>
                                                <div className="min-w-[90px] text-center text-2xl font-extrabold text-white">
                                                    {value ?? opt.default} <span className="text-xs" style={{ color: COLORS.gray }}>{opt.unit || ""}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelections((s: any) => ({
                                                            ...s,
                                                            [key]: Math.min(opt.max ?? 99, (s[key] ?? opt.default ?? 0) + 1)
                                                        }))
                                                    }
                                                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-extrabold text-white hover:brightness-110"
                                                    style={{ backgroundColor: COLORS.red }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : null}

                                        {opt.type === "radio" ? (
                                            <div className="grid gap-2">
                                                {opt.options.map((o: any) => {
                                                    const selected = value === o.id;
                                                    return (
                                                        <button
                                                            key={o.id}
                                                            type="button"
                                                            onClick={() => setSelections((s: any) => ({ ...s, [key]: o.id }))}
                                                            className={classNames(
                                                                "flex items-center justify-between rounded-xl p-4 text-left transition",
                                                                selected ? "border border-white/20 bg-white/10" : "border border-white/0 bg-white/5 hover:bg-white/10"
                                                            )}
                                                            aria-pressed={selected}
                                                        >
                                                            <div className="text-sm font-bold text-white">{o.label}</div>
                                                            <div className="flex items-center gap-3">
                                                                {typeof o.price === "number" && o.price !== 0 ? (
                                                                    <div className="text-sm font-extrabold" style={{ color: COLORS.gold }}>
                                                                        {o.price > 0 ? `+${o.price} DH` : `${o.price} DH`}
                                                                    </div>
                                                                ) : null}
                                                                <span
                                                                    className={classNames("h-5 w-5 rounded-full", selected ? "bg-red-600" : "bg-white/20")}
                                                                    style={selected ? { backgroundColor: COLORS.red } : undefined}
                                                                />
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : null}

                                        {opt.type === "checkbox" || opt.type === "checkbox-group" ? (
                                            <div className="grid gap-2">
                                                {opt.freeCount ? (
                                                    <div className="rounded-xl bg-white/5 px-4 py-3 text-xs font-semibold" style={{ color: COLORS.gray }}>
                                                        {opt.freeCount} inclus{opt.freeCount > 1 ? "es" : ""}, +{opt.extraPrice} DH par supplément
                                                    </div>
                                                ) : null}
                                                {opt.options.map((o: any) => {
                                                    const ids = Array.isArray(value) ? value : [];
                                                    const selected = ids.includes(o.id);
                                                    const disabled = opt.type === 'checkbox-group' && o.included && o.removable === false;

                                                    return (
                                                        <button
                                                            key={o.id}
                                                            type="button"
                                                            disabled={disabled}
                                                            onClick={() => {
                                                                setSelections((s: any) => {
                                                                    const cur = Array.isArray(s[key]) ? s[key] : [];
                                                                    const next = selected ? cur.filter((x: any) => x !== o.id) : [...cur, o.id];
                                                                    return { ...s, [key]: next };
                                                                });
                                                            }}
                                                            className={classNames(
                                                                "flex items-center justify-between rounded-xl p-4 text-left",
                                                                disabled ? "cursor-not-allowed bg-white/5 opacity-60" : "bg-white/5 hover:bg-white/10",
                                                                selected && !disabled ? "border border-white/20 bg-white/10" : ""
                                                            )}
                                                            aria-pressed={selected}
                                                        >
                                                            <div className="text-sm font-bold text-white">{o.label}</div>
                                                            <div className="flex items-center gap-3">
                                                                {typeof o.price === "number" && o.price > 0 ? (
                                                                    <div className="text-sm font-extrabold" style={{ color: COLORS.gold }}>
                                                                        +{o.price} DH
                                                                    </div>
                                                                ) : null}
                                                                <span
                                                                    className={classNames("h-5 w-5 rounded", selected ? "bg-red-600" : "bg-white/20")}
                                                                    style={selected ? { backgroundColor: COLORS.red } : undefined}
                                                                />
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}

                            <div className="rounded-2xl bg-[#1A2332] p-4" style={{ backgroundColor: COLORS.bg }}>
                                <div className="mb-3 text-sm font-extrabold text-white">Instructions Spéciales (Optionnel)</div>
                                <textarea
                                    value={selections.special_instructions || ""}
                                    onChange={(e) => setSelections((s: any) => ({ ...s, special_instructions: e.target.value }))}
                                    rows={3}
                                    placeholder="Ex: Pas épicé, bien cuit, sans oignon..."
                                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-red-600"
                                />
                            </div>
                        </div>

                        <div className="sticky bottom-0 mt-6 rounded-2xl border border-white/10 bg-[#2C3E50] p-4 backdrop-blur-xl" style={{ backgroundColor: COLORS.header }}>
                            <div className="text-center mb-3">
                                <div className="text-xs font-bold" style={{ color: COLORS.gray }}>
                                    Total Price
                                </div>
                                <div className="mt-1 text-3xl font-extrabold" style={{ color: COLORS.gold }}>
                                    {formatDh(customizationPrice)}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const cfg = customizeItem.customization || {};
                                    const meta = Object.keys(cfg)
                                        .map((k) => {
                                            const opt = cfg[k];
                                            const v = selections[k];
                                            if (opt.type === "radio") {
                                                const o = opt.options?.find((x: any) => x.id === v);
                                                return `${opt.label}: ${o?.label || v}`;
                                            }
                                            if (opt.type === "stepper") return `${opt.label}: ${v} ${opt.unit || ""}`;
                                            if (opt.type === "checkbox" || opt.type === "checkbox-group") {
                                                const ids = Array.isArray(v) ? v : [];
                                                const labels = ids
                                                    .map((id: string) => opt.options?.find((x: any) => x.id === id)?.label || id)
                                                    .join(", ");
                                                return `${opt.label}: ${labels || "None"}`;
                                            }
                                            return null;
                                        })
                                        .filter(Boolean)
                                        .join(" · ");

                                    addItem({
                                        id: customizeItem.id.toString(),
                                        name: customizeItem.name,
                                        price: customizationPrice,
                                        totalPrice: customizationPrice,
                                        image: customizeItem.image,
                                        meta: meta,
                                        quantity: 1
                                    });
                                    setToast("Ajouté au panier!");
                                    setCustomizeItem(null);
                                }}
                                className="w-full rounded-xl py-4 text-lg font-extrabold text-white transition hover:brightness-110 active:scale-[0.99]"
                                style={{ backgroundColor: COLORS.red }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ) : null}
            </DarkSheet>
        </div>
    );
}

export default function MenuPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading Menu...</div>}>
            <MenuContent />
        </React.Suspense>
    );
}
