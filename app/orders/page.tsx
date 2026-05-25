"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UtensilsCrossed, Droplets, Hotel, Waves, LogIn, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function statusColor(type: string, status: string) {
    const s = status.toLowerCase();
    if (s === 'pending' || s === 'scheduled' || s === 'reserved') return "bg-yellow-500/20 text-yellow-500";
    if (s === 'preparing' || s === 'in_progress' || s === 'active') return "bg-red-500/20 text-red-500";
    if (s === 'ready' || s === 'checked_in') return "bg-green-500/20 text-green-500";
    if (s === 'completed' || s === 'checked_out') return "bg-gray-500/20 text-gray-500";
    return "bg-white/10 text-white/60";
}

function TypeIcon({ type }: { type: string }) {
    const cls = "h-4 w-4";
    if (type === "restaurant") return <UtensilsCrossed className={cls} />;
    if (type === "lavage") return <Droplets className={cls} />;
    if (type === "pool") return <Waves className={cls} />;
    return <Hotel className={cls} />;
}

interface Order {
    id: string;
    type: string;
    summary: string;
    date: string;
    status: string;
}

export default function OrdersPage() {
    const router = useRouter();
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = useCallback(async (userId: string, contactInfo: string) => {
        // Construct OR query: user_id matches OR contact info matches
        const query = `user_id.eq.${userId},customer_phone.eq.${contactInfo}`;

        // 1. Restaurant
        const { data: rest } = await supabase.from('restaurant_orders').select('*').or(query);
        // 2. Services
        const { data: serv } = await supabase.from('service_bookings').select('*').or(query);
        // 3. Hotel
        const { data: hotel } = await supabase.from('hotel_reservations').select('*').or(query);
        // 4. Pool
        const { data: pool } = await supabase.from('pool_bookings').select('*').or(query);

        const all: Order[] = [
            ...(rest || []).map(x => ({ ...x, type: 'restaurant', summary: `#${x.order_number} · ${x.items.length} items`, date: x.created_at })),
            ...(serv || []).map(x => ({ ...x, type: x.service_type, summary: `${x.service_name || x.service_type} · ${x.scheduled_date || new Date(x.scheduled_time || x.created_at).toLocaleDateString()}`, date: x.created_at })),
            ...(hotel || []).map(x => ({ ...x, type: 'hotel', summary: `Room ${x.room_number || '?'} · ${x.room_type}`, date: x.created_at })),
            ...(pool || []).map(x => ({ ...x, type: 'pool', summary: `Pool Access · ${x.time_slot}`, date: x.created_at })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setOrders(all);
    }, []);

    const checkAuth = useCallback(async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Get profile data
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            // Determine best display identifier
            const displayId = profile?.phone || profile?.email || user.email || 'Client';
            setVerifiedPhone(displayId);

            // Fetch orders using BOTH user_id and contact info (phone/email)
            await fetchOrders(user.id, displayId);
        }
        setIsLoading(false);
    }, [fetchOrders]);

    useEffect(() => {
        const init = async () => {
            await Promise.resolve();
            void checkAuth();
        };
        void init();
    }, [checkAuth]);

    return (
        <div className="grid gap-4 p-4 pb-24 min-h-screen bg-[#0F172A]">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.push('/profile')}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95"
                    title="Retour au profil"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 rounded-2xl border border-white/10 p-4 shadow-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A]">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-lg font-extrabold text-white leading-none">Mes Commandes</div>
                            <div className="mt-1 text-sm text-gray-400">Suivi en temps réel</div>
                        </div>
                        <LayoutDashboard className="w-6 h-6 text-white/20" />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-white/60 animate-pulse">
                    Chargement...
                </div>
            ) : !verifiedPhone ? (
                <div className="rounded-2xl border border-white/10 p-8 flex flex-col items-center justify-center text-center space-y-4 bg-[#1E293B]">
                    <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                        <LogIn className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Connexion Requise</h3>
                        <p className="text-sm text-gray-400 mt-2">
                            Veuillez vous connecter pour voir l&apos;historique de vos commandes.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/profile?redirect=/orders')}
                        className="w-full py-3 bg-red-600 rounded-xl font-bold text-white shadow-lg hover:brightness-110 transition-all"
                    >
                        Se Connecter
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 p-4 bg-[#1E293B]">
                        <div className="text-xs text-white/60">Compte:</div>
                        <div className="text-sm font-extrabold text-white">{verifiedPhone}</div>
                        {/* Optional Logout or Profile Link could go here */}
                    </div>

                    <div className="grid gap-3">
                        {orders.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
                                Aucune commande trouvée.
                            </div>
                        ) : (
                            orders.map((o) => (
                                <div key={o.id} className="rounded-2xl border border-white/10 p-4 bg-[#1E293B]">
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
