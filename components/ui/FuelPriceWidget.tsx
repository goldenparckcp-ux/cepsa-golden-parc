"use client";

import { Fuel } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function FuelPriceWidget() {
  const pathname = usePathname();
  const [prices, setPrices] = useState({ gasoil: 13.54, sansPlomb: 15.02 });

  useEffect(() => {
    const fetchFuel = async () => {
      try {
        const { data } = await supabase.from("fuel_prices").select("*").eq("id", "current").maybeSingle();
        if (data) {
          setPrices({
            gasoil: Number(data.gasoil),
            sansPlomb: Number(data.sans_plomb)
          });
        }
      } catch (err) {
        console.warn("Using default widget prices fallback:", err);
      }
    };
    fetchFuel();
  }, []);

  if (pathname !== '/') return null;

  return (
    <div 
      style={{ animation: 'slideDownFuel 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.8s both' }}
      className="fixed top-[70px] md:top-[90px] inset-x-0 mx-auto w-fit max-w-[95vw] z-40 bg-[#0F172A]/90 backdrop-blur-md border border-white/10 px-3 md:px-5 py-1.5 md:py-2 rounded-full shadow-lg flex items-center justify-center gap-2 md:gap-4 text-[10px] md:text-sm font-bold whitespace-nowrap ltr:flex-row rtl:flex-row-reverse"
    >
      <div className="flex items-center gap-1 md:gap-2 ltr:flex-row rtl:flex-row-reverse">
        <Fuel className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
        <span className="text-gray-300">Gasoil:</span>
        <span className="text-amber-500">{prices.gasoil.toFixed(2)} DH</span>
      </div>
      <div className="w-px h-3 md:h-4 bg-white/20 mx-1" />
      <div className="flex items-center gap-1 md:gap-2 ltr:flex-row rtl:flex-row-reverse">
        <Fuel className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
        <span className="text-gray-300">Essence:</span>
        <span className="text-green-500">{prices.sansPlomb.toFixed(2)} DH</span>
      </div>
    </div>
  );
}
