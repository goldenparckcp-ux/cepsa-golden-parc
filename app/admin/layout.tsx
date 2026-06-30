"use client";

import React, { useState, useEffect } from "react";
import { Lock, LayoutDashboard, Utensils, Bed, Ticket, DollarSign, PlusCircle, LogOut, ExternalLink, Menu, X, Shield, RefreshCw, QrCode, Image as ImageIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { adminDb } from "@/lib/admin-api";

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
                const { error } = await adminDb("profiles").select("id").limit(1);
                if (error) throw error;
                setDbStatus("connected");
            } catch (err) {
                console.warn("Using smart fallback values due to local DB connection:", err);
                setDbStatus("fallback");
            }
        };
        checkDb();

        // Auto-refresh to bypass Next.js client router cache when focusing window
        const onFocus = () => {
            router.refresh();
        };
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [router]);

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
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: enteredPin }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || "Code PIN incorrect");
                setPin("");
                return;
            }

            const sess = {
                role: data.role,
                name: data.name,
                phone: data.phone
            } as StaffSession;

            setSession(sess);
            localStorage.setItem("staff_session", JSON.stringify(sess));
            
            // Redirect based on role if they login from here
            if (data.role !== "admin") {
                if (data.role === "hotel") router.push("/staff/hotel");
                else if (data.role === "kitchen") router.push("/staff/restaurant");
                else if (data.role === "services") router.push("/staff/pool-services");
                else router.push("/staff");
            }

        } catch (error) {
            setErrorMsg("Erreur de connexion serveur");
            setPin("");
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = () => {
        setSession(null);
        localStorage.removeItem("staff_session");
        router.push("/admin");
    };

    if (!isHydrated) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center"><RefreshCw className="w-8 h-8 text-amber-500 animate-spin" /></div>;

    // 1. RENDER THE LOGIN SCREEN IF NOT AUTHENTICATED OR NOT ADMIN
    if (!session || session.role !== "admin") {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="bg-[#111827]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col items-center">
                    
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6 rotate-3">
                        <Lock className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Accès Sécurisé</h1>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-8 text-center">
                        Espace Réservé à l'Administration
                    </p>

                    {/* PIN Display */}
                    <div className="flex justify-center gap-4 mb-8">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all duration-300 ${
                                pin.length > i 
                                    ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110' 
                                    : 'bg-[#0B0F19] border border-white/10 text-transparent'
                            }`}>
                                {pin.length > i ? "•" : ""}
                            </div>
                        ))}
                    </div>

                    {errorMsg && (
                        <div className="text-red-400 text-xs font-bold uppercase tracking-wide mb-6 bg-red-500/10 py-2 px-4 rounded-lg flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {errorMsg}
                        </div>
                    )}

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-4 w-full mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => handlePinInput(num.toString())}
                                disabled={isChecking}
                                className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 flex items-center justify-center text-xl font-black text-white transition-all active:scale-95 disabled:opacity-50"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handlePinClear}
                            disabled={isChecking}
                            className="h-16 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                        >
                            EFFACER
                        </button>
                        <button
                            onClick={() => handlePinInput("0")}
                            disabled={isChecking}
                            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 flex items-center justify-center text-xl font-black text-white transition-all active:scale-95 disabled:opacity-50"
                        >
                            0
                        </button>
                        <button
                            onClick={handlePinDelete}
                            disabled={isChecking}
                            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-50"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <button
                        onClick={() => router.push("/")}
                        className="text-gray-500 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 mt-4"
                    >
                        <ExternalLink className="w-3 h-3" /> Retour au site
                    </button>
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
            label: "Piscine",
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
            href: "/admin/hero",
            label: "Gestion Sliders (Hero)",
            icon: ImageIcon,
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
        <div className="min-h-screen bg-[#0B0F19] flex flex-col md:flex-row text-white font-sans selection:bg-amber-500/30 selection:text-amber-200">
            {/* MOBILE HEADER */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-white/5 z-30 sticky top-0">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <span className="font-black text-sm uppercase tracking-wider text-white">GP Admin</span>
                    <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-500/20 shadow-inner">
                        {session.role.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/")}
                        className="p-2 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                        title="Voir le site client"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 bg-white/5 border border-white/5 rounded-xl text-white transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* MOBILE SIDEBAR DROPDOWN */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-[69px] bg-[#0B0F19]/95 backdrop-blur-3xl border-b border-white/5 z-20 flex flex-col p-4 gap-2 animate-fade-in shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-2 px-3 flex items-center justify-between">
                        <span>Opérateur: {session.name}</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
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
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-sm transition-all border ${
                                    active
                                        ? "bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20 text-amber-400"
                                        : "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}`} />
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
            <aside className="hidden md:flex flex-col w-64 bg-[#111827]/80 backdrop-blur-3xl border-r border-white/5 p-6 shrink-0 relative z-10">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-sm uppercase tracking-wider text-white leading-tight">Golden Park</h2>
                        <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Espace Staff</div>
                    </div>
                </div>

                <div className="mb-8 p-3 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1">Opérateur Actif</div>
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                        {session.name}
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                    <div className="text-[9px] text-amber-400 font-black uppercase tracking-widest mt-1 bg-amber-500/10 inline-block px-2 py-0.5 rounded-full border border-amber-500/20">
                        Rôle: {session.role}
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-2">Menu Principal</div>
                    {activeNavItems.map(item => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <button
                                key={item.href}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-sm transition-all group relative overflow-hidden ${
                                    active
                                        ? "bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 text-amber-400"
                                        : "bg-transparent border border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
                                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                    <button
                        onClick={() => router.push("/")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Voir le site
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
                
                {/* Connection Status Indicator */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-default">
                    <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)]' : 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,1)]'}`} />
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{dbStatus === 'connected' ? 'DB: ONLINE' : 'DB: LOCAL'}</span>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-x-hidden relative">
                {/* Decorative background elements for main area */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
                
                <div className="relative z-10 h-full p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
