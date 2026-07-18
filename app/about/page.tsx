"use client";

import Image from 'next/image';
import { MapPin, ShieldCheck, Clock, Users } from 'lucide-react';
import { useTranslation } from '@/lib/state/LanguageContext';

const content = {
  fr: {
    title: "À Propos de",
    subtitle: "Plus qu'une simple station-service, Golden Park Station GPS est un complexe de repos, de restauration et d'hébergement pensé pour le confort des voyageurs sur la Route Nationale 15.",
    missionTitle: "Notre Mission",
    missionDesc: "Notre objectif est de transformer les trajets souvent fatigants entre le nord et le sud du Maroc en une expérience de voyage agréable. En regroupant une station Cepsa officielle, un hôtel de haut standing (L'Escale), un restaurant gastronomique, et des espaces verts sécurisés, nous offrons aux familles, aux professionnels et aux touristes un lieu unique pour se ressourcer.",
    expertiseTitle: "Notre Expertise",
    expertiseDesc: "Avec des années d'expérience dans le service aux voyageurs, notre équipe s'engage à maintenir les plus hauts standards de propreté, de sécurité et d'accueil. Que ce soit pour une vidange express, un repas savoureux ou une nuit reposante, chaque détail de Golden Park a été conçu pour votre bien-être.",
    val1Title: "Emplacement Idéal",
    val1Desc: "Situé à Outat El Haj sur la RN15, stratégique pour les trajets vers Missour, Tandit et Guercif.",
    val2Title: "Sécurité & Qualité",
    val2Desc: "Carburants Cepsa certifiés et installations surveillées 24h/24 pour votre tranquillité.",
    val3Title: "Service 24/7",
    val3Desc: "La station, la boutique et l'assistance sont disponibles de jour comme de nuit sans interruption.",
    val4Title: "Accueil Familial",
    val4Desc: "Des espaces verts et des infrastructures pensés pour le confort des petits et des grands."
  },
  ar: {
    title: "معلومات عن",
    subtitle: "أكثر من مجرد محطة وقود، محطة غولدن بارك GPS هي مجمع متكامل للاستراحة، الإيواء والمأكولات، مصمم خصيصاً لراحة المسافرين على الطريق الوطنية رقم 15.",
    missionTitle: "مهمتنا",
    missionDesc: "هدفنا هو تحويل الرحلات المتعبة بين شمال وجنوب المغرب إلى تجربة سفر ممتعة. من خلال الجمع بين محطة Cepsa الرسمية، فندق راقي (L'Escale)، مطعم فاخر، ومساحات خضراء مؤمنة، نقدم للعائلات، المهنيين والسياح مكاناً فريداً للاستجمام.",
    expertiseTitle: "خبرتنا",
    expertiseDesc: "مع سنوات من الخبرة في خدمة المسافرين، يلتزم فريقنا بالحفاظ على أعلى معايير النظافة والأمان والترحيب. سواء كان ذلك لتغيير الزيت السريع، وجبة لذيذة أو ليلة نوم مريحة، تم تصميم كل تفصيل في غولدن بارك لضمان راحتكم.",
    val1Title: "موقع مثالي",
    val1Desc: "تقع في أوطاط الحاج على الطريق الوطنية 15، موقع استراتيجي للمسافرين نحو ميسور، تانديت وجرسيف.",
    val2Title: "الأمان والجودة",
    val2Desc: "وقود Cepsa المعتمد ومنشآت مراقبة 24/7 لضمان راحتكم وسلامتكم.",
    val3Title: "خدمة 24/7",
    val3Desc: "المحطة، المتجر والمساعدة متاحة ليل نهار دون انقطاع.",
    val4Title: "استقبل عائلي",
    val4Desc: "مساحات خضراء وبنيات تحتية مصممة خصيصاً لراحة الصغار والكبار."
  },
  en: {
    title: "About",
    subtitle: "More than just a gas station, Golden Park Station GPS is a rest, dining, and accommodation complex designed for the comfort of travelers on National Route 15.",
    missionTitle: "Our Mission",
    missionDesc: "Our goal is to transform often tiring journeys between the north and south of Morocco into an enjoyable travel experience. By grouping an official Cepsa station, a high-standard hotel (L'Escale), a gourmet restaurant, and secure green spaces, we offer families, professionals, and tourists a unique place to recharge.",
    expertiseTitle: "Our Expertise",
    expertiseDesc: "With years of experience serving travelers, our team is committed to maintaining the highest standards of cleanliness, safety, and hospitality. Whether for an express oil change, a tasty meal, or a restful night, every detail of Golden Park has been designed for your well-being.",
    val1Title: "Ideal Location",
    val1Desc: "Located in Outat El Haj on the RN15, strategic for journeys towards Missour, Tandit, and Guercif.",
    val2Title: "Safety & Quality",
    val2Desc: "Certified Cepsa fuels and 24-hour monitored installations for your peace of mind.",
    val3Title: "24/7 Service",
    val3Desc: "The station, shop, and assistance are available day and night without interruption.",
    val4Title: "Family Welcome",
    val4Desc: "Green spaces and infrastructures designed for the comfort of both children and adults."
  },
  es: {
    title: "Sobre",
    subtitle: "Más que una simple gasolinera, Golden Park Station GPS es un complejo de descanso, restauración y alojamiento pensado para el confort de los viajeros en la Ruta Nacional 15.",
    missionTitle: "Nuestra Misión",
    missionDesc: "Nuestro objetivo es transformar los trayectos a menudo fatigantes entre el norte y el sur de Marruecos en una experiencia de viaje agradable. Al reunir una estación Cepsa oficial, un hotel de alto standing (L'Escale), un restaurante gastronómico y espacios verdes seguros, ofrecemos a las familias, profesionales y turistas un lugar único para recargar energías.",
    expertiseTitle: "Nuestra Experiencia",
    expertiseDesc: "Con años de experiencia en el servicio al viajero, nuestro equipo se compromete a mantener los más altos estándares de limpieza, seguridad y acogida. Ya sea para un cambio de aceite express, una comida sabrosa o una noche de descanso, cada detalle de Golden Park ha sido diseñado para su bienestar.",
    val1Title: "Ubicación Ideal",
    val1Desc: "Situado en Outat El Haj en la RN15, estratégico para trayectos hacia Missour, Tandit y Guercif.",
    val2Title: "Seguridad y Calidad",
    val2Desc: "Combustibles Cepsa certificados e instalaciones vigiladas las 24 horas para su tranquilidad.",
    val3Title: "Servicio 24/7",
    val3Desc: "La estación, la tienda y la asistencia están disponibles día y noche sin interrupción.",
    val4Title: "Acogida Familiar",
    val4Desc: "Espacios verdes e infraestructuras pensadas para la comodidad de niños y adultos."
  }
};

export default function AboutPage() {
  const { language } = useTranslation();
  const activeLang = (['fr', 'ar', 'en', 'es'].includes(language) ? language : 'fr') as keyof typeof content;
  const tLocal = content[activeLang];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Golden Park Station GPS",
      "description": "Complexe de services (Station Cepsa, Hôtel L'Escale, Restaurant) situé sur la RN15 à Outat El Haj.",
      "url": "https://goldenparkstation.com",
      "logo": "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png"
    }
  };

  return (
    <div className="min-h-screen bg-[#070A13] pt-24 pb-32 px-4 relative z-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            {tLocal.title} <span className="text-red-500">Golden Park</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {tLocal.subtitle}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">{tLocal.missionTitle}</h2>
              <p className="text-gray-400 leading-relaxed">
                {tLocal.missionDesc}
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">{tLocal.expertiseTitle}</h2>
              <p className="text-gray-400 leading-relaxed">
                {tLocal.expertiseDesc}
              </p>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero.jpg"
              alt="Golden Park Station"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-transparent to-transparent" />
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              icon: MapPin,
              title: tLocal.val1Title,
              desc: tLocal.val1Desc
            },
            {
              icon: ShieldCheck,
              title: tLocal.val2Title,
              desc: tLocal.val2Desc
            },
            {
              icon: Clock,
              title: tLocal.val3Title,
              desc: tLocal.val3Desc
            },
            {
              icon: Users,
              title: tLocal.val4Title,
              desc: tLocal.val4Desc
            }
          ].map((value, i) => (
            <div key={i} className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl text-center space-y-4 hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 mx-auto bg-red-600/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                <value.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">{value.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
