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
    "Golden", "Park", "Parc", "Station", "GPC", "GPS", "GPC Station", "GPS Station", "Golden Parc Station GPS",
    "Golden Parc Cepsa", "Golden Park Cepsa", "Cepsa Golden Parc", "Cepsa Golden Park", "Station Cepsa Outat El Haj",
    "Escale", "L'Escale", "Hôtel L'Escale", "Hotel Escale", "Hotel Outat El Haj", "Hôtel Outat El Haj",
    "Rest", "Restaurant", "Restaurant Golden Parc", "Restaurant Golden Park", "Restaurant Outat El Haj",
    "Pool", "Piscine", "Piscine Outat El Haj", "Piscine Golden Parc", "Vidange", "Lube", "Lubrifiants", 
    "Vidange Outat El Haj", "Entretien auto", "RN15", "RN 15", "Route Nationale 15", "Outat El Haj", "Outat El Hadj",
    "Maroc", "Morocco", "Fès", "Meknès", "Escale RN15", "Station service Maroc"
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
        url: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero.jpg",
        width: 1200,
        height: 675,
        alt: "Golden Parc Cepsa Outat El Haj",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Parc Station GPS (GPC) — Escale Premium & Services",
    description: "Station-service, hôtel, restaurant et piscine sur la RN15 à Outat El Haj.",
    images: ["https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero.jpg"],
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ]
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
