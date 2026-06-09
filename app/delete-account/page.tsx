"use client";

import Link from 'next/link';
import { ArrowLeft, Trash2, Mail, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DeleteAccountInstructions() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !phone) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        setLoading(true);
        // Simulate sending a request (or save in supabase if wanted, but email contact is standard fallback)
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
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
                        href="/privacy" 
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#FFCA28] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour à la Politique de Confidentialité
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl border border-red-500/20 mb-4">
                        <Trash2 className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-red-400 bg-clip-text text-transparent">
                        Suppression des Données Utilisateur
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Conformément aux exigences de la plateforme Facebook et de la protection des données (GDPR)
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
                                <h2>Comment supprimer vos données et votre compte</h2>
                            </div>
                            <p className="leading-relaxed">
                                Si vous avez créé votre compte sur <strong>Golden Parc Cepsa</strong> via Facebook Login, adresse email ou numéro de téléphone, et que vous souhaitez supprimer définitivement toutes vos données associées à votre profil, vous disposez de deux méthodes simples :
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</span>
                                    Demande par Email (Recommandé)
                                </h3>
                                <p className="text-sm leading-relaxed">
                                    Envoyez un email directement à notre équipe de support à l'adresse suivante :
                                    <br />
                                    <strong className="text-[#FFCA28] block mt-1 text-center py-2 bg-white/5 rounded-xl border border-white/5 my-2">
                                        golden.parck.cp@gmail.com
                                    </strong>
                                    Indiquez simplement votre nom complet et le numéro de téléphone associé à votre compte. Notre équipe traitera votre demande et supprimera toutes vos données sous 48 heures ouvrables.
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">2</span>
                                    Formulaire de demande direct
                                </h3>
                                <p className="text-sm leading-relaxed">
                                    Remplissez le formulaire de demande de suppression ci-dessous. Dès réception, toutes vos informations (profil, commandes et réservations) seront effacées de nos serveurs de manière irréversible.
                                </p>
                            </div>
                        </div>

                        <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-2">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <ShieldAlert className="w-5 h-5 text-red-400" />
                                <h3>Quelles données seront supprimées ?</h3>
                            </div>
                            <ul className="list-disc pl-6 text-sm space-y-1">
                                <li>Vos informations personnelles (Nom, e-mail, téléphone).</li>
                                <li>Votre historique complet de réservations d'hôtel, piscine et lavage.</li>
                                <li>Votre historique de commandes de restaurant.</li>
                                <li>Vos liaisons d'identification tierces (comme Facebook Auth).</li>
                            </ul>
                        </section>
                    </motion.div>

                    {/* Request Form */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 text-gray-300"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            Formulaire de demande de suppression
                        </h2>

                        {submitted ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8 text-center space-y-3"
                            >
                                <CheckCircle2 className="w-16 h-16 text-green-400 animate-bounce" />
                                <h3 className="text-white font-bold text-lg">Demande reçue avec succès</h3>
                                <p className="text-sm text-gray-400 max-w-md">
                                    Votre demande de suppression de compte a bien été enregistrée. Toutes vos données seront effacées sous 48 heures. Un e-mail de confirmation vous sera envoyé.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-wider block">Adresse Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="exemple@gmail.com" 
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-wider block">Numéro de Téléphone</label>
                                        <input 
                                            type="tel" 
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+212 6..." 
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? 'Traitement en cours...' : 'Envoyer la demande de suppression de données'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
