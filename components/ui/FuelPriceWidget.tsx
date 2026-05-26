"use client";

import { Fuel } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function FuelPriceWidget() {
  const pathname = usePathname();
  // Ces prix seront modifiables par l'admin via Supabase plus tard
  const [prices] = useState({ gasoil: 13.54, sansPlomb: 15.02 });

  if (pathname !== '/') return null;

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 100 }}
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
    </motion.div>
  );
}
