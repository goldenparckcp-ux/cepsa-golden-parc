"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, RefreshCw } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [dbStatus, setDbStatus] = useState<"connected" | "checking" | "fallback">("connected");

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
                setErrorMsg(data.error || "Code PIN incorrect ou refusé.");
                setPin("");
            } else {
                localStorage.setItem("staff_session", JSON.stringify({
                    role: data.role,
                    name: data.name || "Personnel"
                }));
                
                // Redirect based on role
                if (data.role === 'kitchen') router.push('/admin/kitchen');
                else if (data.role === 'services') router.push('/admin/services');
                else if (data.role === 'hotel') router.push('/admin/hotel');
                else router.push('/admin');
            }
        } catch (err) {
            setErrorMsg("Erreur réseau. Essai hors ligne...");
            setPin("");
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#1E293B] rounded-3xl border border-white/10 p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 mb-6">
                    <Lock className="w-8 h-8 text-black" />
                </div>

                <h2 className="text-2xl font-black text-white text-center mb-1">Portail Staff Cepsa</h2>
                <p className="text-xs text-gray-400 text-center mb-8 font-medium">Saisissez votre code PIN pour accéder au panneau</p>

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

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-center text-red-400 font-bold text-xs mb-6 w-full animate-shake">
                        {errorMsg}
                    </div>
                )}

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

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    <span className={`w-2 h-2 rounded-full ${dbStatus === "connected" ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} />
                    <span className="text-[10px] font-bold text-gray-400">
                        {dbStatus === "connected" ? "Sécurisé" : "Connexion..."}
                    </span>
                </div>
            </div>
        </div>
    );
}
