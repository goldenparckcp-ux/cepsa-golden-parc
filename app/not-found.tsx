"use client";

import Link from "next/link";
import { MoveLeft, HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/state/LanguageContext";

const content = {
  fr: {
    title: "404 - Page Introuvable",
    desc: "Oups ! La page que vous recherchez n'existe pas ou a été déplacée.",
    btn: "Retour à l'accueil"
  },
  ar: {
    title: "404 - الصفحة غير موجودة",
    desc: "عذراً! الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    btn: "العودة للرئيسية"
  },
  en: {
    title: "404 - Page Not Found",
    desc: "Oops! The page you are looking for does not exist or has been moved.",
    btn: "Back to Home"
  },
  es: {
    title: "404 - Página no encontrada",
    desc: "¡Ups! La página que busca no existe o ha sido movida.",
    btn: "Volver al inicio"
  }
};

export default function NotFound() {
  const { language } = useTranslation();
  const activeLang = (['fr', 'ar', 'en', 'es'].includes(language) ? language : 'fr') as keyof typeof content;
  const tLocal = content[activeLang];

  return (
    <div className="min-h-[85vh] bg-[#070A13] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-600/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-500/5">
          <HelpCircle className="w-12 h-12 text-red-500 animate-bounce" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{tLocal.title}</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            {tLocal.desc}
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            <MoveLeft className="w-4 h-4" />
            {tLocal.btn}
          </Link>
        </div>
      </div>
    </div>
  );
}
