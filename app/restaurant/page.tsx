"use client";

import React, { useMemo, useState } from "react";
import { Plus, Minus, ShoppingCart, X, UtensilsCrossed, Phone, CheckCircle, ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/state/CartContext";
import { useUI } from "@/lib/state/UIContext";
import { COMPLETE_MENU, restaurantCategories, MenuItem } from "@/lib/types/menu";
import { COLORS } from "@/lib/theme";
import { DarkSheet } from "@/components/ui/DarkSheet";
import { supabase } from "@/lib/supabase";

function formatDh(price: number) {
    return `${price.toFixed(2)} DH`;
}

// ... Initial Selections Helper ...
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
        if (opt.type === "checkbox" || opt.type === "checkbox-group") {
            const ids = Array.isArray(value) ? value : [];
            ids.forEach((id: string) => {
                const selected = opt.options?.find((o: any) => o.id === id);
                if (selected && !selected.included && typeof selected.price === "number") price += selected.price;
            });
        }
    });
    return price;
}

export default function RestaurantPage() {
    const router = useRouter();
    const { items, addItem, removeItem, clear, total, itemCount } = useCart();
    const { requirePhone } = useUI();

    const [activeCategory, setActiveCategory] = useState("all"); // "all"
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selections, setSelections] = useState<any>({});
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter Items
    const displayItems = useMemo(() => {
        if (activeCategory === "all" || activeCategory === "Restaurant") return COMPLETE_MENU;
        // Map category IDs
        return COMPLETE_MENU.filter(i => i.category === activeCategory);
    }, [activeCategory]);

    const handleItemClick = (item: MenuItem) => {
        if (!item.available) return;
        setCustomizeItem(item);
        setSelections(initSelections(item));
    };

    const customizationPrice = useMemo(() => {
        if (!customizeItem) return 0;
        return calcPrice(customizeItem, selections);
    }, [customizeItem, selections]);

    const handleAddToCart = () => {
        if (!customizeItem) return;

        // Generate Meta String
        const cfg = customizeItem.customization || {};
        const metaParts: string[] = [];
        Object.keys(cfg).forEach((k) => {
            const opt = cfg[k];
            const v = selections[k];
            if (opt.type === "radio") {
                const o = opt.options?.find((x: any) => x.id === v);
                if (o) metaParts.push(`${opt.label}: ${o.label}`);
            }
            if (opt.type === "stepper" && v > 0) metaParts.push(`${opt.label}: ${v} ${opt.unit || ""}`);
            if ((opt.type === "checkbox" || opt.type === "checkbox-group") && Array.isArray(v) && v.length > 0) {
                const labels = v.map((id: string) => opt.options?.find((x: any) => x.id === id)?.label || id).join(", ");
                metaParts.push(`${opt.label}: ${labels}`);
            }
        });
        if (selections.special_instructions) metaParts.push(`Note: ${selections.special_instructions}`);

        addItem({
            id: `${customizeItem.id}-${Date.now()}`,
            name: customizeItem.name,
            image: customizeItem.image,
            basePrice: customizeItem.basePrice,
            price: customizationPrice, // Unit Price (customized)
            totalPrice: customizationPrice, // For logic consistency
            quantity: 1,
            customizations: selections,
            meta: metaParts.join(" · ")
        });

        setCustomizeItem(null);
    };

    const handleCheckout = async () => {
        if (items.length === 0) return;
        if (!phone) {
            alert("Veuillez entrer votre numéro de téléphone");
            return;
        }

        setIsSubmitting(true);
        const orderNum = `CMD-${Date.now().toString().slice(-6)}`;

        const { error } = await supabase.from('restaurant_orders').insert({
            order_number: orderNum,
            customer_phone: phone,
            items: items,
            status: 'pending',
            subtotal: total,
            total_price: total,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error(error);
            alert("Erreur lors de la commande: " + error.message);
            setIsSubmitting(false);
        } else {
            alert(`Commande envoyée en cuisine ! #${orderNum}`);
            clear();
            setIsCartOpen(false);
            router.push('/orders'); // Go to tracking
        }
    };

    return (
        <div className="min-h-screen pb-40 bg-[#0F172A]" style={{ backgroundColor: COLORS.bgDark }}>

            {/* Header Categories */}
            <div className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 pt-4 pb-2 px-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl shadow-lg shadow-red-500/20">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white leading-none">Menu</h1>
                            <p className="text-xs text-gray-400 mt-1">Restaurant & Café</p>
                        </div>
                    </div>
                    {/* Mini Cart Button */}
                    {itemCount > 0 && (
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-bold text-white animate-pulse"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>{itemCount}</span>
                            <span>{formatDh(total)}</span>
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                    <div className="flex gap-2 min-w-max">
                        {restaurantCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeCategory === cat.id
                                        ? "bg-white text-black border-white shadow-lg scale-105"
                                        : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayItems.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        Aucun article trouvé dans cette catégorie.
                    </div>
                )}
                {displayItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="group bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden text-left flex flex-col hover:border-white/20 transition-all shadow-lg hover:shadow-2xl"
                    >
                        <div className="h-48 relative overflow-hidden w-full">
                            <img src={item.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                            {item.badge && (
                                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                                    {item.badge}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent opacity-80" />
                            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                <div className="text-2xl font-black text-white drop-shadow-md">{formatDh(item.basePrice)}</div>
                                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                                    <Plus className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 pt-2 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white leading-tight mb-2">{item.name}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Customization Sheet */}
            <DarkSheet open={!!customizeItem} onClose={() => setCustomizeItem(null)} title="Personnaliser">
                {customizeItem && (
                    <div className="p-5 pb-32 space-y-6">
                        <div className="flex items-start gap-4 mb-6">
                            <img src={customizeItem.image} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                            <div>
                                <h2 className="text-xl font-bold text-white">{customizeItem.name}</h2>
                                <div className="text-amber-500 font-extrabold text-lg">{formatDh(customizationPrice)}</div>
                            </div>
                        </div>

                        {/* Options Render */}
                        {Object.entries(customizeItem.customization || {}).map(([key, opt]: [string, any]) => (
                            <div key={key} className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{opt.label}</h3>
                                <div className="grid gap-2">
                                    {opt.options?.map((subOpt: any) => {
                                        const isSelected = Array.isArray(selections[key])
                                            ? selections[key].includes(subOpt.id)
                                            : selections[key] === subOpt.id;

                                        return (
                                            <button
                                                key={subOpt.id}
                                                onClick={() => {
                                                    if (opt.type === 'radio') setSelections({ ...selections, [key]: subOpt.id });
                                                    if (opt.type.includes('checkbox')) {
                                                        const current = selections[key] || [];
                                                        const next = current.includes(subOpt.id)
                                                            ? current.filter((x: any) => x !== subOpt.id)
                                                            : [...current, subOpt.id];
                                                        setSelections({ ...selections, [key]: next });
                                                    }
                                                }}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'bg-white/10 border-white text-white' : 'bg-white/5 border-transparent text-gray-400'
                                                    }`}
                                            >
                                                <span>{subOpt.label}</span>
                                                {subOpt.price ? <span className="text-xs text-amber-500">+{subOpt.price} DH</span> : null}
                                            </button>
                                        );
                                    })}

                                    {opt.type === 'stepper' && (
                                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl justify-center">
                                            <button onClick={() => setSelections({ ...selections, [key]: Math.max(opt.min || 0, selections[key] - 1) })} className="w-10 h-10 rounded-full bg-white/10">-</button>
                                            <span className="font-bold text-xl">{selections[key]}</span>
                                            <button onClick={() => setSelections({ ...selections, [key]: Math.min(opt.max || 10, selections[key] + 1) })} className="w-10 h-10 rounded-full bg-white text-black">+</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Instructions Spéciales</h3>
                            <textarea
                                value={selections.special_instructions}
                                onChange={e => setSelections({ ...selections, special_instructions: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-white/30"
                                placeholder="Sans oignons, sauce à part..."
                            />
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A] p-4 border-t border-white/10 z-50 safe-area-bottom">
                            <button
                                onClick={handleAddToCart}
                                className="w-full py-4 bg-red-600 rounded-xl font-black text-lg text-white shadow-lg shadow-red-600/30 active:scale-95 transition-transform"
                            >
                                Ajouter - {formatDh(customizationPrice)}
                            </button>
                        </div>
                    </div>
                )}
            </DarkSheet>

            {/* Cart & Checkout Sheet */}
            <DarkSheet open={isCartOpen} onClose={() => setIsCartOpen(false)} title="Votre Panier">
                <div className="p-5 pb-32 flex flex-col h-full min-h-[60vh]">
                    {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-60">
                            <ShoppingCart className="w-16 h-16 mb-4" />
                            <p>Votre panier est vide</p>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-4 overflow-y-auto mb-6">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                                    <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden shrink-0">
                                        <img src={item.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-white truncate">{item.name}</h4>
                                            <button onClick={() => removeItem(item.id!)} className="text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2 my-1 leading-relaxed">{item.meta}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-amber-500 font-bold">{formatDh(item.price! * (item.quantity || 1))}</div>
                                            {/* Quantity not editable in this simple version yet, assuming 1 per add or custom quantity */}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Numéro de Téléphone</label>
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 mt-2">
                                        <Phone className="w-5 h-5 text-gray-500" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="06..."
                                            className="bg-transparent text-white w-full outline-none font-bold"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2 ml-1">Requis pour le suivi de commande.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A] p-4 border-t border-white/10 z-50 safe-area-bottom">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="text-gray-400">Total</span>
                            <span className="text-2xl font-black text-white">{formatDh(total)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting || items.length === 0 || !phone}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-black text-lg text-white shadow-lg disabled:opacity-50 disabled:grayscale transition-all"
                        >
                            {isSubmitting ? "Envoi..." : "Commander Maintenant"}
                        </button>
                    </div>
                </div>
            </DarkSheet>

            {/* Floating Cart Button */}
            {itemCount > 0 && !isCartOpen && !customizeItem && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-slide-up w-full max-w-sm px-4">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full bg-[#1E293B] border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center justify-between backdrop-blur-xl"
                        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                                {itemCount}
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">Panier en cours</div>
                                <div className="text-xs text-gray-400">Voir les articles</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-black text-white">{formatDh(total)}</span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                    </button>
                </div>
            )}

        </div>
    );
}
