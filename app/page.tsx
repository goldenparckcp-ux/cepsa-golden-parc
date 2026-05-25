"use client";

import { useRouter } from 'next/navigation';
import { Car, Utensils, BedDouble, Waves, ChevronRight, Star, Clock, MapPin, Phone, Navigation } from "lucide-react";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/state/LanguageContext';

// Coordonnées GPS de Cepsa Golden Parc (depuis Google Maps)
const STATION_COORDS = {
  lat: 33.5731,  // Latitude approximative
  lng: -7.5898   // Longitude approximative
};

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculer la distance entre deux points GPS (formule Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
  };

  useEffect(() => {
    // Demander la géolocalisation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Calculer la distance
          const dist = calculateDistance(userLat, userLng, STATION_COORDS.lat, STATION_COORDS.lng);
          setDistance(dist);

          // Estimer le temps (vitesse moyenne 60 km/h sur autoroute)
          const timeInHours = dist / 60;
          const timeInMinutes = Math.round(timeInHours * 60);
          setEta(timeInMinutes);
          setLoading(false);
        },
        (error) => {
          console.log('Géolocalisation refusée:', error);
          setLoading(false);
        }
      );
    }
  }, []);

  const SERVICES = [
    {
      id: 'restaurant',
      title: t('home.service.resto.title'),
      desc: t('home.service.resto.desc'),
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      icon: <Utensils className="w-5 h-5" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      link: "/restaurant"
    },
    {
      id: 'hotel',
      title: t('home.service.hotel.title'),
      desc: t('home.service.hotel.desc'),
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
      icon: <BedDouble className="w-5 h-5" />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      link: "/hotel"
    },
    {
      id: 'pool',
      title: t('home.service.pool.title'),
      desc: t('home.service.pool.desc'),
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
      icon: <Waves className="w-5 h-5" />,
      color: "text-red-400",
      bg: "bg-red-500/10",
      link: "/services/pool"
    },
    {
      id: 'lavage',
      title: t('home.service.wash.title'),
      desc: t('home.service.wash.desc'),
      image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80",
      icon: <Car className="w-5 h-5" />,
      color: "text-red-500",
      bg: "bg-red-500/10",
      link: "/services/lavage"
    }
  ];

  return (
    <main className="min-h-screen bg-[#0F172A] pb-24 md:pb-10">

      {/* --- HERO SECTION --- */}
      <div className="relative h-72 md:h-[500px] w-full overflow-hidden rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl z-10 group">
        <Image
          src="/image/cepsa-hero.jpg"
          alt="Golden Parc Station - Premium CEPSA Service Station"
          fill
          priority
          className="object-cover opacity-80 transition-transform duration-1000 md:group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-[#0F172A]" />

        <div className="absolute bottom-8 left-6 right-6 md:left-20 md:right-20 md:bottom-16 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-600 text-white text-[10px] md:text-xs font-black px-2 py-0.5 md:py-1 md:px-3 rounded flex items-center gap-1 shadow-lg shadow-red-600/20">
                  CEPSA
                </span>
                <span className="text-gray-300 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Premium Station
                </span>
              </div>
              <h1 className={`text-4xl md:text-7xl font-black text-white leading-none mb-2 drop-shadow-lg ${t('home.hero.title') === 'جولدن بارك' ? 'font-sans' : ''}`}>
                {t('home.hero.title') === 'GOLDEN PARC' ? (
                  <>GOLDEN <span className="text-red-600">PARC</span></>
                ) : (
                  t('home.hero.title')
                )}
              </h1>
              <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-amber-500/30 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <span className="text-xs md:text-sm font-black text-amber-500 tracking-[0.4em] ml-1">STATION</span>
              </div>
              <p className="text-gray-400 text-sm md:text-xl font-medium max-w-lg" dir="auto">
                {t('home.hero.subtitle')}
              </p>
            </div>

            {/* Desktop Only Call Action */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="text-green-400 font-bold text-lg">{t('home.hero.open')}</div>
                <div className="text-gray-400 text-sm">{t('home.hero.open.sub')}</div>
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

        {/* GPS ETA CARD */}
        {eta !== null && !loading && (
          <div className="-mt-6 relative z-30 mx-4 md:mx-0 mb-6">
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(214,0,28,0.4)] border border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-white/90 text-sm mb-3">
                    <Navigation className="w-4 h-4" />
                    <span className="font-bold">{t('home.eta.route')}</span>
                  </div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <h2 className="text-white text-5xl md:text-6xl font-black">
                      {eta} min
                    </h2>
                    <span className="text-white/80 text-lg md:text-xl font-medium">
                      ({distance?.toFixed(1)} km)
                    </span>
                  </div>
                  <p className="text-white/80 text-sm md:text-base">
                    {t('home.eta.arrival')} <span className="font-bold text-white">Golden Parc Station</span>
                  </p>
                </div>

                <div className="hidden md:block">
                  <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
                    <MapPin className="w-12 h-12 text-white relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              </div>
              <div>
                <div className="text-white font-bold text-sm md:text-lg">{t('home.info.service')}</div>
                <div className="text-gray-500 text-xs md:text-sm">{t('home.info.cafe')}</div>
              </div>
            </div>

            <a href="tel:0661690179" className="w-full md:w-auto px-8 py-4 bg-green-600 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all group">
              <Phone className="w-5 h-5 text-white group-hover:animate-shake" />
              <span className="text-white font-bold md:text-lg">06 61 69 01 79</span>
            </a>
          </div>
        </div>

        {/* --- SERVICES GRID --- */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between px-2" dir="auto">
            <h2 className="text-2xl font-black text-white">{t('home.services.title')}</h2>
            <span className="text-red-500 font-bold hover:text-red-400 cursor-pointer transition-colors">{t('home.services.all')}</span>
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
                <Image
                  src={service.image}
                  alt={`${service.title} - ${service.desc}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
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

        {/* --- MAP LOCATION BANNER --- */}
        <div className="mt-12 mb-20 md:mb-12">
          <a
            href="https://maps.app.goo.gl/wWx1BeVM899uyPJ58"
            target="_blank"
            rel="noopener noreferrer"
            className="block group relative rounded-3xl overflow-hidden shadow-2xl h-64 md:h-80 border border-white/10"
          >
            {/* Map Imagery Background */}
            <div className="absolute inset-0 bg-[#1E293B]">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80"
                alt="Map Background"
                fill
                className="object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay Gradient to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-transparent pb-10" />
            </div>

            <div className="absolute inset-0 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between z-10">
              <div className="max-w-2xl" dir="auto">
                <div className="bg-red-600/20 backdrop-blur-sm border border-red-500/30 text-red-500 text-xs font-black px-3 py-1.5 rounded-lg inline-flex items-center gap-2 mb-4 shadow-lg">
                  <MapPin className="w-3 h-3" /> {t('home.map.badge')}
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                  {t('home.map.title')}
                </h3>
                <p className="text-gray-300 text-sm md:text-lg font-medium max-w-lg mb-6">
                  {t('home.map.desc')}
                </p>
                <div className="inline-flex items-center gap-2 text-red-500 font-bold group-hover:gap-4 transition-all">
                  {t('home.map.btn')} <ChevronRight className="w-5 h-5 auto-flip-icon" />
                </div>
              </div>

              {/* Visual Map Pin Icon Area */}
              <div className="hidden md:flex relative w-32 h-32 items-center justify-center mr-10">
                <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping" />
                <div className="relative z-10 bg-white p-4 rounded-full shadow-[0_0_50px_rgba(214,0,28,0.5)]">
                  <MapPin className="w-10 h-10 text-red-600 fill-red-600" />
                </div>
              </div>
            </div>
          </a>
        </div>

      </div>
    </main>
  );
}
