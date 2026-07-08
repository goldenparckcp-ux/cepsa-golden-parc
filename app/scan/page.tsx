"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Utensils, Waves, BedDouble, ChevronRight, MapPin,
  Loader2, XCircle, ShieldAlert, Banknote, CreditCard, CheckCircle2, Camera
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const Scanner = dynamic(() => {
  if (typeof window !== 'undefined') {
    if (navigator.userAgent.toLowerCase().includes('windows')) {
        try { delete (window as any).BarcodeDetector; } catch (e) {}
    }
  }
  return import('@yudiel/react-qr-scanner').then(mod => mod.Scanner);
}, { ssr: false });

// ─── Config ───────────────────────────────────────────────────────────────────
type LocationType = "restaurant" | "pool" | "hotel";
type PaymentMethod = "cash" | "online";
type Step = "checking" | "valid" | "invalid" | "error" | "payment" | "scan_camera";

const TYPE_META = {
  restaurant: {
    label: "Restaurant",
    sublabel: "Bienvenue à votre table",
    icon: Utensils,
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.3)",
    href: "/restaurant",
  },
  pool: {
    label: "Piscine",
    sublabel: "Bienvenue dans votre espace",
    icon: Waves,
    color: "from-cyan-400 to-blue-600",
    glow: "rgba(34,211,238,0.3)",
    href: "/services/pool",
  },
  hotel: {
    label: "Hôtel",
    sublabel: "Bienvenue dans votre chambre",
    icon: BedDouble,
    color: "from-purple-500 to-indigo-600",
    glow: "rgba(168,85,247,0.3)",
    href: "/hotel",
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────
function ScanContent() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("t") || "";

  const [step, setStep]               = useState<Step>("checking");
  const [dbLabel, setDbLabel]         = useState("");
  const [dbType, setDbType]           = useState<LocationType>("restaurant");
  const [selected, setSelected]       = useState<PaymentMethod | null>(null);
  const [ready, setReady]             = useState(false);

  const meta = TYPE_META[dbType];
  const Icon = meta.icon;

  // ── 1. Verify token ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setStep("scan_camera"); setReady(true); return; }

    async function verifyToken() {
      try {
        const { data, error } = await supabase
          .from("qr_locations")
          .select("id, type, label, is_active")
          .eq("token", token)
          .eq("is_active", true)
          .maybeSingle();

        if (error) {
          console.error("Supabase query error:", error);
          setStep("error");
        } else if (!data) {
          console.warn("No active QR code found for token:", token);
          setStep("invalid");
        } else {
          setDbLabel(data.label);
          setDbType(data.type as LocationType);
          setStep("valid");
          // Store scan context (no phone needed) - wrapped f try-catch f mobile private mode
          try {
            sessionStorage.setItem("scan_location", JSON.stringify({
              type: data.type,
              loc: data.label,
              token,
            }));
            sessionStorage.removeItem("scan_payment"); // Clear old choice if any
          } catch (e) {
            console.warn("Session storage is disabled or quota exceeded:", e);
          }
          // Redirect immediately to the correct menu URL
          router.replace(TYPE_META[data.type as LocationType].href);
        }
      } catch (err) {
        console.error("Failed to fetch QR code:", err);
        setStep("error");
      } finally {
        setTimeout(() => setReady(true), 150);
      }
    }

    verifyToken();
  }, [token]);

  // ── CHECKING ───────────────────────────────────────────────────────────────
  if (step === "checking") {
    return (
      <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center gap-5 text-white">
        <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">Vérification...</p>
          <p className="text-gray-500 text-sm mt-1">Validation du QR code</p>
        </div>
      </main>
    );
  }

  // ── SCAN CAMERA ────────────────────────────────────────────────────────────
  if (step === "scan_camera") {
    return (
      <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-md text-center mb-6">
          <h1 className="text-2xl font-black mb-2 text-white flex items-center justify-center gap-2">
            <Camera className="w-6 h-6 text-amber-500" />
            Scanner le QR Code
          </h1>
          <p className="text-gray-400 text-sm">Veuillez scanner le QR Code présent sur votre table ou dans votre chambre.</p>
        </div>
        
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-[2rem] overflow-hidden border-4 border-amber-500/50 shadow-2xl relative mb-8">
            <Scanner
                onScan={(result) => {
                    if (result && result.length > 0) {
                        const code = result[0].rawValue.trim();
                        // Parse url and extract ?t= if possible, or assume it's the url
                        if (code.includes('?t=')) {
                            const urlParams = new URL(code).searchParams;
                            const t = urlParams.get('t');
                            if (t) {
                                router.replace('/scan?t=' + t);
                                return;
                            }
                        }
                        // Fallback
                        router.replace(code);
                    }
                }}
                onError={(e) => console.log(e?.message)}
            />
        </div>
        
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3.5 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
        >
          Retour à l'accueil
        </button>
      </main>
    );
  }

  // ── INVALID / ERROR ────────────────────────────────────────────────────────
  if (step === "invalid" || step === "error") {
    return (
      <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-6 text-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.15) 0%, transparent 60%)" }}
        />
        <div className={`relative z-10 flex flex-col items-center text-center transition-all duration-500 ${ready ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="w-28 h-28 rounded-[2.5rem] bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-8">
            {step === "error"
              ? <ShieldAlert className="w-14 h-14 text-red-400" />
              : <XCircle className="w-14 h-14 text-red-400" />
            }
          </div>
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              {step === "error" ? "Erreur réseau" : "QR Code invalide"}
            </span>
          </div>
          <h1 className="text-4xl font-black mb-3 text-white">
            {step === "error" ? "Connexion impossible" : "Code non reconnu"}
          </h1>
          <p className="text-gray-400 font-medium mb-2 text-base max-w-sm">
            {step === "error"
              ? "Impossible de vérifier ce QR code. Vérifiez votre connexion."
              : "Ce QR code n'existe pas ou a été désactivé."}
          </p>
          <p className="text-gray-600 text-sm mb-10">
            Demandez l'aide à un membre du personnel.
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

  // ── VALID → Redirecting ───────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center gap-5 text-white">
      <div className="w-20 h-20 rounded-[2rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center animate-pulse">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-black text-white">{dbLabel}</h1>
        <p className="text-gray-400 text-sm mt-1">Redirection vers le menu...</p>
      </div>
    </main>
  );
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────
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
