import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import ConditionalFooter from "@/components/ConditionalFooter";
import { CartProvider } from "@/lib/state/CartContext";
import { UIProvider } from "@/lib/state/UIContext";
import { AuthProvider } from "@/lib/state/AuthProvider";
import { LanguageProvider } from "@/lib/state/LanguageContext";
import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://goldenparkstation.com"),
  title: {
    default: "Golden Park Station | Complexe Premium & Hôtel à Outat El Haj",
    template: "%s | Golden Park Station"
  },
  description: "L'escale premium sur la RN15 près de Missour et Tandit. Station-service, Hôtel L'Escale, restaurant gastronomique, piscine et espaces verts pour se détendre en famille.",
  keywords: [
    "Golden", "Park", "Station", "GPS", "Golden Park Station GPS", "Cepsa", "Golden Park Cepsa",
    "Escale", "L'Escale", "Hôtel L'Escale", "Hotel Outat El Haj", "Hôtel Outat El Haj", "Hôtel Missour", "Hotel Tandit",
    "Restaurant Outat El Haj", "Restaurant Missour", "Restaurant Tandit", "Manger Outat El Haj",
    "Pool", "Piscine", "Piscine Outat El Haj", "Vidange", "Lubrifiants", "Entretien auto",
    "RN15", "Route Nationale 15", "Outat El Haj", "Outat El Hadj", "Missour", "Tandit", "Guercif", "Midelt", "Boulemane",
    "Espace vert", "Repos", "Se reposer", "Détente famille", "Endroit calme", "Meilleur endroit pour se reposer",
    "Maroc", "Fès", "Meknès", "Escale RN15", "Station service Maroc"
  ],
  authors: [{ name: "Golden Park Team" }],
  creator: "Golden Park Cepsa",
  publicKey: undefined,
  publisher: "Golden Park Cepsa",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "Golden Park Station | Complexe Premium & Hôtel à Outat El Haj",
    description: "Profitez d'un confort unique sur la RN15 à Outat El Haj (près de Missour et Tandit) : carburants Cepsa, chambres modernes, restaurant de spécialités, espaces verts, piscine et boutique.",
    url: "/",
    siteName: "Golden Park Station",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero.jpg",
        width: 1200,
        height: 675,
        alt: "Golden Park Station Outat El Haj",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Park Station | Complexe Premium & Hôtel",
    description: "Station-service, hôtel, espaces verts, restaurant et piscine sur la RN15 à Outat El Haj, à proximité de Missour et Tandit.",
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
      "name": "Golden Park Station",
      "alternateName": ["GPS", "Golden Park Station", "Station Cepsa Outat El Haj", "Golden Park Cepsa"],
      "description": "Station-service premium Cepsa avec espace détente, espaces verts, restaurant gastronomique, hôtel L'Escale et piscine. L'endroit idéal pour se reposer en famille sur la route de Missour et Tandit.",
      "url": "https://goldenparkstation.com",
      "logo": "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
      "image": "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
      "areaServed": ["Outat El Haj", "Missour", "Tandit", "Guercif", "Midelt"],
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
      "description": "Hôtel de charme moderne sur la RN15 à Outat El Haj avec chambres climatisées de haut standing. Parfait pour se reposer près de Missour et Tandit.",
      "url": "https://goldenparkstation.com/hotel",
      "areaServed": ["Outat El Haj", "Missour", "Tandit", "Boulemane"],
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
      "description": "Restaurant gastronomique avec menu varié, boulangerie, et espaces verts pour enfants. Le meilleur endroit pour manger près d'Outat El Haj, Missour et Tandit.",
      "url": "https://goldenparkstation.com/restaurant",
      "servesCuisine": "Marocaine, Internationale",
      "areaServed": ["Outat El Haj", "Missour", "Tandit"],
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
      <body className={`${inter.className} ${outfit.variable} bg-[#0F172A] overflow-x-hidden w-full relative`}>
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
                <ConditionalFooter />
              </CartProvider>
            </UIProvider>
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
