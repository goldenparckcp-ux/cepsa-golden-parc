"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/state/LanguageContext";
import { MapPin, PhoneCall, Mail, ChevronRight, Fuel, Bed, Utensils, Waves } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full bg-[#070A13] border-t border-white/10 pt-16 pb-32 px-4 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand & Address */}
        <div className="space-y-6">
          <h2 className="text-white text-2xl font-black tracking-tight">
            Golden Parc <span className="text-red-500">Cepsa</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            L'escale premium par excellence sur la RN15. Profitez d'un moment de repos parfait près de Missour et Tandit.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-400">
              <MapPin className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-sm">Route Nationale 15, Outat El Haj, Maroc</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <PhoneCall className="w-5 h-5 text-red-500 shrink-0" />
              <a href="tel:0600000000" className="text-sm hover:text-white transition-colors">SOS Dépannage: 06 00 00 00 00</a>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="w-5 h-5 text-red-500 shrink-0" />
              <a href="mailto:contact@goldenparkstation.com" className="text-sm hover:text-white transition-colors">contact@goldenparkstation.com</a>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-6">
          <h3 className="text-white text-lg font-bold">Nos Services</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/#station" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <Fuel className="w-4 h-4" /> Station Cepsa & Vidange
              </Link>
            </li>
            <li>
              <Link href="/hotel" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <Bed className="w-4 h-4" /> Hôtel L'Escale
              </Link>
            </li>
            <li>
              <Link href="/restaurant" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <Utensils className="w-4 h-4" /> Restaurant & Café
              </Link>
            </li>
            <li>
              <Link href="/services/pool" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <Waves className="w-4 h-4" /> Piscine & Espace Vert
              </Link>
            </li>
          </ul>
        </div>

        {/* Liens Rapides */}
        <div className="space-y-6">
          <h3 className="text-white text-lg font-bold">Liens Rapides</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> À Propos de Nous
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> Articles & Actualités
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> FAQ (Questions fréquentes)
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> Mon Espace Client
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-6">
          <h3 className="text-white text-lg font-bold">Légal</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-500" /> Conditions d'utilisation
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm text-center md:text-left">
          © {new Date().getFullYear()} Golden Parc Station GPS. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
