"use client";

import React, { createContext, useContext, useMemo, useReducer, ReactNode } from "react";

export interface CartItem {
    id?: string;
    name: string;
    price?: number;
    totalPrice: number;
    quantity?: number;
    image?: string;
    meta?: string;
    customizations?: Record<string, unknown>;
    [key: string]: unknown;
}

interface CartState {
    items: CartItem[];
}

type CartAction =
    | { type: "ADD"; item: CartItem }
    | { type: "REMOVE"; id: string }
    | { type: "SET_QTY"; id: string; quantity: number }
    | { type: "CLEAR" };

function calcTotals(items: CartItem[]) {
    const itemCount = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
    const total = items.reduce((acc, i) => acc + i.totalPrice * (i.quantity || 1), 0);
    return { itemCount, total };
}

function uid() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    total: number;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    setQuantity: (id: string, quantity: number) => void;
    clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function reducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "ADD": {
            const { item } = action;
            const newItem = {
                ...item,
                id: item.id || uid(),
                quantity: item.quantity || 1,
            };
            return { ...state, items: [newItem, ...state.items] };
        }
        case "REMOVE": {
            return { ...state, items: state.items.filter((i) => i.id !== action.id) };
        }
        case "SET_QTY": {
            const items = state.items
                .map((i) => (i.id === action.id ? { ...i, quantity: action.quantity } : i))
                .filter((i) => (i.quantity || 0) > 0);
            return { ...state, items };
        }
        case "CLEAR": {
            return { ...state, items: [] };
        }
        default:
            return state;
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    // Initialize from LocalStorage
    const [state, dispatch] = useReducer(reducer, { items: [] }, (initial) => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('golden_cart');
            if (saved) {
                try {
                    return { items: JSON.parse(saved) };
                } catch (e) { console.error("Failed to parse cart", e); }
            }
        }
        return initial;
    });

    // Save to LocalStorage on change
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('golden_cart', JSON.stringify(state.items));
        }
    }, [state.items]);

    const totals = useMemo(() => calcTotals(state.items), [state.items]);

    const value = useMemo(() => {
        return {
            items: state.items,
            itemCount: totals.itemCount,
            total: totals.total,
            addItem: (item: CartItem) => dispatch({ type: "ADD", item }),
            removeItem: (id: string) => dispatch({ type: "REMOVE", id }),
            setQuantity: (id: string, quantity: number) => dispatch({ type: "SET_QTY", id, quantity }),
            clear: () => dispatch({ type: "CLEAR" }),
        };
    }, [state.items, totals.itemCount, totals.total]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
