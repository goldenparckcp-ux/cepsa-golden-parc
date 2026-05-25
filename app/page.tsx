"use client";

import { useRouter } from 'next/navigation';
import { Car, Utensils, BedDouble, Waves, ChevronRight, Star, MapPin, Phone, Search, Wrench, ShoppingBag, Wind, Zap, Clock, Navigation } from "lucide-react";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/state/LanguageContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Chatbot } from '@/components/ui/Chatbot';

// Coordonnées GPS de Cepsa Golden Parc
const STATION_COORDS = {
  lat: 33.5731,
  lng: -7.5898
};

// Formule de Haversine pour la distance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const dist = calculateDistance(userLat, userLng, STATION_COORDS.lat, STATION_COORDS.lng);
          setDistance(dist);
          // Vitesse moyenne estimée: 60km/h
          setEta(Math.round((dist / 60) * 60));
        },
        (error) => console.log('Géolocalisation refusée:', error)
      );
    }
  }, []);

  const SERVICES = [
    { id: 'restaurant', title: t('home.service.resto.title') || "Restaurant", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", icon: <Utensils className="w-8 h-8" />, color: "from-amber-500 to-orange-600", link: "/restaurant", delay: 0.1 },
    { id: 'lube', title: t('home.service.lube.title') || "Lubrifiants", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=600&q=80", icon: <Wrench className="w-8 h-8" />, color: "from-gray-700 to-gray-900", link: "/services/lubrifiants", delay: 0.3 },
    { id: 'boutique', title: t('home.service.boutique.title') || 'Boutique', image: "https://images.unsplash.com/photo-1604719312566-8fa20f137782?auto=format&fit=crop&w=600&q=80", icon: <ShoppingBag className="w-8 h-8" />, color: "from-green-500 to-emerald-700", link: "#", delay: 0.4 },
    { id: 'pool', title: t('home.service.pool.title') || "Piscine", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80", icon: <Waves className="w-8 h-8" />, color: "from-cyan-400 to-blue-600", link: "/services/pool", delay: 0.5 },
    { id: 'hotel', title: t('home.service.hotel.title') || "Hôtel", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80", icon: <BedDouble className="w-8 h-8" />, color: "from-purple-500 to-indigo-600", link: "/hotel", delay: 0.6 }
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120 } }
  };

  return (
    <main className="min-h-screen bg-[#070A13] pb-24 font-sans text-white overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[65vh] w-full overflow-hidden rounded-b-[4rem] shadow-2xl">
        <motion.div style={{ y: y1 }} className="absolute inset-0">
          <Image
            src="/image/cepsa-hero.jpg"
            alt="Golden Parc Station"
            fill
            priority
            className="object-cover opacity-50"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-black/40 to-transparent" />
        
        <motion.div 
          style={{ opacity: opacityHero }}
          className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-10 max-w-7xl mx-auto w-full"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-red-600/20 backdrop-blur-md border border-red-500/40 text-red-500 text-[10px] md:text-xs font-black px-4 py-2 rounded-full w-fit mb-6 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2"
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4 animate-pulse" /> {t('home.hero.badge')}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-[100px] font-black leading-[0.9] mb-4 tracking-tight drop-shadow-2xl"
          >
            GOLDEN<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              PARK
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-gray-300 text-base md:text-xl font-medium max-w-xl mb-8"
          >
            {t('home.hero.subtitle')}
          </motion.p>
        </motion.div>
      </div>

      <div className="px-4 mt-8 max-w-7xl mx-auto">
        
        {/* --- GPS & ETA DYNAMIC ISLAND (KHONFOSHARIYA) --- */}
        <AnimatePresence>
          {isLoaded && eta !== null && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
              className="relative -mt-16 z-20 mb-12 mx-auto max-w-3xl"
            >
              <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] pointer-events-none" />
                
                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Navigation className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-sm">{t('home.eta.title')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-black text-white">{eta}</span>
                      <span className="text-xl font-bold text-gray-400">min</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-px w-full md:w-px md:h-16 bg-white/10 relative z-10" />
                
                <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
                  <div className="flex-1 text-right">
                    <p className="text-gray-400 font-medium text-sm">{t('home.eta.distance')}</p>
                    <p className="text-2xl font-bold text-white">{distance?.toFixed(1)} km</p>
                  </div>
                  <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors active:scale-95 shadow-xl">
                    Y Aller
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PROMOTIONS CAROUSEL --- */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="flex overflow-x-auto gap-6 pb-8 pt-4 scrollbar-hide snap-x"
        >
          {/* Promo 1 */}
          <motion.div whileHover={{ scale: 1.02 }} className="min-w-[300px] md:min-w-[450px] h-48 bg-gradient-to-br from-red-600 to-red-900 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden snap-center flex-shrink-0 shadow-[0_20px_50px_-15px_rgba(220,38,38,0.5)] border border-red-500/30 group">
            <div className="relative z-10 w-3/4">
              <span className="bg-white text-red-600 text-[10px] font-black px-3 py-1.5 rounded-full mb-4 inline-block shadow-lg uppercase tracking-wider">{t('home.promo1.badge')}</span>
              <h3 className="text-white font-black text-2xl md:text-3xl leading-tight mb-2">{t('home.promo1.title')}</h3>
              <p className="text-white/80 text-xs md:text-sm font-medium">{t('home.promo1.desc')}</p>
            </div>
            <Image src="/image/cepsa-hero.jpg" alt="Promo" fill className="object-cover opacity-20 group-hover:opacity-30 transition-opacity mix-blend-overlay" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
          
          {/* Promo 2 */}
          <motion.div whileHover={{ scale: 1.02 }} className="min-w-[300px] md:min-w-[450px] h-48 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden snap-center flex-shrink-0 shadow-[0_20px_50px_-15px_rgba(245,158,11,0.5)] border border-amber-500/30 group">
            <div className="relative z-10 w-3/4">
              <span className="bg-black/30 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full mb-4 inline-block shadow-lg uppercase tracking-wider">{t('home.promo2.badge')}</span>
              <h3 className="text-white font-black text-2xl md:text-3xl leading-tight mb-2">{t('home.promo2.title')}</h3>
              <p className="text-white/90 text-xs md:text-sm font-medium">{t('home.promo2.desc')}</p>
            </div>
            <Image src="/image/ftor complet.jpeg" alt="Ftour" fill className="object-cover opacity-30 group-hover:opacity-40 transition-opacity mix-blend-overlay" />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          </motion.div>
        </motion.div>

        {/* --- NOS ENGAGEMENTS (RICH CONTENT) --- */}
        <div className="mt-12 mb-20 relative">
          <div className="absolute inset-0 bg-red-600/5 blur-[100px] rounded-full pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 flex flex-col items-center text-center hover:bg-[#1E293B] transition-colors group">
              <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-600/20 transition-all">
                <Star className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('home.engage.1.title')}</h3>
              <p className="text-gray-400 text-sm font-medium">{t('home.engage.1.desc')}</p>
            </div>
            <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 flex flex-col items-center text-center hover:bg-[#1E293B] transition-colors group">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                <Wind className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('home.engage.2.title')}</h3>
              <p className="text-gray-400 text-sm font-medium">{t('home.engage.2.desc')}</p>
            </div>
            <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 flex flex-col items-center text-center hover:bg-[#1E293B] transition-colors group">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-500/20 transition-all">
                <Clock className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('home.engage.3.title')}</h3>
              <p className="text-gray-400 text-sm font-medium">{t('home.engage.3.desc')}</p>
            </div>
          </motion.div>
        </div>
        <div className="mt-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white">{t('home.spaces.title')}</h2>
            <p className="text-gray-400 mt-2 font-medium">{t('home.spaces.subtitle')}</p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          >
            {SERVICES.map((service) => (
              <motion.button 
                key={service.id}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(service.link)}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="w-full aspect-square rounded-[2.5rem] bg-[#111827] relative overflow-hidden shadow-2xl border border-white/5 group-hover:border-white/20 transition-all flex flex-col items-center justify-center">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-80 transition-opacity duration-300`} />
                  <Image 
                    src={service.image} 
                    alt={service.title} 
                    fill 
                    className="object-cover opacity-20 mix-blend-luminosity group-hover:opacity-30 transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070A13]/90 to-transparent" />
                  
                  <motion.div 
                    className="relative z-10 text-white p-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-2 group-hover:bg-white/20 transition-colors"
                  >
                    {service.icon}
                  </motion.div>
                  <span className="relative z-10 text-white font-bold text-sm md:text-lg text-center px-2">
                    {service.title}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>



        {/* --- INFORMATIONS PRATIQUES (Contact, GPS, Horaires) --- */}
        <div className="mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-white mb-8"
          >
            Informations Pratiques
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Carte Maps Interactive (Visual) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 relative h-80 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
              onClick={() => window.open('https://maps.app.goo.gl/wWx1BeVM899uyPJ58')}
            >
              <Image 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80" 
                alt="Map Background" 
                fill 
                className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-[#070A13]/50 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="bg-red-600/20 backdrop-blur-md border border-red-500/40 text-red-500 text-xs font-black px-4 py-2 rounded-xl w-fit mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {t('home.info.loc.badge')}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{t('home.info.loc.address1')}</h3>
                <p className="text-gray-300 font-medium mb-4">{t('home.info.loc.address2')}</p>
                <div className="flex items-center gap-2 text-white font-bold group-hover:text-red-400 transition-colors">
                  Ouvrir dans Google Maps <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              
              {/* Point GPS animé */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40 blur-sm w-16 h-16 -m-4" />
                  <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-2xl z-10 relative flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Horaires et Contact */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              {/* Call to action Contact */}
              <div className="flex-1 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[3rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Phone className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('home.info.contact.title')}</h3>
                <p className="text-gray-400 text-sm font-medium mb-6">{t('home.info.contact.desc')}</p>
                <a href="tel:0661690179" className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl transition-colors shadow-lg active:scale-95">
                  06 61 69 01 79
                </a>
              </div>

              {/* Horaires */}
              <div className="flex-1 bg-[#1E293B]/50 backdrop-blur-md border border-white/10 rounded-[3rem] p-8 flex flex-col justify-center shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <Clock className="w-8 h-8 text-amber-500" />
                  <h3 className="text-xl font-bold text-white">{t('home.info.time.title')}</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-gray-400 font-medium">{t('home.info.time.station')}</span>
                    <span className="text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-lg">{t('home.info.time.open')}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-gray-400 font-medium">{t('home.info.time.resto')}</span>
                    <span className="text-white font-bold">06:00 - 00:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">{t('home.info.time.lube')}</span>
                    <span className="text-white font-bold">08:00 - 20:00</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
      <Chatbot />
    </main>
  );
}
