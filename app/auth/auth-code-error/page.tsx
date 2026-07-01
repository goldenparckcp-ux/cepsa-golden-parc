"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

function ErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [errorDesc, setErrorDesc] = useState<string>("");

    useEffect(() => {
        // 1. Check query parameters
        const error = searchParams.get("error") || searchParams.get("error_description");
        if (error) {
            setErrorMsg(searchParams.get("error") || "Erreur d'authentification");
            setErrorDesc(searchParams.get("error_description") || "");
            return;
        }

        // 2. Check URL hash (Supabase often returns errors in hash fragment)
        if (typeof window !== "undefined" && window.location.hash) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const hashError = params.get("error");
            const hashDesc = params.get("error_description");
            if (hashError) {
                setErrorMsg(hashError);
                setErrorDesc(hashDesc || "");
            }
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[30%] left-[30%] w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="w-full max-w-md bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
                    Erreur de Connexion
                </h1>
                
                <p className="text-gray-400 text-sm mb-6">
                    Une erreur est survenue lors de la tentative de connexion avec le fournisseur d'authentification.
                </p>

                {errorMsg && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mb-6 text-left">
                        <p className="text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
                            Détail de l'erreur :
                        </p>
                        <p className="text-white font-mono text-xs break-all">
                            {errorMsg}
                        </p>
                        {errorDesc && (
                            <p className="text-gray-400 text-xs mt-2 italic">
                                {decodeURIComponent(errorDesc)}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/profile")}
                        className="w-full h-12 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-[0.98] transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Retour au profil
                    </button>
                    
                    <button
                        onClick={() => router.push("/")}
                        className="w-full h-12 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-xl flex items-center justify-center hover:bg-white/10 active:scale-[0.98] transition-all text-sm"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
                Chargement...
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}
