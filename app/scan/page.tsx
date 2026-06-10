"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Utensils, Waves, BedDouble, ChevronRight, MapPin, Loader2, XCircle, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types & Config ───────────────────────────────────────────────────────────
type LocationType = "restaurant" | "pool" | "hotel";

const TYPE_META = {
  restaurant: {
    label: "Restaurant",
    sublabel: "Commander depuis votre table",
    icon: Utensils,
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.3)",
    href: "/restaurant",
    btnLabel: "Voir le menu & Commander",
  },
  pool: {
    label: "Piscine",
    sublabel: "Commander depuis votre transat",
    icon: Waves,
    color: "from-cyan-400 to-blue-600",
    glow: "rgba(34,211,238,0.3)",
    href: "/restaurant",
    btnLabel: "Commander boissons & snacks",
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

// ─── Scan Content ─────────────────────────────────────────────────────────────
function ScanContent() {
  const params = useSearchParams();
  const router = useRouter();

  const type  = (params.get("type") || "restaurant") as LocationType;
  const loc   = params.get("loc")?.replace(/-/g, " ") || "";
  const token = params.get("t") || "";

  type Status = "checking" | "valid" | "invalid" | "error";
  const [status, setStatus]     = useState<Status>("checking");
  const [dbLabel, setDbLabel]   = useState<string>(loc);
  const [dbType, setDbType]     = useState<LocationType>(type);
  const [ready, setReady]       = useState(false);

  const meta = TYPE_META[dbType] ?? TYPE_META.restaurant;
  const Icon = meta.icon;

  // ── Verify token against DB ─────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase
          .from("qr_locations")
          .select("id, type, label, is_active")
          .eq("token", token)
          .eq("is_active", true)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setStatus("invalid");
        } else {
          setDbLabel(data.label);
          setDbType(data.type as LocationType);
          setStatus("valid");
          // Store context for order flow
          sessionStorage.setItem("scan_location", JSON.stringify({
            type: data.type,
            loc: data.label,
            token,
          }));
        }
      } catch {
        setStatus("error");
      } finally {
        setTimeout(() => setReady(true), 200);
      }
    };

    verify();
  }, [token]);

  const handleOrder = () => {
    router.push(meta.href);
  };

  // ── INVALID QR ─────────────────────────────────────────────────────────────
  if (status === "invalid" || status === "error") {
    return (
      <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-6 text-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.15) 0%, transparent 60%)" }}
        />
        <div className={`relative z-10 flex flex-col items-center text-center transition-all duration-500 ${ready ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="w-28 h-28 rounded-[2.5rem] bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-8">
            {status === "error"
              ? <ShieldAlert className="w-14 h-14 text-red-400" />
              : <XCircle className="w-14 h-14 text-red-400" />
            }
          </div>

          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              {status === "error" ? "Erreur réseau" : "QR Code invalide"}
            </span>
          </div>

          <h1 className="text-4xl font-black mb-3 text-white">
            {status === "error" ? "Connexion impossible" : "Code non reconnu"}
          </h1>
          <p className="text-gray-400 font-medium mb-2 text-base max-w-sm">
            {status === "error"
              ? "Impossible de vérifier ce QR code. Vérifiez votre connexion internet."
              : "Ce QR code n'existe pas ou a été désactivé par l'administration."
            }
          </p>
          <p className="text-gray-600 text-sm mb-10">
            Veuillez demander à un membre du personnel de vous aider.
          </p>

          <button
            onClick={() => router.push("/")}
            className="px-8 py-3.5 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </main>
    );
  }

  // ── CHECKING ───────────────────────────────────────────────────────────────
  if (status === "checking") {
    return (
      <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center gap-5 text-white">
        <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">Vérification en cours...</p>
          <p className="text-gray-500 text-sm mt-1">Validation du QR code avec la base de données</p>
        </div>
      </main>
    );
  }

  // ── VALID ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 40%, ${meta.glow} 0%, transparent 60%)` }}
      />

      <div className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Icon */}
        <div
          className={`w-28 h-28 rounded-[2.5rem] bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-2xl mb-8`}
          style={{ boxShadow: `0 20px 60px ${meta.glow}` }}
        >
          <Icon className="w-14 h-14 text-white drop-shadow-lg" />
        </div>

        {/* Verified badge */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4 backdrop-blur-md">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Golden Park · {meta.label}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1" />
        </div>

        {/* Location name */}
        <h1 className="text-5xl font-black mb-2 leading-tight">
          {dbLabel.split(" ").map((w, i) => (
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

        {/* Verified token */}
        <div className="mt-8 flex items-center gap-2 text-gray-700 text-xs font-mono">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span>Vérifié · {token}</span>
        </div>
      </div>
    </main>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
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
