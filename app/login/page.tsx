"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Building2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Mock Authentication Simulation
        setTimeout(() => {
            // Simple mock logic for demonstration
            if (pin === "0000") {
                if (phone.endsWith("00")) {
                    router.push("/admin");
                } else if (phone.endsWith("01")) {
                    router.push("/admin/kitchen");
                } else if (phone.endsWith("02")) {
                    router.push("/admin/services");
                } else if (phone.endsWith("03")) {
                    router.push("/admin/hotel");
                } else {
                    router.push("/admin"); // Default fallback for testing
                }
            } else {
                setError("Code PIN incorrect. Réessayez.");
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6 text-white">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-gray-900">
                <div className="text-center mb-8">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 mb-4 text-6xl">
                        🏢
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Cepsa Golden Parc</h1>
                    <p className="text-gray-500 mt-2 font-medium">Staff Dashboard Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Numéro de Téléphone
                        </label>
                        <input
                            type="tel"
                            placeholder="+212 6XX XX XX XX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none transition font-medium text-lg bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Code PIN
                        </label>
                        <input
                            type="password"
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={4}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none transition font-medium text-lg tracking-widest bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Connexion...
                            </>
                        ) : (
                            "Se Connecter"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3" /> Accès réservé au personnel
                    </p>
                </div>
            </div>
        </div>
    );
}
