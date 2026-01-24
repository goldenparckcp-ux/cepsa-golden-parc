import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/lib/state/UIContext";
import { CartProvider } from "@/lib/state/CartContext";
import { Header } from "@/components/Header";
import { BottomTabs } from "@/components/BottomTabs";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AppModals } from "@/components/AppModals";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cepsa Golden Park",
  description: "Premium Highway Stop",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: "#0f172a", color: "#fff" }}>
        <CartProvider>
          <UIProvider>
            <div className="min-h-dvh flex flex-col">
              <Header />
              <main className="flex-1 w-full pb-24">
                {children}
              </main>
              <BottomTabs />
              <CartDrawer />
              <AppModals />
            </div>
          </UIProvider>
        </CartProvider>
      </body>
    </html>
  );
}
