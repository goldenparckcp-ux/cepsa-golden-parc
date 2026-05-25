"use client";

import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";

interface PhoneFlowState {
    open: boolean;
    reason: string | null;
    onVerified: ((phone: string) => void) | null;
}

interface UIContextType {
    language: string;
    toggleLanguage: () => void;
    activeCustomization: unknown;
    openCustomization: (menuItem: unknown) => void;
    closeCustomization: () => void;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    isCheckoutOpen: boolean;
    openCheckout: () => void;
    closeCheckout: () => void;
    phoneFlow: PhoneFlowState;
    requirePhone: (options: { reason: string; onVerified?: (phone: string) => void }) => void;
    closePhone: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState("FR");

    const [activeCustomization, setActiveCustomization] = useState<unknown>(null);
    const [isCartOpen, setCartOpen] = useState(false);
    const [isCheckoutOpen, setCheckoutOpen] = useState(false);
    const [phoneFlow, setPhoneFlow] = useState<PhoneFlowState>({ open: false, reason: null, onVerified: null });

    const toggleLanguage = () => setLanguage((l) => (l === "FR" ? "AR" : "FR"));

    const openCustomization = (menuItem: unknown) => setActiveCustomization(menuItem);
    const closeCustomization = () => setActiveCustomization(null);

    const openCart = () => setCartOpen(true);
    const closeCart = () => setCartOpen(false);

    const openCheckout = () => {
        setCartOpen(false);
        setCheckoutOpen(true);
    };
    const closeCheckout = () => setCheckoutOpen(false);

    const requirePhone = ({ reason, onVerified }: { reason: string; onVerified?: (phone: string) => void }) => {
        setPhoneFlow({ open: true, reason: reason || null, onVerified: onVerified || null });
    };

    const closePhone = () => setPhoneFlow({ open: false, reason: null, onVerified: null });

    const value = useMemo(() => {
        return {
            language,
            toggleLanguage,
            activeCustomization,
            openCustomization,
            closeCustomization,
            isCartOpen,
            openCart,
            closeCart,
            isCheckoutOpen,
            openCheckout,
            closeCheckout,
            phoneFlow,
            requirePhone,
            closePhone,
        };
    }, [language, activeCustomization, isCartOpen, isCheckoutOpen, phoneFlow]);

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error("useUI must be used within UIProvider");
    return ctx;
}
