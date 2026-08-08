"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bell, X, AlertTriangle, Car, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ToastAlert {
    id: string;
    title: string;
    message: string;
    type: 'promo' | 'personal' | 'cancellation_warning' | 'arrival_check';
}

interface NotificationToastContextType {
    showToast: (toast: Omit<ToastAlert, 'id'>) => void;
}

const NotificationToastContext = createContext<NotificationToastContextType | undefined>(undefined);

export function NotificationToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastAlert[]>([]);

    const showToast = (toast: Omit<ToastAlert, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastAlert = { ...toast, id };
        setToasts(prev => [newToast, ...prev.slice(0, 2)]); // Keep max 3

        // Play audio chime
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
            audio.volume = 0.4;
            audio.play().catch(() => {});
        } catch {}

        // Auto dismiss after 7 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 7000);
    };

    useEffect(() => {
        // Real-time subscription to notifications table
        const channel = supabase
            .channel('public_notifications_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    const newNotif = payload.new;
                    if (newNotif && newNotif.title && newNotif.message) {
                        showToast({
                            title: newNotif.title,
                            message: newNotif.message,
                            type: newNotif.type || 'personal'
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <NotificationToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map(toast => {
                    const isCancel = toast.type === 'cancellation_warning';
                    const isDelay = toast.type === 'arrival_check';

                    return (
                        <div
                            key={toast.id}
                            className="pointer-events-auto p-4 rounded-2xl bg-[#111827]/95 border border-white/10 backdrop-blur-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-5 duration-300"
                        >
                            <div className={`p-2 rounded-xl shrink-0 ${
                                isCancel ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                isDelay ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                                {isCancel ? <AlertTriangle className="w-4 h-4" /> :
                                 isDelay ? <Car className="w-4 h-4" /> :
                                 <Sparkles className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                                <h4 className="text-xs font-black text-white leading-snug">{toast.title}</h4>
                                <p className="text-[11px] text-gray-300 font-medium leading-relaxed mt-0.5">{toast.message}</p>
                            </div>

                            <button
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="text-gray-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </NotificationToastContext.Provider>
    );
}

export function useNotificationToast() {
    const context = useContext(NotificationToastContext);
    if (!context) {
        throw new Error('useNotificationToast must be used within NotificationToastProvider');
    }
    return context;
}
