"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/state/LanguageContext";

const content = {
  fr: {
    title: "Une erreur est survenue",
    desc: "Désolé, une erreur inattendue s'est produite lors du chargement de cette page.",
    btn: "Réessayer"
  },
  ar: {
    title: "حدث خطأ ما",
    desc: "عذراً، حدث خطأ غير متوقع أثناء تحميل هذه الصفحة.",
    btn: "إعادة المحاولة"
  },
  en: {
    title: "Something went wrong",
    desc: "Sorry, an unexpected error occurred while loading this page.",
    btn: "Try again"
  },
  es: {
    title: "Ha ocurrido un error",
    desc: "Lo sentimos, ocurrió un error inesperado al cargar esta página.",
    btn: "Reintentar"
  }
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useTranslation();
  const activeLang = (['fr', 'ar', 'en', 'es'].includes(language) ? language : 'fr') as keyof typeof content;
  const tLocal = content[activeLang];

  useEffect(() => {
    console.error("Runtime error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[85vh] bg-[#070A13] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{tLocal.title}</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            {tLocal.desc}
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            {tLocal.btn}
          </button>
        </div>
      </div>
    </div>
  );
}
