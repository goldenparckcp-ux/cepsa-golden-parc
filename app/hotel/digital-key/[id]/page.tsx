"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Unlock, Key, Wifi, Smartphone, Battery } from 'lucide-react';

export default function DigitalKeyPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'scanning' | 'unlocking' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);

    // Mock Room Data based on ID
    const roomId = params.id as string;
    const roomNumber = roomId ? `20${roomId.slice(-1)}` : '204';

    const handleUnlock = () => {
        setStatus('scanning');

        // Simulation of Bluetooth handshake
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setStatus('unlocking');
                setTimeout(() => {
                    setStatus('success');
                    // Haptic feedback if available
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                }, 1500);
            }
        }, 30);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white overflow-hidden relative font-sans">

            {/* Background Ambient Light */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
                <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition">
                    &larr; Retour
                </button>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full backdrop-blur-md border border-white/10">
                    <Wifi className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-bold text-gray-300">Connected</span>
                    <div className="w-px h-3 bg-white/20 mx-1" />
                    <Battery className="w-3 h-3 text-white" />
                </div>
            </div>

            {/* Main Content */}
            <div className="h-screen flex flex-col items-center justify-center p-6 relative z-0">

                {/* Status Indicator */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">
                        {status === 'success' ? 'BIENVENUE' : `CHAMBRE ${roomNumber}`}
                    </h1>
                    <p className="text-blue-200/60 font-medium uppercase tracking-widest text-xs">
                        {status === 'idle' && 'CLÉ DIGITALE ACTIVE'}
                        {status === 'scanning' && 'RECHERCHE SERRURE...'}
                        {status === 'unlocking' && 'AUTHENTIFICATION...'}
                        {status === 'success' && 'ACCÈS AUTORISÉ'}
                    </p>
                </div>

                {/* The KEY Interface */}
                <div className="relative">

                    {/* Rings Animation */}
                    {(status === 'scanning' || status === 'unlocking') && (
                        <>
                            <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping [animation-duration:2s]" />
                            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping [animation-delay:0.5s] [animation-duration:2s]" />
                        </>
                    )}

                    {/* Success Glow */}
                    {status === 'success' && (
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                    )}

                    {/* Main Button / Disc */}
                    <button
                        onClick={status === 'idle' ? handleUnlock : undefined}
                        disabled={status !== 'idle'}
                        className={`w-64 h-64 rounded-full flex flex-col items-center justify-center relative transition-all duration-500 ${status === 'success'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-700 shadow-[0_0_50px_rgba(16,185,129,0.4)] scale-110'
                            : status === 'idle'
                                ? 'bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-4 border-[#334155] shadow-2xl active:scale-95 hover:border-blue-500/50 cursor-pointer'
                                : 'bg-[#0F172A] border-4 border-blue-500/30'
                            }`}
                    >
                        {/* Progress Border */}
                        {status === 'scanning' && (
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="48"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-white/10"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="48"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-blue-500 transition-all duration-75 ease-linear"
                                    strokeDasharray="301.59"
                                    strokeDashoffset={301.59 - (301.59 * progress) / 100}
                                />
                            </svg>
                        )}

                        {/* Icons */}
                        <div className={`transition-all duration-500 transform ${status === 'success' ? 'scale-125' : ''}`}>
                            {status === 'success' ? (
                                <Unlock className="w-20 h-20 text-white drop-shadow-md" />
                            ) : status === 'unlocking' ? (
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div className="text-center">
                                    <Key className={`w-16 h-16 mx-auto mb-2 ${status === 'idle' ? 'text-white' : 'text-blue-400'}`} />
                                    {status === 'idle' && <span className="text-xs text-gray-400 font-bold block mt-2">APPUYER POUR OUVRIR</span>}
                                </div>
                            )}
                        </div>
                    </button>

                </div>

                {/* Footer Info */}
                <div className="mt-16 text-center space-y-4 max-w-xs mx-auto">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5">
                        <Smartphone className="w-5 h-5" />
                        <span>Gardez votre téléphone à<br />moins de 10cm de la poignée</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
