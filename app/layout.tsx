import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import BottomTabs from "@/components/BottomTabs";
import DesktopNav from "@/components/DesktopNav";
import { CartProvider } from "@/lib/state/CartContext";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata = {
  title: "Golden Park Cepsa",
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
        <CartProvider>
          <DesktopNav />
          {children}
          <BottomTabs />
        </CartProvider>
      </body>
    </html>
  );
}
