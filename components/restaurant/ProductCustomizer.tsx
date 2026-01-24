"use client";

import React, { useState, useMemo } from "react";
import { Coffee } from "lucide-react";
import { MenuItem } from "@/lib/types/menu";
import { initSelections, calcPrice } from "@/lib/utils/menu";
import { CartItem } from "@/lib/state/CartContext";

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

interface ProductCustomizerProps {
    item: MenuItem;
    onAddToCart: (cartItem: CartItem) => void;
    onClose?: () => void;
}

export function ProductCustomizer({ item, onAddToCart, onClose }: ProductCustomizerProps) {
    const [selections, setSelections] = useState<any>(() => initSelections(item));

    const customizationPrice = useMemo(() => {
        return calcPrice(item, selections);
    }, [item, selections]);

    const handleAddToCart = () => {
        const cfg = item.customization || {};
        const parts = Object.keys(cfg)
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
            .filter(Boolean);

        if (selections.special_instructions) {
            parts.push(`Note: ${selections.special_instructions}`);
        }

        const meta = parts.join(" · ");

        onAddToCart({
            id: item.id.toString(),
            name: item.name,
            price: customizationPrice,
            totalPrice: customizationPrice,
            image: item.image,
            meta: meta,
            quantity: 1,
            customizations: selections
        });
    };

    return (
        <div className="p-4 pb-10">
            <div className="overflow-hidden rounded-2xl mb-4 shadow-lg border border-white/10">
                <img
                    src={item.image}
                    alt={item.name}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                />
            </div>

            <div className="mt-4 rounded-2xl bg-[#1A2332] p-4" style={{ backgroundColor: COLORS.bg }}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-lg font-extrabold text-white">{item.name}</div>
                        <div className="mt-1 text-sm text-white/60">
                            {item.description}
                        </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-extrabold text-white">
                        <Coffee className="h-4 w-4" /> {item.prepTime}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid gap-4">
                {Object.entries(item.customization || {}).map(([key, opt]: [string, any]) => {
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
                                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl font-extrabold text-white hover:bg-white/15 active:scale-95 transition-all"
                                    >
                                        −
                                    </button>
                                    <div className="min-w-[90px] text-center text-2xl font-extrabold text-white">
                                        {value ?? opt.default} <span className="text-xs text-white/50">{opt.unit || ""}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelections((s: any) => ({
                                                ...s,
                                                [key]: Math.min(opt.max ?? 99, (s[key] ?? opt.default ?? 0) + 1)
                                            }))
                                        }
                                        className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-extrabold text-white hover:brightness-110 active:scale-95 transition-all shadow-lg"
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
                                                    "flex items-center justify-between rounded-xl p-4 text-left transition-all duration-200",
                                                    selected ? "border border-white/20 bg-white/10 shadow-lg" : "border border-white/0 bg-white/5 hover:bg-white/10"
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
                                                        className={classNames("h-5 w-5 rounded-full ring-2 ring-offset-2 ring-offset-[#1A2332] ring-transparent transition-all", selected ? "bg-red-600 ring-red-600/30" : "bg-white/20")}
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
                                        <div className="rounded-xl bg-white/5 px-4 py-3 text-xs font-semibold text-white/50">
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
                                                    "flex items-center justify-between rounded-xl p-4 text-left transition-all duration-200",
                                                    disabled ? "cursor-not-allowed bg-white/5 opacity-60" : "bg-white/5 hover:bg-white/10",
                                                    selected && !disabled ? "border border-white/20 bg-white/10 shadow-lg" : ""
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
                                                        className={classNames("h-5 w-5 rounded ring-2 ring-offset-2 ring-offset-[#1A2332] ring-transparent transition-all", selected ? "bg-red-600 ring-red-600/30" : "bg-white/20")}
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
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-white/30"
                    />
                </div>
            </div>

            <div className="sticky bottom-0 mt-6 rounded-2xl border border-white/10 bg-[#2C3E50] p-4 backdrop-blur-xl shadow-2xl z-20" style={{ backgroundColor: COLORS.header }}>
                <div className="text-center mb-3">
                    <div className="text-xs font-bold text-white/50">
                        Total Price
                    </div>
                    <div className="mt-1 text-3xl font-extrabold" style={{ color: COLORS.gold }}>
                        {formatDh(customizationPrice)}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full rounded-xl py-4 text-lg font-extrabold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-lg shadow-red-600/20"
                    style={{ backgroundColor: COLORS.red }}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
