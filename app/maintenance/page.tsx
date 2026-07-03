"use client";

import React from "react";
import { AlertTriangle, PhoneCall, Mail, Clock } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 relative overflow-hidden select-none">
            {/* Background decorative elements */}
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative w-full max-w-lg bg-[#1E293B]/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Visual Icon */}
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        Statut : Service Suspendu
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none pt-2">
                        Maintenance en cours
                    </h1>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed pt-2">
                        Le service est momentanément indisponible. Pour réactiver le service ou pour toute réclamation, veuillez contacter le développeur en charge du projet.
                    </p>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 gap-3 bg-[#0F172A]/60 rounded-2xl p-5 border border-white/5 text-left">
                    <div className="flex items-center gap-3 text-gray-300">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-semibold">Temps de résolution : En attente d'action</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                        <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-semibold">Contact : support@goldenparkstation.com</span>
                    </div>
                </div>

                {/* Call Developer Actions */}
                <div className="pt-2 flex flex-col gap-3">
                    <a 
                        href="tel:+212600000000" 
                        className="py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <PhoneCall className="w-4 h-4" />
                        <span>Contacter le Développeur</span>
                    </a>
                </div>

                {/* Brand watermark */}
                <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    Golden Parc Station
                </div>
            </div>
        </div>
    );
}
