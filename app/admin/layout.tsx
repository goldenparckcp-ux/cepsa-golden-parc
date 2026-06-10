"use client";

import React, { useState, useEffect } from "react";
import { Lock, LayoutDashboard, Utensils, Bed, Ticket, DollarSign, PlusCircle, LogOut, ExternalLink, Menu, X, Shield, RefreshCw, QrCode } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface StaffSession {
    role: 'admin' | 'hotel' | 'kitchen' | 'services';
    name: string;
    phone?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    // Session and Auth State
    const [isHydrated, setIsHydrated] = useState(false);
    const [session, setSession] = useState<StaffSession | null>(null);
    const [pin, setPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Dynamic Database Stats to show off in real-time
    const [dbStatus, setDbStatus] = useState<"connected" | "checking" | "fallback">("checking");

    useEffect(() => {
        setIsHydrated(true);
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.role && parsed.role !== "admin") {
                    // Send staff members to their dedicated standalone views
                    if (parsed.role === "hotel") router.push("/staff/hotel");
                    else if (parsed.role === "kitchen") router.push("/staff/restaurant");
                    else if (parsed.role === "services") router.push("/staff/pool-services");
                    else router.push("/staff");
                } else {
                    setSession(parsed);
                }
            } catch (e) {
                localStorage.removeItem("staff_session");
            }
        }

        // Test Supabase connection
        const checkDb = async () => {
            try {
                const { error } = await supabase.from("profiles").select("id").limit(1);
                if (error) throw error;
                setDbStatus("connected");
            } catch (err) {
                console.warn("Using smart fallback values due to local DB connection:", err);
                setDbStatus("fallback");
            }
        };
        checkDb();
    }, []);

    const handlePinInput = (num: string) => {
        if (pin.length < 4) {
            setErrorMsg("");
            setPin(prev => prev + num);
        }
    };

    const handlePinDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handlePinClear = () => {
        setPin("");
        setErrorMsg("");
    };

    // PIN Submission
    useEffect(() => {
        if (pin.length === 4) {
            verifyPin(pin);
        }
    }, [pin]);

    const verifyPin = async (enteredPin: string) => {
        setIsChecking(true);
        setErrorMsg("");

        try {
            // 1. Try Supabase staff table if possible
            if (dbStatus === "connected") {
                const { data: staffMember, error } = await supabase
                    .from("staff")
                    .select("*")
                    .eq("pin_hash", enteredPin) // Simple representation or hash check
                    .single();

                if (!error && staffMember) {
                    const newSession: StaffSession = {
                        role: staffMember.role as any,
                        name: staffMember.name || "Personnel",
                        phone: staffMember.phone
                    };
                    localStorage.setItem("staff_session", JSON.stringify(newSession));
                    setSession(newSession);
                    setPin("");
                    setIsChecking(false);
                    return;
                }
            }

            // 2. Double-Safety Hardcoded fallbacks (Super Robust!)
            let resolvedSession: StaffSession | null = null;
            if (enteredPin === "7777") {
                resolvedSession = { role: "admin", name: "Directeur" };
            } else if (["1111", "2222", "3333"].includes(enteredPin)) {
                setErrorMsg("Accès Admin réservé. Veuillez utiliser le portail Staff (/staff) pour vous connecter.");
                setPin("");
                setIsChecking(false);
                return;
            }

            if (resolvedSession) {
                localStorage.setItem("staff_session", JSON.stringify(resolvedSession));
                setSession(resolvedSession);
                setPin("");
                router.push("/admin");
            } else {
                setErrorMsg("Code PIN incorrect ou réservé aux administrateurs.");
                setPin("");
            }
        } catch (err) {
            setErrorMsg("Erreur réseau. Essai hors ligne...");
            setPin("");
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("staff_session");
        setSession(null);
        router.push("/admin");
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-sm text-gray-400 font-bold">Chargement du système sécurisé...</p>
                </div>
            </div>
        );
    }

    // 1. RENDER PIN CODE SCREEN IF NOT AUTHENTICATED
    if (!session) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#1E293B] rounded-3xl border border-white/10 p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 mb-6">
                        <Lock className="w-8 h-8 text-black" />
                    </div>

                    <h2 className="text-2xl font-black text-white text-center mb-1">Portail Staff Cepsa</h2>
                    <p className="text-xs text-gray-400 text-center mb-8 font-medium">Saisissez votre code PIN pour accéder au panneau</p>

                    {/* PIN Display Indicators */}
                    <div className="flex gap-4 mb-8">
                        {[0, 1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full border transition-all duration-150 ${
                                    pin.length > i
                                        ? "bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-500/30"
                                        : "border-white/20 bg-transparent"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Error display */}
                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-center text-red-400 font-bold text-xs mb-6 w-full animate-shake">
                            {errorMsg}
                        </div>
                    )}

                    {/* Numeric PIN Pad */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-8">
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                            <button
                                key={num}
                                onClick={() => handlePinInput(num)}
                                disabled={isChecking}
                                className="aspect-square bg-white/5 hover:bg-white/10 active:scale-95 text-white font-bold text-xl rounded-2xl border border-white/5 transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handlePinClear}
                            disabled={isChecking}
                            className="aspect-square bg-transparent hover:bg-white/5 text-gray-400 font-bold text-xs rounded-2xl transition-all flex items-center justify-center"
                        >
                            EFFACER
                        </button>
                        <button
                            onClick={() => handlePinInput("0")}
                            disabled={isChecking}
                            className="aspect-square bg-white/5 hover:bg-white/10 active:scale-95 text-white font-bold text-xl rounded-2xl border border-white/5 transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            0
                        </button>
                        <button
                            onClick={handlePinDelete}
                            disabled={isChecking}
                            className="aspect-square bg-transparent hover:bg-white/5 text-gray-400 font-bold text-sm rounded-2xl transition-all flex items-center justify-center"
                        >
                            RETOUR
                        </button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        <span className={`w-2 h-2 rounded-full ${dbStatus === "connected" ? "bg-green-500" : dbStatus === "checking" ? "bg-amber-500 animate-pulse" : "bg-blue-500"}`} />
                        <span className="text-[10px] font-bold text-gray-400">
                            {dbStatus === "connected" ? "Supabase Live" : dbStatus === "checking" ? "Connexion..." : "Mode Résilient Actif"}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // 2. RENDER THE SECURED PANEL INTERFACE
    const userRole = session.role;

    // Define navigation items based on role
    const allNavItems = [
        {
            href: "/admin",
            label: "Vue Générale",
            icon: LayoutDashboard,
            roles: ["admin"]
        },
        {
            href: "/admin/restaurant",
            label: "Cuisine (Resto)",
            icon: Utensils,
            roles: ["admin"]
        },
        {
            href: "/admin/hotel",
            label: "Hôtel",
            icon: Bed,
            roles: ["admin"]
        },
        {
            href: "/admin/pool-services",
            label: "Piscine & Services",
            icon: Ticket,
            roles: ["admin"]
        },
        {
            href: "/admin/prices",
            label: "Modifier les Prix",
            icon: DollarSign,
            roles: ["admin"]
        },
        {
            href: "/admin/qrcodes",
            label: "QR Codes",
            icon: QrCode,
            roles: ["admin"]
        }
    ];

    const activeNavItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col md:flex-row text-white">
            {/* MOBILE HEADER */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#1E293B] border-b border-white/10 z-30 sticky top-0">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <span className="font-black text-sm uppercase tracking-wider text-white">Golden Park Staff</span>
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/10">
                        {session.role.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push("/")}
                        className="p-2 bg-white/5 border border-white/5 rounded-lg text-gray-300 hover:text-white"
                        title="Voir le site client"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 bg-white/5 border border-white/5 rounded-lg"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* MOBILE SIDEBAR DROPDOWN */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-[61px] bg-[#1E293B] border-b border-white/10 z-20 flex flex-col p-4 gap-2 animate-fade-in shadow-2xl">
                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-2 px-3">
                        Connecté en tant que : {session.name}
                    </div>
                    {activeNavItems.map(item => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <button
                                key={item.href}
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    router.push(item.href);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border ${
                                    active
                                        ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10"
                                        : "bg-transparent border-transparent text-gray-300 hover:bg-white/5"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        );
                    })}
                    <div className="border-t border-white/5 my-2 pt-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Se Déconnecter
                        </button>
                    </div>
                </div>
            )}

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 bg-[#1E293B] border-r border-white/10 p-6 shrink-0 relative">
                {/* Brand header */}
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                        <Shield className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h1 className="font-black text-white text-sm uppercase leading-tight tracking-wider">Golden Park</h1>
                        <span className="text-[10px] text-amber-500 font-black tracking-widest uppercase">Admin Panel</span>
                    </div>
                </div>

                {/* Session Profile Card */}
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 mb-6">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Opérateur</div>
                    <div className="font-bold text-white text-sm truncate">{session.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase">
                            Session {session.role}
                        </span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-1.5">
                    {activeNavItems.map(item => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <button
                                key={item.href}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all border ${
                                    active
                                        ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10"
                                        : "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Controls */}
                <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                    <button
                        onClick={() => router.push("/")}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                    >
                        <span className="flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Vue Client
                        </span>
                        <span>→</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Se Déconnecter</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 bg-[#0F172A] p-4 md:p-8 overflow-y-auto min-h-0">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
