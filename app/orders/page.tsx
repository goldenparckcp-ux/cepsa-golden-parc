"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Phone, UtensilsCrossed, Droplets, Hotel, Headphones, Car, Waves } from "lucide-react";
import { useUI } from "@/lib/state/UIContext";
import { COLORS } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

function statusColor(type: string, status: string) {
    const s = status.toLowerCase();
    if (s === 'pending' || s === 'scheduled' || s === 'reserved') return "bg-yellow-500/20 text-yellow-500";
    if (s === 'preparing' || s === 'in_progress' || s === 'active') return "bg-blue-500/20 text-blue-500";
    if (s === 'ready' || s === 'checked_in') return "bg-green-500/20 text-green-500";
    if (s === 'completed' || s === 'checked_out') return "bg-gray-500/20 text-gray-500";
    return "bg-white/10 text-white/60";
}

function TypeIcon({ type }: { type: string }) {
    const cls = "h-4 w-4";
    if (type === "restaurant") return <UtensilsCrossed className={cls} />;
    if (type === "lavage") return <Droplets className={cls} />;
    if (type === "mecanique") return <Car className={cls} />;
    if (type === "pool") return <Waves className={cls} />;
    return <Hotel className={cls} />;
}

export default function OrdersPage() {
    const { requirePhone } = useUI();
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!verifiedPhone) return;

        const fetchData = async () => {
            const p = verifiedPhone;

            // 1. Restaurant
            const { data: rest } = await supabase.from('restaurant_orders').select('*').eq('customer_phone', p);
            // 2. Services
            const { data: serv } = await supabase.from('service_bookings').select('*').eq('customer_phone', p);
            // 3. Hotel
            const { data: hotel } = await supabase.from('hotel_reservations').select('*').eq('customer_phone', p);
            // 4. Pool
            const { data: pool } = await supabase.from('pool_bookings').select('*').eq('customer_phone', p);

            const all = [
                ...(rest || []).map(x => ({ ...x, type: 'restaurant', summary: `#${x.order_number} · ${x.items.length} items`, date: x.created_at })),
                ...(serv || []).map(x => ({ ...x, type: x.service_type, summary: `${x.service_name || x.service_type} · ${x.scheduled_date || new Date(x.scheduled_time).toLocaleDateString()}`, date: x.created_at })),
                ...(hotel || []).map(x => ({ ...x, type: 'hotel', summary: `Room ${x.room_number || '?'} · ${x.room_type}`, date: x.created_at })),
                ...(pool || []).map(x => ({ ...x, type: 'pool', summary: `Pool Access · ${x.time_slot}`, date: x.created_at })),
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setOrders(all);
        };

        fetchData();

        // Subscription would be complex here for multiple tables, so just polling or Manual Refresh for now
    }, [verifiedPhone]);

    return (
        <div className="grid gap-4 p-4 pb-24 min-h-screen" style={{ backgroundColor: COLORS.bgDark }}>
            <div className="rounded-2xl border border-white/10 p-4 shadow-2xl" style={{ backgroundColor: COLORS.bgCard }}>
                <div className="text-lg font-extrabold text-white">Mes Commandes</div>
                <div className="mt-1 text-sm text-gray-400">Suivi en temps réel</div>
            </div>

            {!verifiedPhone ? (
                <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: COLORS.bgCard }}>
                    <div className="flex items-start gap-3">
                        <div className="rounded-2xl p-3 text-white bg-red-600">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-extrabold text-white">Entrez votre numéro</div>
                            <div className="mt-1 text-xs text-white/60">Pour voir vos commandes et réservations actives.</div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Numéro de téléphone</label>
                        <input
                            type="tel"
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500 transition mb-4"
                            placeholder="+212..."
                            id="phone-input"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const val = (document.getElementById('phone-input') as HTMLInputElement).value;
                                if (val) setVerifiedPhone(val);
                            }}
                            className="w-full rounded-xl px-4 py-3 text-sm font-extrabold text-black hover:brightness-110"
                            style={{ backgroundColor: COLORS.statusPending }}
                        >
                            Voir mes commandes
                        </button>
                    </div>

                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 p-4" style={{ backgroundColor: COLORS.bgCard }}>
                        <div className="text-xs text-white/60">Connecté:</div>
                        <div className="text-sm font-extrabold text-white">{verifiedPhone}</div>
                        <button
                            type="button"
                            onClick={() => setVerifiedPhone(null)}
                            className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
                        >
                            Changer
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {orders.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
                                Aucune commande trouvée pour ce numéro.
                            </div>
                        ) : (
                            orders.map((o) => (
                                <div key={o.id} className="rounded-2xl border border-white/10 p-4" style={{ backgroundColor: COLORS.bgCard }}>
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-2xl bg-white/5 p-3 text-white">
                                            <TypeIcon type={o.type} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-extrabold text-white capitalize">{o.type}</div>
                                            <div className="mt-1 text-xs text-white/60">{o.summary}</div>
                                            <div className="mt-2 text-xs font-medium text-gray-500">
                                                {new Date(o.date).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className={"ml-auto rounded-xl px-3 py-2 text-xs font-extrabold capitalize " + statusColor(o.type, o.status)}>
                                            {o.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
