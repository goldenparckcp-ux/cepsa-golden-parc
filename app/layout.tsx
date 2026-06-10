import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import { CartProvider } from "@/lib/state/CartContext";
import { UIProvider } from "@/lib/state/UIContext";
import { AuthProvider } from "@/lib/state/AuthProvider";
import { LanguageProvider } from "@/lib/state/LanguageContext";
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
                {/* ClientShell: nav + tabs + widgets — all lazy, client-only */}
                <ClientShell />
                {children}
              </CartProvider>
            </UIProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
