"use client";

import { useRouter } from 'next/navigation';
import { Car, Utensils, BedDouble, Waves, ChevronRight, Star, MapPin, Phone, Wrench, Wind, Zap, Clock, Navigation, PhoneCall, X, CheckCircle2, RefreshCw } from "lucide-react";
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/state/LanguageContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

// Lazy load Chatbot - heavy component, not needed immediately
const Chatbot = dynamic(() => import('@/components/ui/Chatbot').then(m => ({ default: m.Chatbot })), { ssr: false, loading: () => null });
const HomeBelowFold = dynamic(() => import('@/components/home/HomeBelowFold'), { ssr: true });

// Coordonnées GPS de Cepsa Golden Park
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
  const d = R * c;
  return d;
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [gallery, setGallery] = useState<{ src: string; alt: string }[]>([]);

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
  
  const reviewsCarouselRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Auto-scroll removed for mobile performance (INP)

  useEffect(() => {
    setIsLoaded(true);

    // Defer non-critical logic to avoid blocking the main thread (Fix for high INP/FCP on Mobile)
    const timer = setTimeout(() => {
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

      // Load station photo gallery from database
      const loadGallery = async () => {
        try {
          const { data, error } = await supabase
            .from('station_gallery')
            .select('*')
            .order('order_index', { ascending: true });
          
          if (!error && data && data.length > 0) {
            setGallery(data.map(item => ({ src: item.image_url, alt: item.caption })));
          }
        } catch (err) {
          console.error("Failed to load station gallery:", err);
        }
      };

      loadPromos();
      loadReviews();
      loadGallery();
    }, 1500);

    return () => clearTimeout(timer);
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
          is_approved: false
        });

      // Update local state immediately for instant feedback
      
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
            alt="Golden Park Station"
            fill
            priority
            sizes="100vw"
            quality={60}
            className="object-cover opacity-50"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-black/40 to-transparent" />
        
        <motion.div 
          style={{ opacity: opacityHero }}
          className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-10 max-w-7xl mx-auto w-full"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-red-600/20 backdrop-blur-md border border-red-500/40 text-red-500 text-[10px] md:text-xs font-black px-4 py-2 rounded-full w-fit mb-6 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2"
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4 animate-pulse" /> {t('home.hero.badge')}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 1, y: 30 }}
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
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-gray-300 text-base md:text-xl font-medium max-w-xl mb-8"
          >
            {t('home.hero.subtitle')}
          </motion.p>
        </motion.div>
      </div>

      
        <HomeBelowFold 
          isLoaded={isLoaded}
          eta={eta}
          distance={distance}
          promos={promos}
          language={language}
          t={t}
          router={router}
          SERVICES={SERVICES}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
          gallery={gallery}
          setPreviewImage={setPreviewImage}
          reviews={reviews}
          reviewsCarouselRef={reviewsCarouselRef}
          fuelPrices={fuelPrices}
          newReview={newReview}
          setNewReview={setNewReview}
          submitSuccess={submitSuccess}
          submitting={submitting}
          handleSubmitReview={handleSubmitReview}
        />
        
        <Chatbot />

      

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4 cursor-zoom-out select-none"
          >
            {/* Close Button - Minimalist Glassmorphism */}
            <button 
              onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
              className="absolute top-6 right-6 p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 z-[10000] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* High-res Image Box - Adapts to original ratio without cropping */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 120 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[90vw] max-h-[75vh] w-[800px] h-[500px] rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10"
            >
              <Image 
                src={previewImage} 
                alt="Aperçu Station"
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 90vw, 1200px"
                priority
              />
            </motion.div>

            {/* Captions and Tip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center"
            >
              <p className="text-white/40 text-xs font-medium tracking-widest uppercase">
                Cliquez n'importe où pour fermer
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

