"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/state/LanguageContext";
import { MapPin, PhoneCall, Mail, ChevronRight, Fuel, Bed, Utensils, Waves } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const content = {
  fr: {
    brand: "Golden Park",
    desc: "L'escale premium par excellence sur la RN15. Profitez d'un moment de repos parfait près de Missour et Tandit.",
    address: "Route Nationale 15, Outat El Haj, Maroc",
    sos: "SOS Dépannage",
    servicesTitle: "Nos Services",
    service1: "Station Cepsa & Vidange",
    service2: "Hôtel L'Escale",
    service3: "Restaurant & Café",
    service4: "Piscine & Espace Vert",
    linksTitle: "Liens Rapides",
    link1: "À Propos de Nous",
    link2: "Articles & Actualités",
    link3: "FAQ (Questions fréquentes)",
    link4: "Mon Espace Client",
    legalTitle: "Légal",
    legal1: "Politique de confidentialité",
    legal2: "Conditions d'utilisation",
    rights: "Tous droits réservés."
  },
  ar: {
    brand: "غولدن بارك",
    desc: "المحطة الممتازة بامتياز على الطريق الوطنية 15. استمتع بلحظة راحة مثالية بالقرب من ميسور وتانديت.",
    address: "الطريق الوطنية رقم 15، أوطاط الحاج، المغرب",
    sos: "SOS المساعدة والاستراحة",
    servicesTitle: "خدماتنا",
    service1: "محطة Cepsa وتغيير الزيت",
    service2: "فندق L'Escale",
    service3: "المطعم والمقهى",
    service4: "المسبح والمساحات الخضراء",
    linksTitle: "روابط سريعة",
    link1: "معلومات عنا",
    link2: "المقالات والأخبار",
    link3: "الأسئلة الشائعة",
    link4: "ملفي الشخصي",
    legalTitle: "قانوني",
    legal1: "سياسة الخصوصية",
    legal2: "شروط الاستخدام",
    rights: "جميع الحقوق محفوظة."
  },
  en: {
    brand: "Golden Park",
    desc: "The premium stopover par excellence on RN15. Enjoy a perfect moment of rest near Missour and Tandit.",
    address: "National Route 15, Outat El Haj, Morocco",
    sos: "SOS Assistance",
    servicesTitle: "Our Services",
    service1: "Cepsa Station & Oil Change",
    service2: "L'Escale Hotel",
    service3: "Restaurant & Cafe",
    service4: "Pool & Green Space",
    linksTitle: "Quick Links",
    link1: "About Us",
    link2: "Articles & News",
    link3: "FAQ (Frequently Asked)",
    link4: "My Customer Space",
    legalTitle: "Legal",
    legal1: "Privacy Policy",
    legal2: "Terms of Use",
    rights: "All rights reserved."
  },
  es: {
    brand: "Golden Park",
    desc: "La parada premium por excelencia en la RN15. Disfrute de un momento de descanso perfecto cerca de Missour y Tandit.",
    address: "Ruta Nacional 15, Outat El Haj, Marruecos",
    sos: "SOS Asistencia",
    servicesTitle: "Nuestros Servicios",
    service1: "Estación Cepsa y Cambio de Aceite",
    service2: "Hotel L'Escale",
    service3: "Restaurante y Café",
    service4: "Piscina y Zona Verde",
    linksTitle: "Enlaces Rápidos",
    link1: "Sobre Nosotros",
    link2: "Artículos y Noticias",
    link3: "FAQ (Preguntas frecuentes)",
    link4: "Mi Área de Cliente",
    legalTitle: "Legal",
    legal1: "Política de privacidad",
    legal2: "Condiciones de uso",
    rights: "Todos los derechos reservados."
  }
};

export default function Footer() {
  const { language } = useTranslation();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [phone, setPhone] = useState("06 00 00 00 00");
  const [email, setEmail] = useState("contact@goldenparkstation.com");

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await supabase
          .from("home_promos")
          .select("*")
          .eq("sort_order", -999)
          .single();
        if (data) {
          if (data.link_path) setPhone(data.link_path);
          if (data.gradient_class) setEmail(data.gradient_class);
        }
      } catch (err) {
        console.error("Failed to load footer contact settings", err);
      }
    };
    fetchContact();
  }, []);

  const activeLang = (['fr', 'ar', 'en', 'es'].includes(language) ? language : 'fr') as keyof typeof content;
  const tLocal = content[activeLang];
  
  return (
    <footer className={`w-full bg-[#070A13] border-t border-white/10 pt-16 pb-32 px-4 relative z-10 ${isHome ? 'block' : 'hidden md:block'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand & Address */}
        <div className="space-y-6">
          <h2 className="text-white text-2xl font-black tracking-tight font-sans">
            {tLocal.brand} <span className="text-red-500">Cepsa</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {tLocal.desc}
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-400">
              <MapPin className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-sm">{tLocal.address}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <PhoneCall className="w-5 h-5 text-red-500 shrink-0" />
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-sm hover:text-white transition-colors">{tLocal.sos}: {phone}</a>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="w-5 h-5 text-red-500 shrink-0" />
              <a href={`mailto:${email}`} className="text-sm hover:text-white transition-colors font-sans">{email}</a>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-6">
          <h3 className="text-white text-lg font-bold">{tLocal.servicesTitle}</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/#station" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <Fuel className="w-4 h-4" /> {tLocal.service1}
              </Link>
            </li>
            <li>
              <Link href="/hotel" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <Bed className="w-4 h-4" /> {tLocal.service2}
              </Link>
            </li>
            <li>
              <Link href="/restaurant" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <Utensils className="w-4 h-4" /> {tLocal.service3}
              </Link>
            </li>
            <li>
              <Link href="/services/pool" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <Waves className="w-4 h-4" /> {tLocal.service4}
              </Link>
            </li>
          </ul>
        </div>

        {/* Liens Rapides */}
        <div className="space-y-6">
          <h3 className="text-white text-lg font-bold">{tLocal.linksTitle}</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> {tLocal.link1}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> {tLocal.link2}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> {tLocal.link3}
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> {tLocal.link4}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-6">
          <h3 className="text-white text-lg font-bold">{tLocal.legalTitle}</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> {tLocal.legal1}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> {tLocal.legal2}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm text-center md:text-left font-sans">
          © {new Date().getFullYear()} {tLocal.brand} Station GPS. {tLocal.rights}
        </p>
      </div>
    </footer>
  );
}
