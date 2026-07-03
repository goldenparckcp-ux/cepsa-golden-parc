"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, Server, Power, AlertTriangle, ShieldCheck, Settings, Globe, Utensils, Waves, Droplet, Bed, UserCircle, Users } from "lucide-react";

type Config = {
  global: boolean;
  restaurant: boolean;
  pool: boolean;
  lubrifiants: boolean;
  hotel: boolean;
  admin: boolean;
  staff: boolean;
};

export default function DeveloperControlPage() {
    const [secret, setSecret] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [config, setConfig] = useState<Config>({
        global: false,
        restaurant: false,
        pool: false,
        lubrifiants: false,
        hotel: false,
        admin: false,
        staff: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        try {
            const res = await fetch('/api/dev-control');
            const data = await res.json();
            
            // Verify secret by doing a dry-run update to itself
            const verifyRes = await fetch('/api/dev-control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret, config: data.config })
            });
            
            if (verifyRes.ok) {
                setIsAuthorized(true);
                setConfig(data.config);
            } else {
                setError("Clé secrète invalide.");
            }
        } catch (err) {
            setError("Erreur de connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (key: keyof Config, newStatus: boolean) => {
        setIsLoading(true);
        setError("");
        
        try {
            const newConfig = { ...config, [key]: newStatus };
            // If global is turned ON, typically everything is OFF, but we just override in middleware anyway.
            // But we keep them independent so dev can pick and choose.
            const res = await fetch('/api/dev-control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret, config: newConfig })
            });
            
            if (res.ok) {
                setConfig(newConfig);
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

    const sections = [
        { key: 'global', name: 'Site Global', icon: Globe, desc: 'Bloque l\'accès à tout le site' },
        { key: 'admin', name: 'Admin Panel', icon: UserCircle, desc: 'Bloque l\'accès au panel administrateur' },
        { key: 'staff', name: 'Staff Panel', icon: Users, desc: 'Bloque l\'accès au panel staff' },
        { key: 'restaurant', name: 'Restaurant', icon: Utensils, desc: 'Bloque uniquement /restaurant' },
        { key: 'pool', name: 'Piscine', icon: Waves, desc: 'Bloque uniquement /services/pool' },
        { key: 'lubrifiants', name: 'Lavage & Vidange', icon: Droplet, desc: 'Bloque uniquement /services/lubrifiants' },
        { key: 'hotel', name: 'Hôtel', icon: Bed, desc: 'Bloque uniquement /hotel' }
    ] as const;

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient glows based on global status */}
            <div className={`absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${config.global ? 'bg-red-600/10' : 'bg-emerald-500/10'}`} />
            
            <div className="w-full max-w-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                        <span className="text-white font-medium tracking-wide">Dev Control Panel</span>
                    </div>
                    <button onClick={() => setIsAuthorized(false)} className="text-gray-500 hover:text-white transition-colors">
                        <Unlock className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Statut des Sections</h2>
                        <p className="text-sm text-gray-400">Contrôlez l'accès au site entier ou par section. ON (Vert) = Actif, OFF (Rouge) = Maintenance.</p>
                    </div>
                    {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sections.map((section) => {
                            const isMaintenance = config[section.key];
                            const Icon = section.icon;
                            
                            return (
                                <div key={section.key} className={`flex items-center justify-between p-5 rounded-2xl border transition-colors ${isMaintenance ? 'bg-red-950/20 border-red-500/20' : 'bg-slate-900 border-white/5'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMaintenance ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${isMaintenance ? 'text-red-100' : 'text-white'}`}>{section.name}</h3>
                                            <p className="text-xs text-gray-500">{section.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(section.key, !isMaintenance)}
                                        disabled={isLoading}
                                        className={`relative w-14 h-8 rounded-full transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${isMaintenance ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${isMaintenance ? 'left-1' : 'left-7'}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 text-center flex flex-col items-center gap-2">
                    <p className="text-xs text-gray-500">Golden Park Station - Sécurité Avancée</p>
                    {isLoading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                </div>
            </div>
        </div>
    );
}
