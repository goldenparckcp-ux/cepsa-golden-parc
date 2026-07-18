"use client";

import Link from 'next/link';
import { ArrowLeft, Trash2, Info, ShieldAlert, CheckCircle2, LogIn, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/state/LanguageContext';

const content = {
  fr: {
    backBtn: "Retour à l'accueil",
    title: "Suppression des Données & Compte",
    subtitle: "Conformément au RGPD et aux politiques de Meta (Facebook Login)",
    infoTitle: "Informations sur la suppression de vos données",
    infoDesc: "Si vous souhaitez supprimer définitivement toutes vos données associées à votre profil (historiques de réservation d'hôtel, tickets de piscine, historique de lavage, commandes de restaurant), vous pouvez le faire directement ci-dessous en vous authentifiant, ou nous contacter par e-mail.",
    method1Title: "Suppression en ligne immédiate",
    method1Desc: "Connectez-vous à votre compte et validez la suppression en un clic. Toutes vos données seront effacées immédiatement et définitivement de nos serveurs.",
    method2Title: "Par e-mail (Support)",
    method2Desc: "Envoyez une demande de suppression à l'adresse support :",
    method2Meta: "Précisez votre nom complet et le téléphone associé. Le traitement sera fait sous 48 heures.",
    warnTitle: "Quelles données seront supprimées ?",
    warnLi1: "Vos informations de profil personnel.",
    warnLi2: "Votre historique complet de réservations d'hôtel, piscine et lavage.",
    warnLi3: "Votre historique de commandes de restaurant.",
    warnLi4: "Vos clés d'identification tierces liées.",
    actionHeader: "Actions de suppression de compte",
    successTitle: "Compte supprimé avec succès",
    successDesc: "Votre compte et toutes vos données personnelles ont été supprimés définitivement. Redirection en cours vers l'accueil...",
    dangerTitle: "Zone de danger : Suppression irréversible",
    dangerDesc: "Vous êtes actuellement connecté en tant que {email}. Cliquer sur le bouton ci-dessous supprimera définitivement votre session, votre compte et tout votre historique de Golden Park.",
    deleteBtn: "Supprimer définitivement mon compte et mes données",
    deletingText: "Suppression en cours...",
    loginPrompt: "Pour supprimer votre compte en ligne immédiatement, veuillez d'abord vous connecter pour prouver votre identité.",
    loginBtn: "Me connecter pour supprimer mon compte",
    confirmMsg: "ATTENTION: Êtes-vous absolument sûr de vouloir supprimer définitivement votre compte ainsi que toutes vos données associées ? Cette action est irréversible."
  },
  ar: {
    backBtn: "العودة للرئيسية",
    title: "حذف الحساب والبيانات",
    subtitle: "وفقًا للائحة العامة لحماية البيانات (GDPR) وسياسات ميتا (تسجيل دخول فيسبوك)",
    infoTitle: "معلومات حول حذف بياناتك",
    infoDesc: "إذا كنت ترغب في حذف جميع البيانات المرتبطة بملفك الشخصي نهائيًا (سجل حجوزات الفندق، تذاكر المسبح، سجل الغسيل، طلبات المطعم)، يمكنك القيام بذلك مباشرة أدناه بعد تسجيل الدخول، أو الاتصال بنا عبر البريد الإلكتروني.",
    method1Title: "حذف مباشر عبر الإنترنت",
    method1Desc: "قم بتسجيل الدخول إلى حسابك وقم بتأكيد الحذف بنقرة واحدة. سيتم مسح جميع بياناتك فورًا ونهائيًا من خوادمنا.",
    method2Title: "عبر البريد الإلكتروني (الدعم)",
    method2Desc: "أرسل طلب حذف إلى عنوان الدعم الإلكتروني التالي:",
    method2Meta: "حدد اسمك الكامل ورقم الهاتف المرتبط بالحساب. سيتم معالجة الطلب في غضون 48 ساعة.",
    warnTitle: "ما هي البيانات التي سيتم حذفها؟",
    warnLi1: "معلومات ملفك الشخصي.",
    warnLi2: "سجل حجوزات الفندق والمسبح والغسيل بالكامل.",
    warnLi3: "سجل طلبات المطعم الخاص بك.",
    warnLi4: "مفاتيح الهوية الخارجية المرتبطة.",
    actionHeader: "إجراءات حذف الحساب",
    successTitle: "تم حذف الحساب بنجاح",
    successDesc: "تم حذف حسابك وجميع بياناتك الشخصية نهائيًا. جاري توجيهك إلى الصفحة الرئيسية...",
    dangerTitle: "منطقة الخطر: حذف نهائي لا رجعة فيه",
    dangerDesc: "أنت متصل حاليًا باسم {email}. النقر على الزر أدناه سيؤدي إلى حذف جلستك وحسابك وجميع سجلاتك في غولدن بارك نهائيًا.",
    deleteBtn: "حذف حسابي وبياناتي نهائيًا",
    deletingText: "جاري الحذف...",
    loginPrompt: "لحذف حسابك عبر الإنترنت فورًا، يرجى تسجيل الدخول أولاً لإثبات هويتك.",
    loginBtn: "تسجيل الدخول لحذف حسابي",
    confirmMsg: "تنبيه: هل أنت متأكد تمامًا من رغبتك في حذف حسابك وجميع بياناتك المرتبطة نهائيًا؟ هذا الإجراء لا يمكن التراجع عنه."
  },
  en: {
    backBtn: "Back to Home",
    title: "Data & Account Deletion",
    subtitle: "In compliance with GDPR and Meta (Facebook Login) Policies",
    infoTitle: "Information about deleting your data",
    infoDesc: "If you wish to permanently delete all data associated with your profile (hotel booking history, pool tickets, car wash history, restaurant orders), you can do so directly below by logging in, or contact us by email.",
    method1Title: "Immediate Online Deletion",
    method1Desc: "Log in to your account and validate the deletion in one click. All your data will be erased immediately and permanently from our servers.",
    method2Title: "By Email (Support)",
    method2Desc: "Send a deletion request to the support email address:",
    method2Meta: "Specify your full name and the associated phone number. The request will be processed within 48 hours.",
    warnTitle: "What data will be deleted?",
    warnLi1: "Your personal profile information.",
    warnLi2: "Your complete history of hotel, pool, and wash bookings.",
    warnLi3: "Your restaurant order history.",
    warnLi4: "Your linked third-party authentication keys.",
    actionHeader: "Account Deletion Actions",
    successTitle: "Account successfully deleted",
    successDesc: "Your account and all your personal data have been permanently deleted. Redirecting to the homepage...",
    dangerTitle: "Danger Zone: Irreversible Deletion",
    dangerDesc: "You are currently logged in as {email}. Clicking the button below will permanently delete your session, your account, and all your Golden Park history.",
    deleteBtn: "Permanently delete my account and data",
    deletingText: "Deleting...",
    loginPrompt: "To delete your account online immediately, please log in first to verify your identity.",
    loginBtn: "Log in to delete my account",
    confirmMsg: "WARNING: Are you absolutely sure you want to permanently delete your account and all associated data? This action is irreversible."
  },
  es: {
    backBtn: "Volver al Inicio",
    title: "Eliminación de Datos y Cuenta",
    subtitle: "En conformidad con el RGPD y las políticas de Meta (Inicio de sesión de Facebook)",
    infoTitle: "Información sobre la eliminación de sus datos",
    infoDesc: "Si desea eliminar de forma permanente todos los datos asociados con su perfil (historial de reservas de hotel, entradas de piscina, historial de lavado, pedidos de restaurante), puede hacerlo directamente a continuación iniciando sesión, o contáctenos por correo electrónico.",
    method1Title: "Eliminación en línea inmediata",
    method1Desc: "Inicie sesión en su cuenta y confirme la eliminación en un clic. Todos sus datos se borrarán de forma inmediata y permanente de nuestros servidores.",
    method2Title: "Por Correo Electrónico (Soporte)",
    method2Desc: "Envíe una solicitud de eliminación a la dirección de correo electrónico de soporte:",
    method2Meta: "Especifique su nombre completo y el teléfono asociado. El procesamiento se realizará en un plazo de 48 horas.",
    warnTitle: "¿Qué datos se eliminarán?",
    warnLi1: "La información de su perfil personal.",
    warnLi2: "Su historial completo de reservas de hotel, piscina y lavado.",
    warnLi3: "Su historial de pedidos de restaurante.",
    warnLi4: "Sus claves de autenticación de terceros vinculadas.",
    actionHeader: "Acciones de eliminación de cuenta",
    successTitle: "Cuenta eliminada con éxito",
    successDesc: "Su cuenta y todos sus datos personales han sido eliminados de forma permanente. Redirigiendo a la página de inicio...",
    dangerTitle: "Zona de peligro: Eliminación irreversible",
    dangerDesc: "Actualmente ha iniciado sesión como {email}. Al hacer clic en el botón a continuación, se eliminará permanentemente su sesión, su cuenta y todo su historial de Golden Park.",
    deleteBtn: "Eliminar definitivamente mi cuenta y datos",
    deletingText: "Eliminando...",
    loginPrompt: "Para eliminar su cuenta en línea de inmediato, inicie sesión primero para verificar su identidad.",
    loginBtn: "Iniciar sesión para eliminar mi cuenta",
    confirmMsg: "ATENCIÓN: ¿Está absolutamente seguro de que desea eliminar permanentemente su cuenta y todos los datos asociados? Esta acción es irreversible."
  }
};

export default function DeleteAccountInstructions() {
    const router = useRouter();
    const { language } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const activeLang = (['fr', 'ar', 'en', 'es'].includes(language) ? language : 'fr') as keyof typeof content;
    const tLocal = content[activeLang];

    useEffect(() => {
        // Check current session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const handleDeleteAccount = async () => {
        if (!confirm(tLocal.confirmMsg)) {
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
                throw new Error(data.error || "Error occurred during deletion.");
            }

            setSubmitted(true);
            setTimeout(() => {
                // Redirect to homepage after success
                router.push('/');
            }, 3000);
        } catch (err: any) {
            console.error("GDPR Account deletion error:", err);
            setErrorMessage(err.message || "Failed to delete account. Please try again later.");
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
                        {tLocal.backBtn}
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl border border-red-500/20 mb-4">
                        <Trash2 className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-red-400 bg-clip-text text-transparent font-sans">
                        {tLocal.title}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {tLocal.subtitle}
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
                                <h2>{tLocal.infoTitle}</h2>
                            </div>
                            <p className="leading-relaxed">
                                {tLocal.infoDesc}
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</span>
                                    {tLocal.method1Title}
                                </h3>
                                <p className="text-sm leading-relaxed">
                                    {tLocal.method1Desc}
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-[#FFCA28] text-xs font-bold">2</span>
                                    {tLocal.method2Title}
                                </h3>
                                <p className="text-sm leading-relaxed">
                                    {tLocal.method2Desc}
                                    <br />
                                    <strong className="text-[#FFCA28] block mt-1 text-center py-2 bg-white/5 rounded-xl border border-white/5 my-2">
                                        golden.park.cp@gmail.com
                                    </strong>
                                    {tLocal.method2Meta}
                                </p>
                            </div>
                        </div>

                        <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-2">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <ShieldAlert className="w-5 h-5 text-red-400" />
                                <h3>{tLocal.warnTitle}</h3>
                            </div>
                            <ul className="list-disc pl-6 text-sm space-y-1">
                                <li>{tLocal.warnLi1}</li>
                                <li>{tLocal.warnLi2}</li>
                                <li>{tLocal.warnLi3}</li>
                                <li>{tLocal.warnLi4}</li>
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
                            {tLocal.actionHeader}
                        </h2>

                        {submitted ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8 text-center space-y-3"
                            >
                                <CheckCircle2 className="w-16 h-16 text-green-400 animate-bounce" />
                                <h3 className="text-white font-bold text-lg">{tLocal.successTitle}</h3>
                                <p className="text-sm text-gray-400 max-w-md">
                                    {tLocal.successDesc}
                                </p>
                            </motion.div>
                        ) : user ? (
                            <div className="space-y-6">
                                <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-5 flex gap-4 items-start">
                                    <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-white font-bold mb-1">{tLocal.dangerTitle}</h4>
                                        <p className="text-sm text-gray-400">
                                            {tLocal.dangerDesc.replace('{email}', user.email || user.phone)}
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
                                    {loading ? tLocal.deletingText : tLocal.deleteBtn}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-4">
                                <p className="text-sm text-gray-400">
                                    {tLocal.loginPrompt}
                                </p>
                                <Link
                                    href="/profile"
                                    className="inline-flex items-center gap-2 bg-[#FFCA28] hover:bg-[#FFD54F] text-black font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-yellow-500/10"
                                >
                                    <LogIn className="w-5 h-5" />
                                    {tLocal.loginBtn}
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
