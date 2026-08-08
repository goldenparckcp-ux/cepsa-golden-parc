"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCheck, Clock, AlertTriangle, Sparkles, Car, RotateCcw, ChevronRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface NotificationItem {
    id: string;
    created_at: string;
    type: 'promo' | 'personal' | 'cancellation_warning' | 'arrival_check';
    title: string;
    message: string;
    booking_id?: string;
    booking_table?: string;
    is_read: boolean;
    action_type?: 'none' | 'cancel_prompt' | 'delay_prompt' | 'link';
    metadata?: any;
}

export function NotificationCenter({ className = "" }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'alerts' | 'promos'>('all');
    const [loading, setLoading] = useState(false);

    // Interactive Modals
    const [delayModalNotif, setDelayModalNotif] = useState<NotificationItem | null>(null);
    const [selectedDelay, setSelectedDelay] = useState<number>(30);
    const [isUpdatingDelay, setIsUpdatingDelay] = useState(false);
    const [delaySuccessMsg, setDelaySuccessMsg] = useState('');

    const [cancelModalNotif, setCancelModalNotif] = useState<NotificationItem | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelMsg, setCancelMsg] = useState('');

    const fetchNotifications = useCallback(async () => {
        try {
            const userPhone = typeof window !== 'undefined' ? localStorage.getItem('user_phone') : null;
            const url = userPhone ? `/api/notifications?phone=${encodeURIComponent(userPhone)}` : '/api/notifications';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success && Array.isArray(data.notifications)) {
                setNotifications(data.notifications);
            }
        } catch (err) {
            console.warn("Error fetching notifications:", err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Check for automated 50m / 30m alerts on mount & interval
        fetch('/api/notifications/check-alerts').catch(() => {});

        const interval = setInterval(() => {
            fetchNotifications();
            fetch('/api/notifications/check-alerts').catch(() => {});
        }, 20000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_read', id })
            });
        } catch {}
    };

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_all_read' })
            });
        } catch {}
    };

    // Handler for 30-min Arrival Delay Update
    const handleConfirmDelay = async (notif: NotificationItem, minutes: number) => {
        if (!notif.booking_id || !notif.booking_table) return;
        setIsUpdatingDelay(true);
        setDelaySuccessMsg('');

        try {
            const res = await fetch('/api/notifications/delay-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: notif.booking_id,
                    tableName: notif.booking_table,
                    delayMinutes: minutes,
                    customNotes: minutes > 0 ? `Signalement retard client +${minutes} min` : "Client à l'heure"
                })
            });

            const data = await res.json();
            if (data.success) {
                setDelaySuccessMsg(`✅ ${data.message}`);
                markAsRead(notif.id);
                setTimeout(() => {
                    setDelayModalNotif(null);
                    setDelaySuccessMsg('');
                    fetchNotifications();
                }, 2000);
            } else {
                alert(data.error || "Erreur lors de la mise à jour");
            }
        } catch (err: any) {
            alert("Erreur réseau: " + err.message);
        } finally {
            setIsUpdatingDelay(false);
        }
    };

    // Handler for 50-min Cancellation Warning Action
    const handleConfirmCancellation = async (notif: NotificationItem) => {
        if (!notif.booking_id || !notif.booking_table) return;
        setIsCancelling(true);
        setCancelMsg('');

        try {
            const res = await fetch('/api/bookings/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: notif.booking_id,
                    tableName: notif.booking_table
                })
            });

            const data = await res.json();
            if (data.success) {
                setCancelMsg(`✅ ${data.message}`);
                markAsRead(notif.id);
                setTimeout(() => {
                    setCancelModalNotif(null);
                    setCancelMsg('');
                    fetchNotifications();
                }, 2500);
            } else {
                alert(data.error || "Impossible d'annuler la réservation");
            }
        } catch (err: any) {
            alert("Erreur réseau: " + err.message);
        } finally {
            setIsCancelling(false);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'alerts') return n.type === 'cancellation_warning' || n.type === 'arrival_check';
        if (activeTab === 'promos') return n.type === 'promo';
        return true;
    });

    return (
        <div className={`relative ${className}`}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95 group shadow-lg"
                aria-label="Centre de notifications"
            >
                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 text-amber-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-lg animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Slide-over Drawer / Center Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0F172A] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

                        {/* Drawer Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#111827]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <Bell className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Notifications & Alertes</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Golden Parc Realtime System</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Category Tabs & Actions */}
                        <div className="p-4 border-b border-white/5 bg-[#0F172A] flex items-center justify-between gap-2">
                            <div className="flex gap-1.5 bg-[#1E293B] p-1 rounded-xl border border-white/5">
                                {[
                                    { id: 'all', label: 'Tous' },
                                    { id: 'alerts', label: 'Alertes' },
                                    { id: 'promos', label: 'Promos' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-amber-500 text-black shadow-md'
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase tracking-wider"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" /> Tout lire
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                            {filteredNotifications.length === 0 ? (
                                <div className="text-center py-16 text-gray-500 flex flex-col items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-gray-600 animate-pulse" />
                                    <p className="text-xs font-bold uppercase tracking-wider">Aucune notification disponible</p>
                                </div>
                            ) : (
                                filteredNotifications.map(notif => {
                                    const isAlertCancel = notif.type === 'cancellation_warning';
                                    const isAlertDelay = notif.type === 'arrival_check';

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className={`p-4 rounded-2xl border transition-all duration-200 relative group ${
                                                !notif.is_read
                                                    ? 'bg-[#1E293B]/90 border-amber-500/30 shadow-lg shadow-amber-500/5'
                                                    : 'bg-[#111827]/60 border-white/5 text-gray-400'
                                            }`}
                                        >
                                            {!notif.is_read && (
                                                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                            )}

                                            <div className="flex items-start gap-3 mb-2">
                                                <div className={`p-2 rounded-xl shrink-0 ${
                                                    isAlertCancel ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    isAlertDelay ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {isAlertCancel ? <AlertTriangle className="w-4 h-4" /> :
                                                     isAlertDelay ? <Car className="w-4 h-4" /> :
                                                     <Sparkles className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h4 className="text-xs font-black text-white leading-snug truncate">{notif.title}</h4>
                                                    <span className="text-[9px] text-gray-500 font-bold block mt-0.5">
                                                        {new Date(notif.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-gray-300 leading-relaxed font-medium mb-3 pl-1">
                                                {notif.message}
                                            </p>

                                            {/* Interactive Action Triggers */}
                                            {isAlertDelay && (
                                                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConfirmDelay(notif, 0);
                                                        }}
                                                        className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider"
                                                    >
                                                        À l'heure (~30m)
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConfirmDelay(notif, 30);
                                                        }}
                                                        className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider"
                                                    >
                                                        Retard +30 min
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDelayModalNotif(notif);
                                                        }}
                                                        className="px-2.5 py-1.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider"
                                                    >
                                                        Autre...
                                                    </button>
                                                </div>
                                            )}

                                            {isAlertCancel && (
                                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCancelModalNotif(notif);
                                                        }}
                                                        className="w-full py-2 bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                                                    >
                                                        <AlertTriangle className="w-3.5 h-3.5" /> Annuler maintenant (Remboursement)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Delay Selection Modal */}
            {delayModalNotif && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#111827] border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                <Car className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Signaler un retard</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Ajustement en temps réel</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed font-medium">
                            Combien de temps de retard prévoyez-vous pour votre commande ? La cuisine adaptera la préparation.
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                            {[15, 30, 45, 60, 90, 120].map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => setSelectedDelay(mins)}
                                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                                        selectedDelay === mins
                                            ? 'bg-amber-500 text-black border-amber-400 shadow-lg'
                                            : 'bg-[#1E293B] text-white border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    +{mins} min
                                </button>
                            ))}
                        </div>

                        {delaySuccessMsg ? (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 font-bold text-center">
                                {delaySuccessMsg}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDelayModalNotif(null)}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-400 font-bold text-xs rounded-xl hover:text-white"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => handleConfirmDelay(delayModalNotif, selectedDelay)}
                                    disabled={isUpdatingDelay}
                                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:from-amber-400 disabled:opacity-50"
                                >
                                    {isUpdatingDelay ? 'Enregistrement...' : 'Confirmer le retard'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancellation Confirmation Modal */}
            {cancelModalNotif && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#111827] border border-red-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Confirmer l'annulation</h3>
                                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-0.5">Dernières 5 minutes du délai</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed font-medium">
                            Êtes-vous sûr de vouloir annuler votre réservation ? Votre paiement sera recrédité automatiquement selon nos conditions.
                        </p>

                        {cancelMsg ? (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 font-bold text-center">
                                {cancelMsg}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCancelModalNotif(null)}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-400 font-bold text-xs rounded-xl hover:text-white"
                                >
                                    Conserver
                                </button>
                                <button
                                    onClick={() => handleConfirmCancellation(cancelModalNotif)}
                                    disabled={isCancelling}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg disabled:opacity-50"
                                >
                                    {isCancelling ? 'Traitement...' : 'Oui, Annuler'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
