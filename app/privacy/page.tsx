"use client";

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#070A13] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFCA28]/5 rounded-full blur-3xl" />

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
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
                        Politique de Confidentialité
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
                            <Lock className="w-5 h-5 text-[#FFCA28]" />
                            <h2>1. Introduction</h2>
                        </div>
                        <p className="leading-relaxed">
                            Chez <strong>Golden Parc Cepsa</strong>, nous accordons une importance primordiale à la protection et à la confidentialité de vos données personnelles. Cette politique de confidentialité détaille le type de données que nous collectons, la manière dont nous les utilisons et les droits dont vous disposez en tant qu'utilisateur de notre plateforme de réservation et de services.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <Eye className="w-5 h-5 text-blue-400" />
                            <h2>2. Données Collectées</h2>
                        </div>
                        <p className="leading-relaxed">
                            Dans le cadre de l'utilisation de nos services, nous collectons les informations nécessaires à la gestion de vos réservations et commandes :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Informations d'identification :</strong> Nom complet, adresse e-mail, numéro de téléphone.</li>
                            <li><strong>Informations de réservation :</strong> Historique de vos réservations d'hôtel, de piscine, de services de lavage, de lubrifiants et de vos commandes de restaurant.</li>
                            <li><strong>Données de transaction :</strong> Informations sur les paiements effectués via nos passerelles sécurisées Stripe et PayPal (nous ne stockons pas vos données de carte bancaire sur nos serveurs).</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <FileText className="w-5 h-5 text-[#FFCA28]" />
                            <h2>3. Utilisation des Données</h2>
                        </div>
                        <p className="leading-relaxed">
                            Vos données sont utilisées exclusivement pour les finalités suivantes :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Création et gestion de votre compte client.</li>
                            <li>Traitement et confirmation de vos réservations de services.</li>
                            <li>Traitement sécurisé des transactions de paiement.</li>
                            <li>Remboursement des réservations annulées (conformément à nos conditions de service).</li>
                            <li>Amélioration de votre expérience utilisateur sur l'application.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <UserCheck className="w-5 h-5 text-blue-400" />
                            <h2>4. Partage des Données avec des Tiers</h2>
                        </div>
                        <p className="leading-relaxed">
                            Nous ne vendons ni ne louons vos données personnelles. Elles sont transmises uniquement aux prestataires essentiels au bon fonctionnement de l'application :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Supabase :</strong> Hébergement sécurisé de la base de données et gestion d'authentification.</li>
                            <li><strong>Stripe / PayPal :</strong> Traitement des paiements sécurisés par carte bancaire.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <Shield className="w-5 h-5 text-[#FFCA28]" />
                            <h2>5. Vos Droits et Suppression des Données</h2>
                        </div>
                        <p className="leading-relaxed">
                            Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles à tout moment.
                        </p>
                        <p className="leading-relaxed">
                            Pour supprimer définitivement votre compte et l'ensemble des données associées, vous pouvez consulter notre page dédiée : 
                            <Link href="/delete-account" className="text-blue-400 hover:text-blue-300 ml-1 underline">
                                Instructions de Suppression des Données
                            </Link>.
                        </p>
                    </section>

                    <section className="space-y-3 border-t border-white/10 pt-6">
                        <h2 className="text-white font-semibold">Contact support</h2>
                        <p className="leading-relaxed text-sm text-gray-400">
                            Pour toute question concernant notre politique de confidentialité, vous pouvez nous écrire à : <span className="text-[#FFCA28]">golden.parck.cp@gmail.com</span>
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
