"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Utensils, Waves, BedDouble, ChevronRight, MapPin,
  Loader2, XCircle, ShieldAlert, Banknote, CreditCard, CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Config ───────────────────────────────────────────────────────────────────
type LocationType = "restaurant" | "pool" | "hotel";
type PaymentMethod = "cash" | "online";
type Step = "checking" | "valid" | "invalid" | "error" | "payment";

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
    href: "/restaurant",
  },
  hotel: {
    label: "Hôtel",
    sublabel: "Bienvenue dans votre chambre",
    icon: BedDouble,
    color: "from-purple-500 to-indigo-600",
    glow: "rgba(168,85,247,0.3)",
    href: "/restaurant",
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
    if (!token) { setStep("invalid"); setReady(true); return; }

    supabase
      .from("qr_locations")
      .select("id, type, label, is_active")
      .eq("token", token)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { setStep("error"); }
        else if (!data) { setStep("invalid"); }
        else {
          setDbLabel(data.label);
          setDbType(data.type as LocationType);
          setStep("valid");
          // Store scan context (no phone needed)
          sessionStorage.setItem("scan_location", JSON.stringify({
            type: data.type,
            loc: data.label,
            token,
          }));
        }
        setTimeout(() => setReady(true), 150);
      });
  }, [token]);

  // ── 2. Confirm payment & go to menu ───────────────────────────────────────
  const confirmAndOrder = () => {
    if (!selected) return;
    // Store payment preference
    sessionStorage.setItem("scan_payment", selected);
    router.push(TYPE_META[dbType].href);
  };

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

  // ── VALID → Payment Choice ─────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 35%, ${meta.glow} 0%, transparent 60%)` }}
      />

      <div className={`relative z-10 w-full max-w-sm flex flex-col items-center text-center transition-all duration-700 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Icon */}
        <div
          className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-2xl mb-6`}
          style={{ boxShadow: `0 20px 60px ${meta.glow}` }}
        >
          <Icon className="w-12 h-12 text-white drop-shadow-lg" />
        </div>

        {/* Location badge */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-3 backdrop-blur-md">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Golden Park · {meta.label}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1" />
        </div>

        {/* Location name */}
        <h1 className="text-4xl font-black mb-1 leading-tight">
          {dbLabel}
        </h1>
        <p className="text-gray-400 font-medium mb-8 text-base">{meta.sublabel}</p>

        {/* ── Payment Choice ── */}
        <div className="w-full mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-left">
            Mode de paiement
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Cash */}
            <button
              onClick={() => setSelected("cash")}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                selected === "cash"
                  ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              {selected === "cash" && (
                <span className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selected === "cash" ? "bg-emerald-500/20" : "bg-white/5"
              }`}>
                <Banknote className={`w-6 h-6 ${selected === "cash" ? "text-emerald-400" : "text-gray-400"}`} />
              </div>
              <div>
                <p className={`font-black text-sm ${selected === "cash" ? "text-white" : "text-gray-300"}`}>
                  Espèces
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Payer à la livraison</p>
              </div>
            </button>

            {/* Online */}
            <button
              onClick={() => setSelected("online")}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                selected === "online"
                  ? "bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              {selected === "online" && (
                <span className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selected === "online" ? "bg-blue-500/20" : "bg-white/5"
              }`}>
                <CreditCard className={`w-6 h-6 ${selected === "online" ? "text-blue-400" : "text-gray-400"}`} />
              </div>
              <div>
                <p className={`font-black text-sm ${selected === "online" ? "text-white" : "text-gray-300"}`}>
                  En ligne
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">PayPal sécurisé</p>
              </div>
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={confirmAndOrder}
          disabled={!selected}
          className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            selected
              ? `text-white bg-gradient-to-r ${meta.color} shadow-2xl active:scale-95`
              : "text-gray-600 bg-white/5 border border-white/5 cursor-not-allowed"
          }`}
          style={selected ? { boxShadow: `0 10px 40px ${meta.glow}` } : {}}
        >
          Voir le menu
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Token */}
        <div className="mt-6 flex items-center gap-2 text-gray-700 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Vérifié · {token}
        </div>
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
