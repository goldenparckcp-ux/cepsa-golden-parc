"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, Server, Power, AlertTriangle, ShieldCheck } from "lucide-react";

export default function DeveloperControlPage() {
    const [secret, setSecret] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch initial status if authorized (or we can just wait for login)
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        try {
            // Test auth by fetching status via POST without changing it (just pass current state, wait we need a verify endpoint)
            // Actually, we can fetch GET to see status, but GET is unprotected.
            // Let's just fetch the status first.
            const res = await fetch('/api/dev-control');
            const data = await res.json();
            
            // To verify password, let's just do a dry-run or assume it's correct and wait for first action?
            // Let's do a fake toggle to itself to verify
            const verifyRes = await fetch('/api/dev-control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret, isMaintenance: data.isMaintenance })
            });
            
            if (verifyRes.ok) {
                setIsAuthorized(true);
                setIsMaintenance(data.isMaintenance);
            } else {
                setError("Clé secrète invalide.");
            }
        } catch (err) {
            setError("Erreur de connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (newStatus: boolean) => {
        setIsLoading(true);
        setError("");
        
        try {
            const res = await fetch('/api/dev-control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret, isMaintenance: newStatus })
            });
            
            if (res.ok) {
                setIsMaintenance(newStatus);
            } else {
                setError("Échec de la modification.");
            }
        } catch (err) {
            setError("Erreur réseau.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#0F172A]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <Lock className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-bold text-white tracking-tight">Accès Développeur</h1>
                        <p className="text-xs text-gray-400">Veuillez entrer la clé secrète pour continuer.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <input 
                            type="password" 
                            value={secret}
                            onChange={e => setSecret(e.target.value)}
                            placeholder="Clé secrète..."
                            className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        {error && <p className="text-red-400 text-xs text-center font-medium">{error}</p>}
                        
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Vérification..." : "Déverrouiller"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient glows based on status */}
            <div className={`absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${isMaintenance ? 'bg-red-600/10' : 'bg-emerald-500/10'}`} />
            
            <div className="w-full max-w-lg bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                        <span className="text-white font-medium tracking-wide">Dev Control Panel</span>
                    </div>
                    <button onClick={() => setIsAuthorized(false)} className="text-gray-500 hover:text-white transition-colors">
                        <Unlock className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Statut du Site</h2>
                        <p className="text-sm text-gray-400">Contrôlez l'accès public au site web.</p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-8 py-4">
                        {/* Status Indicator */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${isMaintenance ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                            {isMaintenance ? <AlertTriangle className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {isMaintenance ? 'OFFLINE (MAINTENANCE)' : 'ONLINE (ACTIF)'}
                            </span>
                        </div>

                        {/* Massive Toggle Button */}
                        <button 
                            onClick={() => toggleStatus(!isMaintenance)}
                            disabled={isLoading}
                            className={`relative group w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-500 shadow-2xl ${
                                isMaintenance 
                                ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-4 border-gray-700 hover:border-red-500/50 shadow-red-900/20' 
                                : 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-4 border-emerald-400 hover:border-emerald-300 shadow-emerald-600/40'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                        >
                            <Power className={`w-12 h-12 transition-colors duration-500 ${isMaintenance ? 'text-gray-500 group-hover:text-red-400' : 'text-white'}`} />
                            <span className={`text-sm font-black tracking-widest uppercase transition-colors duration-500 ${isMaintenance ? 'text-gray-500 group-hover:text-red-400' : 'text-emerald-100'}`}>
                                {isMaintenance ? 'Turn ON' : 'Turn OFF'}
                            </span>
                        </button>
                    </div>
                    
                    {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
                    
                    <p className="text-xs text-gray-500 leading-relaxed pt-6">
                        Attention : Désactiver le site redirigera immédiatement tous les visiteurs publics vers la page de maintenance.
                    </p>
                </div>
            </div>
        </div>
    );
}
