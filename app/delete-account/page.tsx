"use client";

import Link from 'next/link';
import { ArrowLeft, Trash2, Info, ShieldAlert, CheckCircle2, LogIn, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DeleteAccountInstructions() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Check current session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const handleDeleteAccount = async () => {
        if (!confirm("ATTENTION: Êtes-vous absolument sûr de vouloir supprimer définitivement votre compte ainsi que toutes vos données associées ? Cette action est irréversible.")) {
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/auth/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Une erreur s'est produite lors de la suppression.");
            }

            setSubmitted(true);
            setTimeout(() => {
                // Redirect to homepage after success
                router.push('/');
            }, 3000);
        } catch (err: any) {
            console.error("GDPR Account deletion error:", err);
            setErrorMessage(err.message || "Impossible de supprimer le compte. Veuillez réessayer plus tard.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A13] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Back button */}
                <div className="mb-8">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#FFCA28] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour à l'accueil
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl border border-red-500/20 mb-4">
                        <Trash2 className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-red-400 bg-clip-text text-transparent">
                        Suppression des Données & Compte
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Conformément au RGPD et aux politiques de Meta (Facebook Login)
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6 text-gray-300"
                    >
                        <section className="space-y-3">
                            <div className="flex items-center gap-3 text-white font-semibold text-lg">
                                <Info className="w-5 h-5 text-blue-400" />
                                <h2>Informations sur la suppression de vos données</h2>
                            </div>
                            <p className="leading-relaxed">
                                Si vous souhaitez supprimer définitivement toutes vos données associées à votre profil (historiques de réservation d'hôtel, tickets de piscine, historique de lavage, commandes de restaurant), vous pouvez le faire directement ci-dessous en vous authentifiant, ou nous contacter par e-mail.
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</span>
                                    Suppression en ligne immédiate
                                </h3>
                                <p className="text-sm leading-relaxed">
                                    Connectez-vous à votre compte et validez la suppression en un clic. Toutes vos données seront effacées immédiatement et définitivement de nos serveurs.
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-[#FFCA28] text-xs font-bold">2</span>
                                    Par e-mail (Support)
                                </h3>
                                <p className="text-sm leading-relaxed">
                                    Envoyez une demande de suppression à l'adresse support :
                                    <br />
                                    <strong className="text-[#FFCA28] block mt-1 text-center py-2 bg-white/5 rounded-xl border border-white/5 my-2">
                                        golden.parck.cp@gmail.com
                                    </strong>
                                    Précisez votre nom complet et le téléphone associé. Le traitement sera fait sous 48 heures.
                                </p>
                            </div>
                        </div>

                        <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-2">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <ShieldAlert className="w-5 h-5 text-red-400" />
                                <h3>Quelles données seront supprimées ?</h3>
                            </div>
                            <ul className="list-disc pl-6 text-sm space-y-1">
                                <li>Vos informations de profil personnel.</li>
                                <li>Votre historique complet de réservations d'hôtel, piscine et lavage.</li>
                                <li>Votre historique de commandes de restaurant.</li>
                                <li>Vos clés d'identification tierces liées.</li>
                            </ul>
                        </section>
                    </motion.div>

                    {/* Action Block */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 text-gray-300"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            Actions de suppression de compte
                        </h2>

                        {submitted ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8 text-center space-y-3"
                            >
                                <CheckCircle2 className="w-16 h-16 text-green-400 animate-bounce" />
                                <h3 className="text-white font-bold text-lg">Compte supprimé avec succès</h3>
                                <p className="text-sm text-gray-400 max-w-md">
                                    Votre compte et toutes vos données personnelles ont été supprimés définitivement. Redirection en cours vers l'accueil...
                                </p>
                            </motion.div>
                        ) : user ? (
                            <div className="space-y-6">
                                <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-5 flex gap-4 items-start">
                                    <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-white font-bold mb-1">Zone de danger : Suppression irréversible</h4>
                                        <p className="text-sm text-gray-400">
                                            Vous êtes actuellement connecté en tant que <strong className="text-white">{user.email || user.phone}</strong>. Cliquer sur le bouton ci-dessous supprimera définitivement votre session, votre compte et tout votre historique de Golden Parc.
                                        </p>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <p className="text-sm text-red-400 text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{errorMessage}</p>
                                )}

                                <button 
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Suppression en cours...' : 'Supprimer définitivement mon compte et mes données'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-4">
                                <p className="text-sm text-gray-400">
                                    Pour supprimer votre compte en ligne immédiatement, veuillez d'abord vous connecter pour prouver votre identité.
                                </p>
                                <Link
                                    href="/profile"
                                    className="inline-flex items-center gap-2 bg-[#FFCA28] hover:bg-[#FFD54F] text-black font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-yellow-500/10"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Me connecter pour supprimer mon compte
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
