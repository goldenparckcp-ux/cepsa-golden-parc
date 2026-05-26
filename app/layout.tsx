import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import BottomTabs from "@/components/BottomTabs";
import DesktopNav from "@/components/DesktopNav";
import { CartProvider } from "@/lib/state/CartContext";
import { UIProvider } from "@/lib/state/UIContext";
import { AuthProvider } from "@/lib/state/AuthProvider";
import { LanguageProvider } from "@/lib/state/LanguageContext";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { FuelPriceWidget } from "@/components/ui/FuelPriceWidget";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Golden Parc Station (GPS)",
  description: "Station Service & Détente",
  manifest: "/manifest.json",
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
                <DesktopNav />
                {/* Mobile Header */}
                <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-red-600/20 px-4 h-16 flex items-center justify-between">
                    <div className="text-white font-black text-xl tracking-tight">GOLDEN <span className="text-red-600">PARC</span></div>
                    <LanguageSwitcher variant="nav" />
                </div>
                <FuelPriceWidget />
                <GoogleTranslate />
                {children}
                <BottomTabs />
              </CartProvider>
            </UIProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
