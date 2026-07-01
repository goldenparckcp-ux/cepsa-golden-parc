import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import { CartProvider } from "@/lib/state/CartContext";
import { UIProvider } from "@/lib/state/UIContext";
import { AuthProvider } from "@/lib/state/AuthProvider";
import { LanguageProvider } from "@/lib/state/LanguageContext";
import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://goldenparkstation.com"),
  title: {
    default: "Golden Parc Station GPS (GPC) — Station-Service, Hôtel & Restaurant Premium",
    template: "%s | Golden Parc Station GPS"
  },
  description: "L'escale premium par excellence sur la RN15 à Outat El Haj. Station-service Cepsa, Hôtel L'Escale, restaurant gourmand, café haut de gamme, piscine et espace d'entretien auto.",
  keywords: [
    "GPC", "GPS", "GPC Station", "GPS Station", "Golden Parc Station GPS", "Golden Parc Cepsa",
    "Golden Parc", "Golden Park", "Station Golden Parc", "Station service Outat El Haj", 
    "Cepsa Outat El Haj", "Hôtel L'Escale", "Hôtel Outat El Haj", "Restaurant Golden Parc", 
    "Piscine Outat El Haj", "RN15 Maroc", "Vidange voiture Outat El Haj", "Café Premium Outat El Haj",
    "Escale RN15", "Station service Maroc", "Outat El Hadj"
  ],
  authors: [{ name: "Golden Parc Team" }],
  creator: "Golden Parc Cepsa",
  publisher: "Golden Parc Cepsa",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "Golden Parc Station GPS (GPC) — Station-Service, Hôtel & Restaurant Premium",
    description: "Profitez d'un confort unique sur la RN15 à Outat El Haj : carburants Cepsa, chambres modernes, restaurant de spécialités, piscine et boutique.",
    url: "/",
    siteName: "Golden Parc Station GPS",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
        width: 800,
        height: 600,
        alt: "Logo Golden Parc Cepsa",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Parc Station GPS (GPC) — Escale Premium & Services",
    description: "Station-service, hôtel, restaurant et piscine sur la RN15 à Outat El Haj.",
    images: ["https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
    apple: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "GasStation",
      "@id": "https://goldenparkstation.com/#station",
      "name": "Golden Parc Station GPS",
      "alternateName": ["GPC", "GPS", "GPC Station", "GPS Station", "Golden Park", "Golden Parc Station", "Station Cepsa Outat El Haj", "Station Golden Parc", "Golden Parc Cepsa"],
      "description": "Station-service premium Cepsa avec espace détente, restaurant gastronomique, hôtel L'Escale et piscine.",
      "url": "https://goldenparkstation.com",
      "logo": "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
      "image": "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Route Nationale 15 (RN15)",
        "addressLocality": "Outat El Haj",
        "addressRegion": "Fès-Meknès",
        "addressCountry": "MA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "33.3444",
        "longitude": "-3.8167"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ],
        "opens": "00:00",
        "closes": "23:59"
      }
    },
    {
      "@type": "Hotel",
      "@id": "https://goldenparkstation.com/#hotel",
      "name": "Hôtel L'Escale - Golden Parc",
      "description": "Hôtel de charme moderne sur la RN15 à Outat El Haj avec chambres climatisées de haut standing.",
      "url": "https://goldenparkstation.com/hotel",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Route Nationale 15",
        "addressLocality": "Outat El Haj",
        "addressCountry": "MA"
      }
    },
    {
      "@type": "Restaurant",
      "@id": "https://goldenparkstation.com/#restaurant",
      "name": "Restaurant Golden Parc",
      "description": "Restaurant gastronomique avec menu varié, boulangerie et boissons premium.",
      "url": "https://goldenparkstation.com/restaurant",
      "servesCuisine": "Marocaine, Internationale",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Route Nationale 15",
        "addressLocality": "Outat El Haj",
        "addressCountry": "MA"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable} bg-[#0F172A]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <AuthProvider>
            <UIProvider>
              <CartProvider>
                {/* ClientShell: nav + tabs + widgets — all lazy, client-only */}
                <ClientShell />
                {children}
              </CartProvider>
            </UIProvider>
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
