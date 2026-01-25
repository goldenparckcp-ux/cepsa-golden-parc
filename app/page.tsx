"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Coffee, Car, Utensils, BedDouble, Waves, Wrench, ChevronRight, Star, Clock, MapPin, Phone } from "lucide-react";
import { COLORS } from '@/lib/theme';
import CepsaLogo from "@/components/CepsaLogo";

export default function Home() {
  const router = useRouter();

  const SERVICES = [
    {
      id: 'restaurant',
      title: "Restaurant",
      desc: "Grillades, Pizza & Plats",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      icon: <Utensils className="w-5 h-5" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      link: "/restaurant"
    },
    {
      id: 'hotel',
      title: "Hôtel l'Escale",
      desc: "Repos confortable & Suites",
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
      icon: <BedDouble className="w-5 h-5" />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      link: "/hotel"
    },
    {
      id: 'pool',
      title: "Piscine & Détente",
      desc: "Summer Vibes 09h-19h",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
      icon: <Waves className="w-5 h-5" />,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      link: "/services/pool"
    },
    {
      id: 'lavage',
      title: "Lavage & Soin",
      desc: "Nettoyage Pro & Polissage",
      image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80",
      icon: <Car className="w-5 h-5" />,
      color: "text-red-500",
      bg: "bg-red-500/10",
      link: "/services/lavage"
    },
    {
      id: 'mecanique',
      title: "Atelier Méca",
      desc: "Vidange, Diagnostic & Pneus",
      image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80",
      icon: <Wrench className="w-5 h-5" />,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      link: "/services/mecanique"
    }
  ];

  return (
    <main className="min-h-screen bg-[#0F172A] pb-24 md:pb-10" style={{ backgroundColor: COLORS.bgDark }}>

      {/* --- HERO SECTION --- */}
      {/* Added 'md:h-96' for desktop height and centered max-width content for text */}
      <div className="relative h-72 md:h-[500px] w-full overflow-hidden rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl z-10 group">
        <img
          src="/image/cepsa-hero.jpg"
          className="w-full h-full object-cover opacity-80 transition-transform duration-1000 md:group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-[#0F172A]" />

        <div className="absolute bottom-8 left-6 right-6 md:left-20 md:right-20 md:bottom-16 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-600 text-white text-[10px] md:text-xs font-black px-2 py-0.5 md:py-1 md:px-3 rounded flex items-center gap-1 shadow-lg shadow-red-600/20">
                  <CepsaLogo className="w-3 h-3 text-white" /> CEPSA
                </span>
                <span className="text-gray-300 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Premium Station
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-white leading-none mb-2 drop-shadow-lg">
                GOLDEN <span className="text-red-600">PARK</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-xl font-medium max-w-lg">
                Outat El Haj, Route Nationale 15. Votre escale de luxe.
              </p>
            </div>

            {/* Desktop Only Call Action */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="text-green-400 font-bold text-lg">Ouvert 24h/24</div>
                <div className="text-gray-400 text-sm">7j/7 sans interruption</div>
              </div>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-600/30 animate-pulse-green">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTAINER FOR CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* INFO & COORDONNEES */}
        <div className="-mt-6 relative z-20 mx-4 md:mx-0">
          <div className="bg-[#1E293B] border border-white/10 p-4 md:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 backdrop-blur-xl">

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              </div>
              <div>
                <div className="text-white font-bold text-sm md:text-lg">Route Nationale 15</div>
                <div className="text-gray-500 text-xs md:text-sm">Outat El Haj, Maroc</div>
              </div>
            </div>

            {/* Divider Desktop */}
            <div className="hidden md:block w-px h-12 bg-white/10" />

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-600/10 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              </div>
              <div>
                <div className="text-white font-bold text-sm md:text-lg">Service Continu</div>
                <div className="text-gray-500 text-xs md:text-sm">Café & Store 24/7</div>
              </div>
            </div>

            <a href="tel:0661690179" className="w-full md:w-auto px-8 py-4 bg-green-600 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all group">
              <Phone className="w-5 h-5 text-white group-hover:animate-shake" />
              <span className="text-white font-bold md:text-lg">06 61 69 01 79</span>
            </a>
          </div>
        </div>

        {/* --- SERVICES GRID --- */}
        {/* Changed from 'grid-cols-1' to 'md:grid-cols-2 lg:grid-cols-3' */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-white">Nos Services</h2>
            <span className="text-red-500 font-bold hover:text-red-400 cursor-pointer transition-colors">Découvrir tout</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, idx) => (
              <button
                key={service.id}
                onClick={() => router.push(service.link)}
                className={`group relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl transition-all hover:scale-[1.02] hover:border-white/10 ${idx === 0 ? 'md:col-span-2 lg:col-span-2 h-64 md:h-80' : 'h-64 md:h-80'
                  }`}
              >
                {/* Background Image */}
                <img
                  src={service.image}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end items-start">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${service.bg} backdrop-blur-md flex items-center justify-center mb-4 border border-white/10 group-hover:-translate-y-2 transition-transform duration-300`}>
                    <div className={service.color}>{service.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                      {service.desc}
                    </p>
                  </div>
                </div>

                {/* Hover Reveal Arrow */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 border border-white/10">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- PROMO BANNER --- */}
        <div className="mt-12 mb-20 md:mb-12">
          <div className="bg-gradient-to-r from-red-600 to-red-900 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl group">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-lg inline-block mb-4 shadow-lg">
                  OFFRE LIMITÉE
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Menu Famille <span className="text-red-200">-20%</span>
                </h3>
                <p className="text-red-100 text-sm md:text-lg opacity-90">
                  Validable uniquement ce week-end sur tous les plats mixtes. Profitez en famille !
                </p>
              </div>
              <button onClick={() => router.push('/restaurant')} className="bg-white text-red-900 font-bold px-8 py-4 rounded-2xl shadow-xl hover:bg-gray-100 transition-colors text-lg whitespace-nowrap active:scale-95">
                Commander Maintenant
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
