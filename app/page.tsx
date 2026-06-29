"use client";

import { useRouter } from 'next/navigation';
import { Car, Utensils, BedDouble, Waves, ChevronRight, Star, MapPin, Phone, Wrench, Wind, Zap, Clock, Navigation, PhoneCall } from "lucide-react";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/state/LanguageContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

// Lazy load Chatbot - heavy component, not needed immediately
const Chatbot = dynamic(() => import('@/components/ui/Chatbot').then(m => ({ default: m.Chatbot })), { ssr: false, loading: () => null });

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
  const { t, language } = useTranslation();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [promos, setPromos] = useState<any[]>([]);

  // Reviews States
  const [reviews, setReviews] = useState<any[]>([
    { name: 'Mohammed A.', stars: 5, text: 'Station propre, personnel accueillant. Le restaurant est excellent, je recommande le menu complet. Je passe toujours par ici sur la route de Marrakech.', date: 'il y a 2 jours' },
    { name: 'Sara L.', stars: 5, text: 'Hôtel confortable et bien équipé. La piscine est magnifique. Prix raisonnables pour la qualité offerte. Une étape idéale lors de longs trajets.', date: 'il y a 1 semaine' },
    { name: 'Karim B.', stars: 4, text: 'Excellent service rapide. La station est bien entretenue et les lubrifiants CEPSA de qualité. Je reviens régulièrement pour l\'entretien de mon véhicule.', date: 'il y a 2 semaines' }
  ]);
  const [newReview, setNewReview] = useState({ name: '', text: '', stars: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fuelPrices, setFuelPrices] = useState({ gasoil: "12.50 DH", essence: "14.20 DH" });

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

    // Load fuel prices
    const loadFuelPrices = async () => {
      try {
        const { data, error } = await supabase
          .from('fuel_prices')
          .select('*')
          .eq('id', 'current')
          .maybeSingle();
        if (!error && data) {
          const gasPrice = Number(data.gasoil);
          const essPrice = Number(data.sans_plomb || data.essence);
          setFuelPrices({
            gasoil: !isNaN(gasPrice) ? `${gasPrice.toFixed(2)} DH` : "12.50 DH",
            essence: !isNaN(essPrice) ? `${essPrice.toFixed(2)} DH` : "14.20 DH"
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadFuelPrices();

    // Load active promotions from database
    const loadPromos = async () => {
      try {
        const { data, error } = await supabase
          .from('home_promos')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          setPromos(data);
        }
      } catch (err) {
        console.error("Failed to load home promos:", err);
      }
    };

    // Load client reviews from database
    const loadReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('client_reviews')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
          // Map to match reviews format with dynamic fallback checkers
          const formattedReviews = data.map(r => {
            let dateFormatted = "Récemment";
            if (r.created_at) {
              const d = new Date(r.created_at);
              if (!isNaN(d.getTime())) {
                dateFormatted = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
              }
            }
            return {
              name: r.name || "Client",
              stars: Number(r.stars) || 5,
              text: r.text || "",
              date: dateFormatted
            };
          });
          setReviews(formattedReviews);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };

    loadPromos();
    loadReviews();
  }, []);

  const handleSubmitReview = async () => {
    if (!newReview.name.trim() || !newReview.text.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('client_reviews')
        .insert({
          name: newReview.name,
          text: newReview.text,
          stars: newReview.stars,
          is_approved: true
        });

      // Update local state immediately for instant feedback
      const freshReview = {
        name: newReview.name,
        stars: newReview.stars,
        text: newReview.text,
        date: "À l'instant"
      };

      setReviews(prev => [freshReview, ...prev]);
      setNewReview({ name: '', text: '', stars: 5 });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const SERVICES = [
    { id: 'restaurant', title: t('home.service.resto.title') || "Restaurant", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", icon: <Utensils className="w-8 h-8" />, color: "from-amber-500 to-orange-600", link: "/restaurant", delay: 0.1 },
    { id: 'lube', title: t('home.service.lube.title') || "Lubrifiants", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=600&q=80", icon: <Wrench className="w-8 h-8" />, color: "from-gray-700 to-gray-900", link: "/services/lubrifiants", delay: 0.3 },
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
            src="https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero-premium.png"
            alt="Golden Parc Station"
            fill
            priority
            sizes="100vw"
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
          className="flex overflow-x-auto gap-6 pb-8 pt-4 scrollbar-hide snap-x w-full"
        >
          {(promos.length > 0 ? promos : [
            {
              id: 'promo-1',
              badge_fr: 'CATALOGUE 100% DIGITAL',
              badge_ar: 'كتالوج رقمي 100%',
              title_fr: 'Comptoir Lubrifiants',
              title_ar: 'ركن زيوت المحركات',
              desc_fr: "Découvrez notre gamme complète d'huiles de performance.",
              desc_ar: 'اكتشف مجموعتنا الكاملة من زيوت الأداء العالي.',
              image_url: 'https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero.jpg',
              link_path: '/services/lubrifiants',
              gradient_class: 'from-red-600 to-red-900',
              shadow_color: 'rgba(220,38,38,0.5)'
            },
            {
              id: 'promo-2',
              badge_fr: 'SPÉCIAL RAMADAN',
              badge_ar: 'خاص برمضان',
              title_fr: 'Menu Ftour',
              title_ar: 'قائمة الفطور',
              desc_fr: 'Le Ftour beldi complet à 20 DH.',
              desc_ar: 'فطور بلدي متكامل بـ 20 درهم فقط.',
              image_url: 'https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/ftor_complet.jpeg',
              link_path: '/restaurant',
              gradient_class: 'from-amber-500 to-orange-600',
              shadow_color: 'rgba(245,158,11,0.5)'
            }
          ]).map((promo, idx) => {
             const badge = language === 'ar' ? promo.badge_ar : promo.badge_fr;
             const title = language === 'ar' ? promo.title_ar : promo.title_fr;
             const desc = language === 'ar' ? promo.desc_ar : promo.desc_fr;
             const gradient = promo.gradient_class || 'from-red-600 to-red-900';
             const shadow = promo.shadow_color || 'rgba(220,38,38,0.5)';
             const badgeBg = idx % 2 === 0 ? 'bg-white text-red-600' : 'bg-black/30 backdrop-blur-md text-white';

             return (
               <motion.div 
                 key={promo.id || idx}
                 whileHover={{ scale: 1.02 }} 
                 onClick={() => router.push(promo.link_path)}
                 className={`cursor-pointer min-w-[300px] md:min-w-[450px] h-48 bg-gradient-to-br ${gradient} rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden snap-center flex-shrink-0 border border-white/10 group`}
                 style={{ boxShadow: `0 20px 50px -15px ${shadow}` }}
               >
                 <div className="relative z-10 w-3/4">
                   <span className={`${badgeBg} text-[10px] font-black px-3 py-1.5 rounded-full mb-4 inline-block shadow-lg uppercase tracking-wider`}>
                     {badge}
                   </span>
                   <h3 className="text-white font-black text-2xl md:text-3xl leading-tight mb-2">{title}</h3>
                   <p className="text-white/80 text-xs md:text-sm font-medium">{desc}</p>
                 </div>
                 {promo.image_url && (
                   <Image 
                     src={promo.image_url} 
                     alt={title} 
                     fill 
                     sizes="(max-width: 768px) 300px, 450px" 
                     className="object-cover opacity-20 group-hover:opacity-35 transition-opacity mix-blend-overlay" 
                   />
                 )}
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
               </motion.div>
             );
          })}
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
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
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


        {/* --- GALERIE PHOTOS --- */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-8 flex items-end justify-between"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Notre Station</h2>
              <p className="text-gray-400 mt-2 font-medium">Découvrez Golden Parc CEPSA en images</p>
            </div>
          </motion.div>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', alt: 'Station carburant', span: 'row-span-2 col-span-1' },
              { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', alt: 'Hôtel Golden Parc', span: '' },
              { src: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80', alt: 'Piscine', span: '' },
              { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', alt: 'Restaurant', span: 'col-span-2' },
              { src: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=800&q=80', alt: 'Lubrifiants', span: '' },
              { src: 'https://images.unsplash.com/photo-1470723710355-95304d8aece4?auto=format&fit=crop&w=800&q=80', alt: 'Café & Repos', span: '' },
            ].map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] group cursor-pointer ${photo.span} ${i === 0 ? 'h-[280px] md:h-full' : 'h-[140px] md:h-[200px]'}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                  {photo.alt}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- AVIS CLIENTS --- */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              Avis & Recommandations
            </h2>
            <p className="text-gray-400 mt-2 font-medium">Ce que disent nos clients</p>
          </motion.div>

          {/* Vertical stack on Mobile, 3-columns Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {reviews.map((avis, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#111827] border border-white/8 rounded-[2rem] p-6 flex flex-col justify-between hover:border-amber-500/20 transition-colors min-h-[180px] w-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={`w-4 h-4 ${s < avis.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    {avis.name === 'Mohammed A.' && (
                      <div className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-white bg-white/5 border border-white/10 px-2 py-1 rounded-lg shrink-0">
                        <span className="text-amber-400">⛽ Gasoil: {fuelPrices.gasoil}</span>
                        <span className="text-white/30">|</span>
                        <span className="text-emerald-400">⛽ Essence: {fuelPrices.essence}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap">&ldquo;{avis.text}&rdquo;</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-sm">
                      {avis.name ? avis.name[0].toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{avis.name}</div>
                      <div className="text-gray-500 text-[10px]">{avis.date}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Laisser un avis form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white mb-1">Partagez votre expérience</h3>
              <p className="text-gray-400 text-sm mb-6">Votre avis aide les autres voyageurs à choisir la meilleure étape</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Votre prénom</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="Ex: Mohammed"
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Note</label>
                  <div className="flex items-center gap-2 h-[46px]">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        type="button"
                        onClick={() => setNewReview({ ...newReview, stars: star })}
                        className={`text-2xl hover:scale-125 transition-transform ${star <= newReview.stars ? 'text-amber-400' : 'text-gray-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Votre recommandation</label>
                  <textarea
                    rows={3}
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    placeholder="Partagez votre expérience à la station Golden Parc..."
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {submitSuccess && (
                <div className="text-green-400 text-xs font-bold mt-3 animate-pulse">
                  Merci ! Votre avis a bien été enregistré.
                </div>
              )}

              <button 
                onClick={handleSubmitReview}
                disabled={submitting || !newReview.name.trim() || !newReview.text.trim()}
                className="mt-4 w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Star className="w-4 h-4 fill-white" />
                {submitting ? "Envoi..." : "Envoyer mon avis"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* --- INFORMATIONS PRATIQUES (Contact, GPS, Horaires) --- */}
        <div className="mb-24">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-12 drop-shadow-lg"
          >
            {t('home.info.title') || 'Informations Pratiques'}
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
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600"
                alt="Map Background" 
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000 grayscale sepia-[0.3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-[#070A13]/50 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="bg-red-600/20 backdrop-blur-md border border-red-500/40 text-red-500 text-xs font-black px-4 py-2 rounded-xl w-fit mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {t('home.info.loc.badge')}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{t('home.info.loc.address1')}</h3>
                <p className="text-gray-300 font-medium mb-4">{t('home.info.loc.address2')}</p>
                <div className="text-white font-bold flex items-center gap-2 group-hover:text-red-400 transition-colors">
                  {t('home.map.btn') || 'Ouvrir dans Google Maps'} <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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
                <a href="tel:0600000000" className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl transition-colors shadow-lg active:scale-95">
                  06 00 00 00 00
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
      
      {/* FOOTER */}
      <footer className="mt-16 bg-[#070A13] border-t border-white/10 py-8 px-4 relative z-10 w-full">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
               <span className="text-white font-bold text-lg">Golden Parc Station GPS</span>
               <span className="text-gray-500 text-sm">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-4">
               <a href="tel:0600000000" className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" /> SOS Dépannage
               </a>
            </div>
         </div>
      </footer>
    </main>
  );
}
