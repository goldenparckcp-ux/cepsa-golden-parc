"use client";

import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert, BadgeInfo, FileCheck, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/state/LanguageContext';

const content = {
  fr: {
    backBtn: "Retour au profil",
    title: "Conditions Générales d'Utilisation",
    date: "Dernière mise à jour : 9 juin 2026",
    sec1Title: "1. Acceptation des Conditions",
    sec1Desc: "L'accès et l'utilisation de l'application de réservation de Golden Park Station GPS sont soumis à l'acceptation et au respect des présentes Conditions Générales d'Utilisation (CGU). En utilisant nos services, vous acceptez d'être lié par ces règles sans aucune réserve.",
    sec2Title: "2. Politique d'Annulation et de Remboursement",
    sec2Desc: "Nous offrons de la flexibilité à nos clients tout en maintenant une organisation rigoureuse pour nos services (Hôtel, Piscine, Services de Lavage/Lubrifiants). Notre politique de remboursement est ainsi définie :",
    sec2GreenTitle: "Annulation effectuée plus de 45 minutes avant l'heure prévue :",
    sec2GreenDesc: "Vous êtes éligible à un remboursement automatique de votre dépôt ou paiement direct sur votre compte bancaire (via PayPal). Des frais de traitement administratifs fixes de 10 DH seront automatiquement déduits du montant remboursé.",
    sec2RedTitle: "Annulation effectuée moins de 45 minutes avant l'heure prévue :",
    sec2RedDesc: "La réservation est considérée comme tardive ou non-présentée (No-show). Le dépôt de garantie versé en ligne n'est pas remboursable et est conservé par l'établissement.",
    sec3Title: "3. Paiement en ligne et Réservations",
    sec3Desc1: "Le paiement en ligne sécurisé (via PayPal ou CMI) est obligatoire pour confirmer les réservations de l'hôtel, de la piscine et des services (lubrifiants).",
    sec3Desc2: "Concernant les commandes de notre restaurant, le paiement par carte en ligne est proposé par défaut dans le panier. Les utilisateurs souhaitant payer en espèces peuvent choisir l'option de paiement 'Sur Place' (Onsite) lors de la validation.",
    sec4Title: "4. Responsabilité de l'Utilisateur",
    sec4Desc: "L'utilisateur s'engage à fournir des informations exactes lors de son inscription (Nom complet, numéro de téléphone, email). Toute fausse information pourra entraîner l'annulation de vos réservations sans remboursement. Vous êtes seul responsable du maintien de la sécurité de votre compte d'accès."
  },
  ar: {
    backBtn: "الرجوع إلى الملف الشخصي",
    title: "الشروط العامة للاستخدام",
    date: "آخر تحديث: 9 يونيو 2026",
    sec1Title: "1. قبول الشروط",
    sec1Desc: "يخضع الوصول إلى تطبيق الحجز الخاص بمحطة غولدن بارك GPS واستخدامه لقبول واحترام الشروط العامة للاستخدام الحالية. باستخدام خدماتنا، فإنك توافق على الالتزام بهذه القواعد دون أي تحفظ.",
    sec2Title: "2. سياسة الإلغاء والاسترداد",
    sec2Desc: "نحن نقدم المرونة لعملائنا مع الحفاظ على تنظيم صارم لخدماتنا (الفندق، المسبح، خدمات التشحيم). سياسة الاسترداد الخاصة بنا محددة كالتالي:",
    sec2GreenTitle: "الإلغاء قبل أكثر من 45 دقيقة من الوقت المحدد:",
    sec2GreenDesc: "أنت مؤهل لاسترداد تلقائي لمبلغ العربون أو الدفع المباشر إلى حسابك البنكي (عبر PayPal). سيتم خصم رسوم إدارية ثابتة بقيمة 10 دراهم تلقائيًا من المبلغ المسترد.",
    sec2RedTitle: "الإلغاء قبل أقل من 45 دقيقة من الوقت المحدد:",
    sec2RedDesc: "يعتبر الحجز متأخراً أو حالة عدم حضور (No-show). عربون الضمان المدفوع عبر الإنترنت غير قابل للاسترداد ويحتفظ به المجمع.",
    sec3Title: "3. الدفق عبر الإنترنت والحجوزات",
    sec3Desc1: "الدفع الآمن عبر الإنترنت (عبر PayPal أو CMI) إلزامي لتأكيد حجوزات الفندق، المسبح والخدمات (التشحيم).",
    sec3Desc2: "بخصوص طلبات مطعمنا، يتم تقديم الدفع بالبطاقة عبر الإنترنت افتراضيًا في السلة. يمكن للمستخدمين الراغبين في الدفع نقدًا اختيار خيار الدفع 'في المحطة' (Sur Place) عند التأكيد.",
    sec4Title: "4. مسؤولية المستخدم",
    sec4Desc: "يتعهد المستخدم بتقديم معلومات دقيقة عند التسجيل (الاسم الكامل، رقم الهاتف، البريد الإلكتروني). أي معلومات خاطئة قد تؤدي إلى إلغاء حجوزاتك دون استرداد. أنت المسؤول الوحيد عن الحفاظ على أمن حسابك الشخصي."
  },
  en: {
    backBtn: "Back to Profile",
    title: "Terms of Service",
    date: "Last updated: June 9, 2026",
    sec1Title: "1. Acceptance of Terms",
    sec1Desc: "Access to and use of the booking application of Golden Park Station GPS are subject to the acceptance and compliance with these General Terms of Use (TOU). By using our services, you agree to be bound by these rules without reservation.",
    sec2Title: "2. Cancellation & Refund Policy",
    sec2Desc: "We offer flexibility to our clients while maintaining rigorous organization for our services (Hotel, Pool, Lubricants). Our refund policy is defined as follows:",
    sec2GreenTitle: "Cancellation made more than 45 minutes before scheduled time:",
    sec2GreenDesc: "You are eligible for an automatic refund of your deposit or direct payment to your bank account (via PayPal). A fixed administrative processing fee of 10 MAD will be automatically deducted from the refunded amount.",
    sec2RedTitle: "Cancellation made less than 45 minutes before scheduled time:",
    sec2RedDesc: "The reservation is considered late or a non-appearance (No-show). The security deposit paid online is non-refundable and is retained by the establishment.",
    sec3Title: "3. Online Payment & Bookings",
    sec3Desc1: "Secure online payment (via PayPal or CMI) is mandatory to confirm hotel, pool, and service (lubricant) bookings.",
    sec3Desc2: "For restaurant orders, online card payment is offered by default in the cart. Users wishing to pay in cash can choose the 'On Site' payment option upon confirmation.",
    sec4Title: "4. User Responsibility",
    sec4Desc: "The user agrees to provide accurate information during registration (Full name, phone number, email). Any false information may result in the cancellation of your bookings without refund. You are solely responsible for maintaining the security of your access account."
  },
  es: {
    backBtn: "Volver al Perfil",
    title: "Condiciones Generales de Uso",
    date: "Última actualización: 9 de junio de 2026",
    sec1Title: "1. Aceptación de las Condiciones",
    sec1Desc: "El acceso y uso de la aplicación de reservas de Golden Park Station GPS están sujetos a la aceptación y cumplimiento de las presentes Condiciones Generales de Uso (CGU). Al utilizar nuestros servicios, acepta estar sujeto a estas reglas sin reserva alguna.",
    sec2Title: "2. Política de Cancelación y Reembolso",
    sec2Desc: "Ofrecemos flexibilidad a nuestros clientes al mismo tiempo que mantenemos una organización rigurosa para nuestros servicios (Hotel, Piscina, Servicios de Lubricantes). Nuestra política de reembolso se define de la siguiente manera:",
    sec2GreenTitle: "Cancelación realizada más de 45 minutos antes de la hora prevista:",
    sec2GreenDesc: "Es elegible para un reembolso automático de su depósito o pago directo en su cuenta bancaria (a través de PayPal). Se deducirá automáticamente una tarifa fija de procesamiento administrativo de 10 DH del monto reembolsado.",
    sec2RedTitle: "Cancelación realizada menos de 45 minutos antes de la hora prevista:",
    sec2RedDesc: "La reserva se considera tardía o de no presentación (No-show). El depósito de garantía pagado en línea no es reembolsable y es retenido por el establecimiento.",
    sec3Title: "3. Pago en Línea y Reservas",
    sec3Desc1: "El pago seguro en línea (a través de PayPal o CMI) es obligatorio para confirmar las reservas de hotel, piscina y servicios (lubricantes).",
    sec3Desc2: "Con respecto a los pedidos de nuestro restaurante, el pago con tarjeta en línea se ofrece de forma predeterminada en el carrito. Los usuarios que deseen pagar en el lugar (Sur Place) pueden elegir esta opción al momento de la confirmación.",
    sec4Title: "4. Responsabilidad del Usuario",
    sec4Desc: "El usuario se compromete a proporcionar información precisa durante el registro (Nombre completo, número de teléfono, correo electrónico). Cualquier información falsa puede resultar en la cancelación de sus reservas sin reembolso. Usted es el único responsable de mantener la seguridad de su cuenta de acceso."
  }
};

export default function TermsOfService() {
    const { language } = useTranslation();
    const activeLang = (['fr', 'ar', 'en', 'es'].includes(language) ? language : 'fr') as keyof typeof content;
    const tLocal = content[activeLang];

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
                        {tLocal.backBtn}
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-[#FFCA28]/10 rounded-2xl border border-[#FFCA28]/20 mb-4">
                        <Scale className="w-8 h-8 text-[#FFCA28]" />
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
                            <BadgeInfo className="w-5 h-5 text-blue-400" />
                            <h2>{tLocal.sec1Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec1Desc}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <ShieldAlert className="w-5 h-5 text-[#FFCA28]" />
                            <h2>{tLocal.sec2Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec2Desc}
                        </p>
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                            <p className="leading-relaxed text-sm">
                                🟢 <strong>{tLocal.sec2GreenTitle}</strong>
                                <br />
                                {tLocal.sec2GreenDesc}
                            </p>
                            <p className="leading-relaxed text-sm text-red-400">
                                🔴 <strong>{tLocal.sec2RedTitle}</strong>
                                <br />
                                {tLocal.sec2RedDesc}
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <FileCheck className="w-5 h-5 text-blue-400" />
                            <h2>{tLocal.sec3Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec3Desc1}
                        </p>
                        <p className="leading-relaxed">
                            {tLocal.sec3Desc2}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3 text-white font-semibold text-lg">
                            <HelpCircle className="w-5 h-5 text-[#FFCA28]" />
                            <h2>{tLocal.sec4Title}</h2>
                        </div>
                        <p className="leading-relaxed">
                            {tLocal.sec4Desc}
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
