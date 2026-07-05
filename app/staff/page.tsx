"use client";

import React, { useState, useEffect } from "react";
import { Lock, Smartphone, Users, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

interface StaffSession {
    role: 'hotel' | 'kitchen' | 'services' | 'caisse' | 'admin';
    name: string;
}

export default function StaffLoginPage() {
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // If already logged in, redirect to respective portal
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            try {
                const session = JSON.parse(stored);
                if (session.role === "hotel") router.push("/staff/hotel");
                else if (session.role === "kitchen") router.push("/staff/restaurant");
                else if (session.role === "services") router.push("/staff/pool-services");
                else if (session.role === "caisse") router.push("/staff/caisse");
                else if (session.role === "admin") router.push("/admin");
            } catch (e) {
                localStorage.removeItem("staff_session");
            }
        }
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

    // Auto-verify when PIN reaches 4 digits
    useEffect(() => {
        if (pin.length === 4) {
            verifyStaffPin(pin);
        }
    }, [pin]);

    const verifyStaffPin = async (enteredPin: string) => {
        setIsChecking(true);
        setErrorMsg("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: enteredPin }),
            });

            const resData = await response.json();

            if (!response.ok || !resData.success) {
                setErrorMsg(resData.error || "Code PIN incorrect.");
                setPin("");
                setIsChecking(false);
                return;
            }

            // Block admin from staff portal — admin should use /admin
            if (resData.role === 'admin') {
                setErrorMsg("Ce code est réservé à l'administration. Utilisez /admin.");
                setPin("");
                setIsChecking(false);
                return;
            }

            // Role mapping and session preparation
            const resolvedSession: StaffSession = {
                role: resData.role,
                name: resData.name || `Staff ${resData.role}`
            };

            localStorage.setItem("staff_session", JSON.stringify(resolvedSession));
            setPin("");

            // Redirect based on role
            if (resolvedSession.role === "hotel") router.push("/staff/hotel");
            else if (resolvedSession.role === "kitchen") router.push("/staff/restaurant");
            else if (resolvedSession.role === "services" || resolvedSession.role === "caisse") {
                if (resolvedSession.name.includes("Caisse") || resolvedSession.role === "caisse") {
                    router.push("/staff/caisse");
                } else {
                    router.push("/staff/pool-services");
                }
            }
            
        } catch (err) {
            console.error(err);
            setErrorMsg("Une erreur réseau s'est produite.");
            setPin("");
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A13] flex items-center justify-center p-4 text-white overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full bg-[#1E293B]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
                <div className="w-16 h-16 bg-gradient-to-tr from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/10 mb-6">
                    <Smartphone className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-black text-white text-center mb-1">Portail Employés (Staff)</h2>
                <p className="text-xs text-gray-400 text-center mb-8 font-medium">Saisissez votre mot de passe pour accéder à votre interface</p>

                {/* Error display */}
                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-center text-red-400 font-bold text-xs mb-6 w-full animate-shake">
                        {errorMsg}
                    </div>
                )}

                {/* Password Input Form */}
                <form 
                    className="w-full max-w-[280px] mb-4 flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (pin.length >= 4) {
                            verifyStaffPin(pin);
                        }
                    }}
                >
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => {
                            setPin(e.target.value);
                            setErrorMsg("");
                        }}
                        disabled={isChecking}
                        placeholder="Mot de passe..."
                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-500 text-center text-lg"
                    />
                    
                    <button
                        type="submit"
                        disabled={isChecking || pin.length < 4}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 active:scale-95"
                    >
                        {isChecking ? "Vérification..." : "Connexion"}
                    </button>
                </form>

            </div>
        </div>
    );
}
