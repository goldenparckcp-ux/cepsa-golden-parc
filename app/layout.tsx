import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import BottomTabs from "@/components/BottomTabs";
import DesktopNav from "@/components/DesktopNav";
import { CartProvider } from "@/lib/state/CartContext";
import { UIProvider } from "@/lib/state/UIContext";
import { AuthProvider } from "@/lib/state/AuthProvider";
import { LanguageProvider } from "@/lib/state/LanguageContext";
import { GoogleTranslate } from "@/components/GoogleTranslate";
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
