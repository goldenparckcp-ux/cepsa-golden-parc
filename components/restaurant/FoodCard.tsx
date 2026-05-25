"use client";

import React from "react";
import { Plus, Clock, Star, Zap } from "lucide-react";
import Image from "next/image";
import { MenuItem } from "@/lib/types/menu";

interface FoodCardProps {
    item: MenuItem;
    onSelect: (item: MenuItem) => void;
}

export function FoodCard({ item, onSelect }: FoodCardProps) {
    return (
        <div
            className="group overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]"
            style={{
                background: "linear-gradient(135deg, #111f37 0%, #1a2942 100%)",
                backdropFilter: "blur(10px)"
            }}
        >
            <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(item)}
                className="block w-full text-left outline-none cursor-pointer"
                aria-label={`Open ${item.name}`}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onSelect(item);
                    }
                }}
            >
                {/* Big Premium Image */}
                <div className="relative h-56 w-full overflow-hidden bg-black/10 sm:h-72">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#111f37] via-transparent to-transparent opacity-90" />

                    <div className="absolute left-3 top-3 flex gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/10">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            <span>{item.prepTime}</span>
                        </div>
                        {item.badge && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-[#0f172a] shadow-lg shadow-amber-500/20">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                <span>{item.badge}</span>
                            </div>
                        )}
                    </div>

                    {!item.available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                            <div className="rounded-xl bg-red-600 px-6 py-2 text-lg font-extrabold text-white transform -rotate-6 border-2 border-white/20">
                                OUT OF STOCK
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 -mt-6 relative z-10">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="text-xl font-extrabold text-white leading-tight sm:text-3xl">
                                {item.name}
                            </div>
                        </div>

                        <div className="line-clamp-2 text-sm text-red-200/80 font-medium leading-relaxed sm:text-base">
                            {item.description}
                        </div>

                        {item.customizable && (
                            <div className="inline-flex items-center gap-1.5 self-start rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                                <Zap className="h-3 w-3 fill-current" />
                                <span>Customizable</span>
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-amber-400 sm:text-3xl tracking-tight">
                                    {item.basePrice}<span className="text-sm font-bold text-amber-400/60 ml-1">DH</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onSelect(item);
                                }}
                                disabled={!item.available}
                                className={[
                                    "flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 active:scale-90",
                                    item.available
                                        ? "hover:scale-110 hover:shadow-red-500/40 hover:brightness-110"
                                        : "cursor-not-allowed opacity-50 grayscale"
                                ].join(" ")}
                                style={{
                                    background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                                    boxShadow: "0 8px 20px -4px rgba(220, 38, 38, 0.5)"
                                }}
                                aria-label="Add to cart"
                            >
                                <Plus className="h-6 w-6 stroke-[3]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
