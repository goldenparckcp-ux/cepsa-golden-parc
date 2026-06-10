"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Utensils, Waves, BedDouble, ChevronRight, MapPin, Loader2 } from "lucide-react";

const TYPE_META = {
  restaurant: {
    label: "Restaurant",
    sublabel: "Commander depuis votre table",
    icon: Utensils,
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.3)",
    href: "/restaurant",
    btnLabel: "Voir le menu",
  },
  pool: {
    label: "Piscine",
    sublabel: "Commander depuis votre transat",
    icon: Waves,
    color: "from-cyan-400 to-blue-600",
    glow: "rgba(34,211,238,0.3)",
    href: "/restaurant",
    btnLabel: "Commander des boissons / snacks",
  },
  hotel: {
    label: "Hôtel",
    sublabel: "Commander en chambre",
    icon: BedDouble,
    color: "from-purple-500 to-indigo-600",
    glow: "rgba(168,85,247,0.3)",
    href: "/restaurant",
    btnLabel: "Commander en chambre",
  },
};

function ScanContent() {
  const params = useSearchParams();
  const router = useRouter();

  const type  = (params.get("type") || "restaurant") as keyof typeof TYPE_META;
  const loc   = params.get("loc")?.replace(/-/g, " ") || "Inconnu";
  const token = params.get("t") || "";

  const meta = TYPE_META[type] ?? TYPE_META.restaurant;
  const Icon = meta.icon;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay for animation
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleOrder = () => {
    // Store location context in sessionStorage so the order page can use it
    sessionStorage.setItem("scan_location", JSON.stringify({ type, loc, token }));
    router.push(meta.href);
  };

  return (
    <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${meta.glow} 0%, transparent 60%)`,
        }}
      />

      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ${
          ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Icon bubble */}
        <div
          className={`w-28 h-28 rounded-[2.5rem] bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-2xl mb-8`}
          style={{ boxShadow: `0 20px 60px ${meta.glow}` }}
        >
          <Icon className="w-14 h-14 text-white drop-shadow-lg" />
        </div>

        {/* Welcome badge */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4 backdrop-blur-md">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Golden Park · {meta.label}
          </span>
        </div>

        {/* Location name */}
        <h1 className="text-5xl font-black mb-2 leading-tight">
          {loc.split(" ").map((w, i) => (
            <span key={i}>{w.charAt(0).toUpperCase() + w.slice(1)} </span>
          ))}
        </h1>
        <p className="text-gray-400 font-medium mb-10 text-lg">{meta.sublabel}</p>

        {/* CTA */}
        <button
          onClick={handleOrder}
          className={`w-full max-w-xs py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r ${meta.color} shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all`}
          style={{ boxShadow: `0 10px 40px ${meta.glow}` }}
        >
          {meta.btnLabel}
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Token badge (for staff verification) */}
        <div className="mt-8 flex items-center gap-2 text-gray-600 text-xs font-mono">
          <span>Token: {token}</span>
        </div>
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070A13] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
