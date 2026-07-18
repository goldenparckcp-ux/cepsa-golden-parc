"use client";

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/state/LanguageContext';

const content = {
  fr: {
    backBtn: "Retour au profil",
    title: "Politique de Confidentialité",
    date: "Dernière mise à jour : 9 juin 2026",
    sec1Title: "1. Introduction",
    sec1Desc: "Chez Golden Park Station GPS, nous accordons une importance primordiale à la protection et à la confidentialité de vos données personnelles. Cette politique de confidentialité détaille le type de données que nous collectons, la manière dont nous les utilisons et les droits dont vous disposez en tant qu'utilisateur de notre plateforme de réservation et de services.",
    sec2Title: "2. Données Collectées",
    sec2Desc: "Dans le cadre de l'utilisation de nos services, nous collectons les informations nécessaires à la gestion de vos réservations et commandes :",
    sec2Li1: "Informations d'identification : Nom complet, adresse e-mail, numéro de téléphone.",
    sec2Li2: "Informations de réservation : Historique de vos réservations d'hôtel, de piscine, de services de lavage, de lubrifiants et de vos commandes de restaurant.",
    sec2Li3: "Données de transaction : Informations sur les paiements effectués via notre passerelle sécurisée (nous ne stockons pas vos données de carte bancaire sur nos serveurs).",
    sec3Title: "3. Utilisation des Données",
    sec3Desc: "Vos données sont utilisées exclusivement pour les finalités suivantes :",
    sec3Li1: "Création et gestion de votre compte client.",
    sec3Li2: "Traitement et confirmation de vos réservations de services.",
    sec3Li3: "Traitement sécurisé des transactions de paiement.",
    sec3Li4: "Remboursement des réservations annulées (conformément à nos conditions de service).",
    sec3Li5: "Amélioration de votre expérience utilisateur sur l'application.",
    sec4Title: "4. Partage des Données avec des Tiers",
    sec4Desc: "Nous ne vendons ni ne louons vos données personnelles. Elles sont transmises uniquement aux prestataires essentiels au bon fonctionnement de l'application :",
    sec4Li1: "Supabase : Hébergement sécurisé de la base de données et gestion d'authentification.",
    sec4Li2: "PayPal / CMI : Traitement des paiements sécurisés.",
    sec5Title: "5. Vos Droits et Suppression des Données",
    sec5Desc1: "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles à tout moment.",
    sec5Desc2: "Pour supprimer définitivement votre compte et l'ensemble des données associées, vous pouvez consulter notre page dédiée :",
    sec5Link: "Instructions de Suppression des Données",
    contactTitle: "Contact support",
    contactDesc: "Pour toute question concernant notre politique de confidentialité, vous pouvez nous écrire à :"
  },
  ar: {
    backBtn: "الرجوع إلى الملف الشخصي",
    title: "سياسة الخصوصية",
    date: "آخر تحديث: 9 يونيو 2026",
    sec1Title: "1. مقدمة",
    sec1Desc: "في محطة غولدن بارك GPS، نولي أهمية قصوى لحماية وخصوصية بياناتك الشخصية. تفصل سياسة الخصوصية هذه نوع البيانات التي نجمعها وكيفية استخدامها والحقوق المتاحة لك كمستخدم لمنصة الحجز والخدمات الخاصة بنا.",
    sec2Title: "2. البيانات التي نجمعها",
    sec2Desc: "كجزء من استخدام خدماتنا، نجمع المعلومات اللازمة لإدارة حجوزاتك وطلباتك:",
    sec2Li1: "معلومات الهوية: الاسم الكامل، البريد الإلكتروني، ورقم الهاتف.",
    sec2Li2: "معلومات الحجز: سجل حجوزات الفندق والمسبح والخدمات وطلبات المطعم الخاصة بك.",
    sec2Li3: "بيانات المعاملات: معلومات حول المدفوعات التي تمت عبر بوابة الدفع الآمنة (نحن لا نخزن بيانات بطاقتك البنكية على خوادمنا).",
    sec3Title: "3. استخدام البيانات",
    sec3Desc: "تستخدم بياناتك حصريًا للأغراض التالية:",
    sec3Li1: "إنشاء وإدارة حساب العميل الخاص بك.",
    sec3Li2: "معالجة وتأكيد حجوزات الخدمات الخاصة بك.",
    sec3Li3: "المعالجة الآمنة لمعاملات الدفع.",
    sec3Li4: "استرداد المبالغ للحجوزات الملغاة (وفقًا لشروط الخدمة لدينا).",
    sec3Li5: "تحسين تجربة المستخدم على التطبيق.",
    sec4Title: "4. مشاركة البيانات مع أطراف ثالثة",
    sec4Desc: "نحن لا نبيع أو نؤجر بياناتك الشخصية. يتم نقلها فقط إلى مقدمي الخدمات الضروريين لتشغيل التطبيق بشكل سليم:",
    sec4Li1: "Supabase: الاستضافة الآمنة لقاعدة البيانات وإدارة الهوية.",
    sec4Li2: "PayPal / CMI: معالجة المدفوعات الآمنة.",
    sec5Title: "5. حقوقك وحذف البيانات",
    sec5Desc1: "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها في أي وقت.",
    sec5Desc2: "لحذف حسابك وجميع البيانات المرتبطة به نهائيًا، يمكنك زيارة الصفحة المخصصة لذلك:",
    sec5Link: "تعليمات حذف البيانات",
    contactTitle: "الاتصال بالدعم",
    contactDesc: "لأي سؤال بخصوص سياسة الخصوصية، يمكنك مراسلتنا على البريد الإلكتروني:"
  },
  en: {
    backBtn: "Back to Profile",
    title: "Privacy Policy",
    date: "Last updated: June 9, 2026",
    sec1Title: "1. Introduction",
    sec1Desc: "At Golden Park Station GPS, we attach paramount importance to the protection and confidentiality of your personal data. This privacy policy details the type of data we collect, how we use it, and the rights you have as a user of our booking and services platform.",
    sec2Title: "2. Collected Data",
    sec2Desc: "As part of using our services, we collect information necessary to manage your bookings and orders:",
    sec2Li1: "Identification information: Full name, email address, phone number.",
    sec2Li2: "Booking information: History of your hotel, pool, services, and restaurant bookings.",
    sec2Li3: "Transaction data: Information on payments made via our secure gateway (we do not store credit card details on our servers).",
    sec3Title: "3. Use of Data",
    sec3Desc: "Your data is used exclusively for the following purposes:",
    sec3Li1: "Creation and management of your customer account.",
    sec3Li2: "Processing and confirmation of your service bookings.",
    sec3Li3: "Secure processing of payment transactions.",
    sec3Li4: "Refund of cancelled bookings (in accordance with our terms of service).",
    sec3Li5: "Improving your user experience on the application.",
    sec4Title: "4. Data Sharing with Third Parties",
    sec4Desc: "We do not sell or lease your personal data. It is shared only with providers essential to the proper functioning of the application:",
    sec4Li1: "Supabase: Secure database hosting and authentication management.",
    sec4Li2: "PayPal / CMI: Secure payment processing.",
    sec5Title: "5. Your Rights and Data Deletion",
    sec5Desc1: "You have a right of access, rectification, and deletion of your personal data at any time.",
    sec5Desc2: "To permanently delete your account and all associated data, you can consult our dedicated page:",
    sec5Link: "Data Deletion Instructions",
    contactTitle: "Contact Support",
    contactDesc: "For any questions regarding our privacy policy, you can write to us at:"
  },
  es: {
    backBtn: "Volver al Perfil",
    title: "Política de Privacidad",
    date: "Última actualización: 9 de junio de 2026",
    sec1Title: "1. Introducción",
    sec1Desc: "En Golden Park Station GPS, otorgamos una importancia primordial a la protección y privacidad de sus datos personales. Esta política de privacidad detalla el tipo de datos que recopilamos, cómo los usamos y los derechos que tiene como usuario de nuestra plataforma de reservas y servicios.",
    sec2Title: "2. Datos Recopilados",
    sec2Desc: "Como parte del uso de nuestros servicios, recopilamos la información necesaria para gestionar sus reservas y pedidos:",
    sec2Li1: "Información de identificación: Nombre completo, dirección de correo electrónico, número de teléfono.",
    sec2Li2: "Información de reserva: Historial de sus reservas de hotel, piscina, servicios y pedidos de restaurante.",
    sec2Li3: "Datos de transacción: Información sobre los pagos realizados a través de nuestra pasarela segura (no almacenamos los datos de su tarjeta de crédito en nuestros servidores).",
    sec3Title: "3. Uso de los Datos",
    sec3Desc: "Sus datos se utilizan exclusivamente para los siguientes fines:",
    sec3Li1: "Creación y gestión de su cuenta de cliente.",
    sec3Li2: "Procesamiento y confirmación de sus reservas de servicios.",
    sec3Li3: "Procesamiento seguro de transacciones de pago.",
    sec3Li4: "Reembolso de reservas canceladas (de acuerdo con nuestras condiciones de servicio).",
    sec3Li5: "Mejorar su experiencia de usuario en la aplicación.",
    sec4Title: "4. Intercambio de Datos con Terceros",
    sec4Desc: "No vendemos ni alquilamos sus datos personales. Se transmiten únicamente a los proveedores esenciales para el buen funcionamiento de la aplicación:",
    sec4Li1: "Supabase: Alojamiento seguro de bases de datos y gestión de autenticación.",
    sec4Li2: "PayPal / CMI: Procesamiento seguro de pagos.",
    sec5Title: "5. Sus Derechos y Eliminación de Datos",
    sec5Desc1: "Tiene derecho a acceder, rectificar y eliminar sus datos personales en cualquier momento.",
    sec5Desc2: "Para eliminar permanentemente su cuenta y todos los datos asociados, puede consultar nuestra página dedicada:",
    sec5Link: "Instrucciones de Eliminación de Datos",
    contactTitle: "Contacto soporte",
    contactDesc: "Para cualquier pregunta sobre nuestra política de privacidad, puede escribirnos a:"
  }
};

export default function PrivacyPolicy() {
    const { language } = useTranslation();
    const activeLang = (['fr', 'ar', 'en', 'es'].includes(language) ? language : 'fr') as keyof typeof content;
    const tLocal = content[activeLang];

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
                        {tLocal.backBtn}
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
                        {tLocal.title}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {tLocal.date}
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
                            <h2>{tLocal.sec1Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec1Desc}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <Eye className="w-5 h-5 text-blue-400" />
                            <h2>{tLocal.sec2Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec2Desc}
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>{tLocal.sec2Li1}</li>
                            <li>{tLocal.sec2Li2}</li>
                            <li>{tLocal.sec2Li3}</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <FileText className="w-5 h-5 text-[#FFCA28]" />
                            <h2>{tLocal.sec3Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec3Desc}
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>{tLocal.sec3Li1}</li>
                            <li>{tLocal.sec3Li2}</li>
                            <li>{tLocal.sec3Li3}</li>
                            <li>{tLocal.sec3Li4}</li>
                            <li>{tLocal.sec3Li5}</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <UserCheck className="w-5 h-5 text-blue-400" />
                            <h2>{tLocal.sec4Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec4Desc}
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>{tLocal.sec4Li1}</li>
                            <li>{tLocal.sec4Li2}</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <Shield className="w-5 h-5 text-[#FFCA28]" />
                            <h2>{tLocal.sec5Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec5Desc1}
                        </p>
                        <p className="leading-relaxed">
                            {tLocal.sec5Desc2}
                            <Link href="/delete-account" className="text-blue-400 hover:text-blue-300 ml-1 underline">
                                {tLocal.sec5Link}
                            </Link>.
                        </p>
                    </section>

                    <section className="space-y-3 border-t border-white/10 pt-6">
                        <h2 className="text-white font-semibold">{tLocal.contactTitle}</h2>
                        <p className="leading-relaxed text-sm text-gray-400">
                            {tLocal.contactDesc} <span className="text-[#FFCA28]">golden.park.cp@gmail.com</span>
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
