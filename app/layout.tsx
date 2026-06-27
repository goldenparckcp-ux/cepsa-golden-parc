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
  title: "Golden Parc Station GPS - Station Service Premium & Espace Détente",
  description: "Votre escale premium sur la Route Nationale 15 à Outat El Haj. Station-service, restaurant, hôtel L'Escale, piscine et lubrifiants.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
    apple: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${outfit.variable} bg-[#0F172A]`}>
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
