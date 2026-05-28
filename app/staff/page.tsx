"use client";

import React, { useState, useEffect } from "react";
import { Lock, Smartphone, Users, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface StaffSession {
    role: 'hotel' | 'kitchen' | 'services';
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

    const verifyStaffPin = (enteredPin: string) => {
        setIsChecking(true);
        setErrorMsg("");

        let resolvedSession: StaffSession | null = null;

        if (enteredPin === "1111") {
            resolvedSession = { role: "hotel", name: "Réception Hôtel" };
        } else if (enteredPin === "2222") {
            resolvedSession = { role: "kitchen", name: "Chef Cuisine" };
        } else if (enteredPin === "3333") {
            resolvedSession = { role: "services", name: "Staff Piscine & Services" };
        } else if (enteredPin === "7777") {
            setErrorMsg("Ce code PIN est réservé à l'administrateur. Veuillez utiliser le portail Admin (/admin).");
            setPin("");
            setIsChecking(false);
            return;
        }

        if (resolvedSession) {
            localStorage.setItem("staff_session", JSON.stringify(resolvedSession));
            setPin("");
            
            // Redirect based on role
            if (resolvedSession.role === "hotel") router.push("/staff/hotel");
            else if (resolvedSession.role === "kitchen") router.push("/staff/restaurant");
            else if (resolvedSession.role === "services") router.push("/staff/pool-services");
        } else {
            setErrorMsg("Code PIN incorrect. Veuillez contacter l'administrateur.");
            setPin("");
        }
        setIsChecking(false);
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
                <p className="text-xs text-gray-400 text-center mb-8 font-medium">Saisissez votre code PIN pour accéder à votre interface</p>

                {/* PIN Display Indicators */}
                <div className="flex gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border transition-all duration-150 ${
                                pin.length > i
                                    ? "bg-red-500 border-red-500 scale-110 shadow-lg shadow-red-500/30"
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

                {/* Help Links */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400">
                    <Users className="w-3.5 h-3.5 text-red-500" />
                    <span>Hôtel (1111) · Cuisine (2222) · Services (3333)</span>
                </div>
            </div>
        </div>
    );
}
