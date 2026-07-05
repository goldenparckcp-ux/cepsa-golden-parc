import { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, ShieldCheck, Clock, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À Propos | Golden Parc Station GPS',
  description: 'Découvrez l\'histoire de Golden Parc Station GPS, la station-service et escale premium de référence sur la RN15 à Outat El Haj.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070A13] pt-24 pb-32 px-4 relative z-0">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            À Propos de <span className="text-red-500">Golden Parc</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Plus qu'une simple station-service, Golden Parc Station GPS est un complexe de repos, 
            de restauration et d'hébergement pensé pour le confort des voyageurs sur la Route Nationale 15.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Notre Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                Notre objectif est de transformer les trajets souvent fatigants entre le nord et le sud du Maroc en une expérience de voyage agréable. En regroupant une station Cepsa officielle, un hôtel de haut standing (L'Escale), un restaurant gastronomique, et des espaces verts sécurisés, nous offrons aux familles, aux professionnels et aux touristes un lieu unique pour se ressourcer.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Notre Expertise</h2>
              <p className="text-gray-400 leading-relaxed">
                Avec des années d'expérience dans le service aux voyageurs, notre équipe s'engage à maintenir les plus hauts standards de propreté, de sécurité et d'accueil. Que ce soit pour une vidange express, un repas savoureux ou une nuit reposante, chaque détail de Golden Parc a été conçu pour votre bien-être.
              </p>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero.jpg"
              alt="Golden Parc Station"
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
              title: "Emplacement Idéal",
              desc: "Situé à Outat El Haj sur la RN15, stratégique pour les trajets vers Missour, Tandit et Guercif."
            },
            {
              icon: ShieldCheck,
              title: "Sécurité & Qualité",
              desc: "Carburants Cepsa certifiés et installations surveillées 24h/24 pour votre tranquillité."
            },
            {
              icon: Clock,
              title: "Service 24/7",
              desc: "La station, la boutique et l'assistance sont disponibles de jour comme de nuit sans interruption."
            },
            {
              icon: Users,
              title: "Accueil Familial",
              desc: "Des espaces verts et des infrastructures pensés pour le confort des petits et des grands."
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
      
      {/* Schema.org for E-E-A-T */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "mainEntity": {
              "@type": "Organization",
              "name": "Golden Parc Station GPS",
              "description": "Complexe de services (Station Cepsa, Hôtel L'Escale, Restaurant) situé sur la RN15 à Outat El Haj.",
              "url": "https://goldenparkstation.com",
              "logo": "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png"
            }
          })
        }}
      />
    </div>
  );
}
