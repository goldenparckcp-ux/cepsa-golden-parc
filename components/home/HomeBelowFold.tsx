'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star, Clock, MapPin, Zap, Navigation, Phone, Wrench, Waves, Utensils, BedDouble, CheckCircle2, RefreshCw, X, Wind, Car, PhoneCall } from 'lucide-react';

interface HomeBelowFoldProps {
  isLoaded: boolean;
  eta: number | null;
  distance: number | null;
  promos: any[];
  language: string;
  t: (key: string) => string;
  router: any;
  SERVICES: any[];
  containerVariants: any;
  itemVariants: any;
  gallery: any[];
  setPreviewImage: (src: string) => void;
  reviews: any[];
  reviewsCarouselRef: any;
  fuelPrices: any;
  newReview: any;
  setNewReview: any;
  submitSuccess: boolean;
  submitting: boolean;
  handleSubmitReview: () => void;
}

export default function HomeBelowFold({
  isLoaded, eta, distance, promos, language, t, router,
  SERVICES, containerVariants, itemVariants, gallery, setPreviewImage,
  reviews, reviewsCarouselRef, fuelPrices, newReview, setNewReview,
  submitSuccess, submitting, handleSubmitReview
}: HomeBelowFoldProps) {
  return (
    <>
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
        <div className="mb-20 overflow-hidden relative w-full">
          {/* Custom Marquee Styles */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee-text {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes marquee-images {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-text {
              display: flex;
              width: max-content;
              animation: marquee-text 20s linear infinite;
            }
            .animate-marquee-images {
              display: flex;
              width: max-content;
              animation: marquee-images 35s linear infinite;
            }
            .animate-marquee-images:hover {
              animation-play-state: paused;
            }
          `}} />

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white">Notre Station</h2>
            <p className="text-gray-400 mt-2 font-medium">Découvrez Golden Parc CEPSA en images</p>
          </motion.div>

          {/* INFINITE TEXT TICKER (Style like user attachment) */}
          <div className="w-full bg-[#111827]/40 border-y border-white/5 py-4 mb-8 overflow-hidden relative">
            <div className="animate-marquee-text flex items-center gap-16 text-[10px] md:text-xs font-black tracking-[0.2em] text-white/60 uppercase">
              {/* Loop 1 */}
              <span>RESTAURANT BELDI 🍽️</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              <span>HOTEL L'ESCALE 🏨</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              <span>PISCINE PRIVÉE 🏊</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              <span>VIDANGE EXPRESS ⚙️</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              <span>STATION SERVICE CEPSA ⛽</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              
              {/* Loop 2 (Duplicate for infinite seamless scroll) */}
              <span>RESTAURANT BELDI 🍽️</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              <span>HOTEL L'ESCALE 🏨</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              <span>PISCINE PRIVÉE 🏊</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              <span>VIDANGE EXPRESS ⚙️</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
              <span>STATION SERVICE CEPSA ⛽</span>
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full inline-block shrink-0" />
            </div>
          </div>

          {/* INFINITE IMAGES CAROUSEL (Slow seamless slide) */}
          <div className="w-full overflow-hidden relative py-4">
            {/* Left and right gradient masks for a smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/40 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0F172A] via-[#0F172A]/40 to-transparent z-10 pointer-events-none" />
            
            <div className="animate-marquee-images flex gap-6">
              {/* Duplicate the array of images to achieve a seamless loop */}
              {(gallery.length > 0 ? gallery : [
                { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', alt: 'Station Carburant' },
                { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', alt: "Hôtel L'Escale" },
                { src: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80', alt: 'Piscine Privée' },
                { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', alt: 'Restaurant Beldi' },
                { src: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=800&q=80', alt: 'Entretien & Lubrifiants' },
                { src: 'https://images.unsplash.com/photo-1470723710355-95304d8aece4?auto=format&fit=crop&w=800&q=80', alt: 'Espace Café & Repos' }
              ]).concat(gallery.length > 0 ? gallery : [
                { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', alt: 'Station Carburant' },
                { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', alt: "Hôtel L'Escale" },
                { src: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80', alt: 'Piscine Privée' },
                { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', alt: 'Restaurant Beldi' },
                { src: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=800&q=80', alt: 'Entretien & Lubrifiants' },
                { src: 'https://images.unsplash.com/photo-1470723710355-95304d8aece4?auto=format&fit=crop&w=800&q=80', alt: 'Espace Café & Repos' }
              ]).map((photo, i) => (
                <div
                  key={i}
                  onClick={() => setPreviewImage(photo.src)}
                  className="relative overflow-hidden rounded-[2rem] group cursor-zoom-in h-[200px] md:h-[260px] w-[280px] md:w-[380px] flex-shrink-0 border border-white/5 hover:border-amber-500/30 transition-all duration-700 shadow-lg shadow-black/25"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
                  />
                  {/* Soft permanent bottom gradient overlay for readability on mobile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  
                  {/* Clean elegant text overlay */}
                  <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col gap-1">
                    <span className="text-white text-xs md:text-sm font-bold uppercase tracking-wider drop-shadow-md">
                      {photo.alt}
                    </span>
                    <span className="text-amber-400 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      Zoomer l'image +
                    </span>
                  </div>
                </div>
              ))}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left columns (2/3): Reviews List */}
            <div className="md:col-span-2 w-full">
              <div ref={reviewsCarouselRef} className="flex overflow-x-auto gap-5 snap-x snap-mandatory pb-6 scrollbar-hide md:grid md:grid-cols-2 w-full">
                {reviews.map((avis, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#111827]/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between hover:border-amber-500/30 hover:bg-[#111827]/80 transition-all snap-center min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink min-h-[220px] w-[85vw] md:w-auto shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className={`w-4 h-4 ${s < avis.stars ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-gray-700'}`} />
                          ))}
                        </div>
                        {avis.name === 'Mohammed A.' && (
                          <div className="hidden lg:flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-white bg-white/5 border border-white/10 px-2 py-1 rounded-lg shrink-0">
                            <span className="text-amber-400">⛽ Gasoil: {fuelPrices.gasoil}</span>
                            <span className="text-white/30">|</span>
                            <span className="text-emerald-400">⛽ Essence: {fuelPrices.essence}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap font-medium">&ldquo;{avis.text}&rdquo;</p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                          {avis.name ? avis.name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm tracking-wide">{avis.name}</div>
                          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{avis.date}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right column (1/3): Submit Form */}
            <div className="md:col-span-1 w-full sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="bg-[#111827]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl lg:text-2xl font-black text-white mb-2 leading-tight">Partagez votre expérience</h3>
                  <p className="text-gray-400 text-sm mb-6 font-medium">Votre avis aide les autres voyageurs</p>

                  <div className="flex flex-col gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Votre prénom</label>
                      <input
                        type="text"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        placeholder="Ex: Mohammed"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500 focus:bg-white/10 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Note</label>
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 h-[52px]">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            type="button"
                            onClick={() => setNewReview({ ...newReview, stars: star })}
                            className={`text-2xl hover:scale-125 transition-transform drop-shadow-md ${star <= newReview.stars ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-gray-700'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Votre recommandation</label>
                      <textarea
                        rows={3}
                        value={newReview.text}
                        onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                        placeholder="Partagez votre expérience..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500 focus:bg-white/10 transition-all resize-none font-medium"
                      />
                    </div>
                  </div>

                  {submitSuccess && (
                    <div className="text-green-400 text-xs font-bold mt-4 animate-in fade-in flex items-center gap-2 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Merci ! Votre avis a été soumis et est en attente de validation par l'administrateur.
                    </div>
                  )}

                  <button 
                    onClick={handleSubmitReview}
                    disabled={submitting || !newReview.name.trim() || !newReview.text.trim()}
                    className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {submitting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Star className="w-5 h-5 fill-white" />
                        Envoyer mon avis
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
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
      
    </>
  );
}
