"use client";

import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert, BadgeInfo, FileCheck, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#070A13] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FFCA28]/5 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Back button */}
                <div className="mb-8">
                    <Link 
                        href="/profile" 
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#FFCA28] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour au profil
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-[#FFCA28]/10 rounded-2xl border border-[#FFCA28]/20 mb-4">
                        <Scale className="w-8 h-8 text-[#FFCA28]" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
                        Conditions Générales d'Utilisation
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Dernière mise à jour : 9 juin 2026
                    </p>
                </div>

                {/* Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 text-gray-300"
                >
                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <BadgeInfo className="w-5 h-5 text-blue-400" />
                            <h2>1. Acceptation des Conditions</h2>
                        </div>
                        <p className="leading-relaxed">
                            L'accès et l'utilisation de l'application de réservation de <strong>Golden Parc Cepsa</strong> sont soumis à l'acceptation et au respect des présentes Conditions Générales d'Utilisation (CGU). En utilisant nos services, vous acceptez d'être lié par ces règles sans aucune réserve.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <ShieldAlert className="w-5 h-5 text-[#FFCA28]" />
                            <h2>2. Politique d'Annulation et de Remboursement</h2>
                        </div>
                        <p className="leading-relaxed">
                            Nous offrons de la flexibilité à nos clients tout en maintenant une organisation rigoureuse pour nos services (Hôtel, Piscine, Services de Lavage/Lubrifiants). Notre politique de remboursement est ainsi définie :
                        </p>
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                            <p className="leading-relaxed text-sm">
                                🟢 <strong>Annulation effectuée plus de 45 minutes avant l'heure prévue :</strong>
                                <br />
                                Vous êtes éligible à un remboursement automatique de votre dépôt ou paiement direct sur votre compte bancaire (carte bancaire via Stripe ou PayPal). Des <strong>frais de traitement administratifs fixes de 10 DH</strong> seront automatiquement déduits du montant remboursé.
                            </p>
                            <p className="leading-relaxed text-sm text-red-400">
                                🔴 <strong>Annulation effectuée moins de 45 minutes avant l'heure prévue :</strong>
                                <br />
                                La réservation est considérée comme tardive ou non-présentée (No-show). Le dépôt de garantie versé en ligne n'est **pas remboursable** et est conservé par l'établissement.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <FileCheck className="w-5 h-5 text-blue-400" />
                            <h2>3. Paiement en ligne et Réservations</h2>
                        </div>
                        <p className="leading-relaxed">
                            Le paiement en ligne sécurisé par carte bancaire (via Stripe ou PayPal) est obligatoire pour confirmer les réservations de l'hôtel, de la piscine et des services (lavage/lubrifiants).
                        </p>
                        <p className="leading-relaxed">
                            Concernant les commandes de notre restaurant, le paiement par carte en ligne est proposé par défaut dans le panier. Les utilisateurs souhaitant payer en espèces peuvent choisir l'option de paiement "Sur Place" (Onsite) lors de la validation.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <HelpCircle className="w-5 h-5 text-[#FFCA28]" />
                            <h2>4. Responsabilité de l'Utilisateur</h2>
                        </div>
                        <p className="leading-relaxed">
                            L'utilisateur s'engage à fournir des informations exactes lors de son inscription (Nom complet, numéro de téléphone, email). Toute fausse information pourra entraîner l'annulation de vos réservations sans remboursement. Vous êtes seul responsable du maintien de la sécurité de votre compte d'accès.
                        </p>
                    </section>

                    <section className="space-y-3 border-t border-white/10 pt-6">
                        <h2 className="text-white font-semibold">Contact support</h2>
                        <p className="leading-relaxed text-sm text-gray-400">
                            Pour toute question concernant nos conditions d'utilisation, vous pouvez nous écrire à : <span className="text-[#FFCA28]">golden.parck.cp@gmail.com</span>
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
