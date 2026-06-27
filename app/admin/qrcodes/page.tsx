"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  QrCode, Download, Utensils, Waves, BedDouble,
  Plus, Trash2, RefreshCw, Copy, CheckCircle2, Printer,
  Database, Wifi, WifiOff, AlertCircle
} from "lucide-react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { adminDb } from "@/lib/admin-api";

// ─── Types ────────────────────────────────────────────────────────────────────
type LocationType = "restaurant" | "pool" | "hotel";

interface QRItem {
  id: string;
  type: LocationType;
  label: string;
  url: string;
  token: string;
  dataUrl: string | null;
  saved: boolean; // true = exists in DB
}

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://goldenparc.ma";

function genToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function buildUrl(type: LocationType, label: string, token: string) {
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  return `${BASE_URL}/scan?type=${type}&loc=${slug}&t=${token}`;
}

async function renderQR(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 4, // Increased quiet zone for better scanning
    color: { dark: "#000000", light: "#FFFFFF" }, // Pure black for max contrast
    errorCorrectionLevel: "M", // Lower density makes dots larger and easier to scan
  });
}

const PRESETS: { type: LocationType; labels: string[] }[] = [
  {
    type: "restaurant",
    labels: ["Table 1","Table 2","Table 3","Table 4","Table 5",
             "Table 6","Table 7","Table 8","Table 9","Table 10",
             "Terrasse 1","Terrasse 2","Bar"],
  },
  {
    type: "pool",
    labels: ["Zone Piscine","Transat 1","Transat 2","Kiosque Piscine","Espace Enfants"],
  },
  {
    type: "hotel",
    labels: ["Chambre 101","Chambre 102","Chambre 103","Chambre 104",
             "Chambre 105","Suite VIP","Chambre 201","Chambre 202"],
  },
];

const TYPE_META: Record<LocationType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  restaurant: { label: "Restaurant", icon: Utensils,  color: "text-amber-500",  bg: "bg-amber-500/10 border-amber-500/20" },
  pool:       { label: "Piscine",    icon: Waves,     color: "text-cyan-400",   bg: "bg-cyan-500/10  border-cyan-500/20"  },
  hotel:      { label: "Hôtel",      icon: BedDouble, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function QRGeneratorPage() {
  const [items, setItems]           = useState<QRItem[]>([]);
  const [activeType, setActiveType] = useState<LocationType>("restaurant");
  const [customLabel, setCustomLabel] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied]         = useState<string | null>(null);
  const [dbStatus, setDbStatus]     = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError]   = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // ── Load existing QRs from DB on mount ───────────────────────────────────
  useEffect(() => {
    loadFromDB();
  }, []);

  const loadFromDB = async () => {
    setDbStatus("loading");
    try {
      const { data, error } = await adminDb("qr_locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const loaded: QRItem[] = await Promise.all(
        (data || []).map(async (row: {id: string; type: LocationType; label: string; token: string; url: string}) => {
          const dataUrl = await renderQR(row.url).catch(() => null);
          return {
            id: row.id,
            type: row.type as LocationType,
            label: row.label,
            url: row.url,
            token: row.token,
            dataUrl,
            saved: true,
          };
        })
      );

      setItems(loaded);
      setDbStatus("ok");
    } catch {
      setDbStatus("error");
      setLoadError("Impossible de charger les QR codes depuis la base de données.");
    }
  };

  // ── Add item & save to DB ────────────────────────────────────────────────
  const addItem = useCallback(async (type: LocationType, label: string) => {
    if (!label.trim()) return;
    const token  = genToken();
    const url    = buildUrl(type, label.trim(), token);
    const tempId = `temp-${Date.now()}`;

    setGenerating(tempId);
    const dataUrl = await renderQR(url).catch(() => null);

    // Save to Supabase
    const { data, error } = await adminDb("qr_locations")
      .insert({ type, label: label.trim(), token, url, is_active: true })
      .select()
      .single();

    setGenerating(null);

    if (error) {
      alert(`Erreur lors de la sauvegarde: ${error.message}`);
      return;
    }

    if (!data) {
      alert("Erreur lors de la sauvegarde: Le serveur n'a renvoyé aucune donnée.");
      return;
    }

    setItems(prev => [{ id: data.id, type, label: label.trim(), url, token, dataUrl, saved: true }, ...prev]);
    setCustomLabel("");
  }, []);

  // ── Regenerate token (update DB) ─────────────────────────────────────────
  const regenerate = useCallback(async (item: QRItem) => {
    setGenerating(item.id);
    const token  = genToken();
    const url    = buildUrl(item.type, item.label, token);
    const dataUrl = await renderQR(url).catch(() => null);

    const { error } = await adminDb("qr_locations")
      .update({ token, url, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    setGenerating(null);

    if (error) {
      alert(`Erreur lors de la mise à jour: ${error.message}`);
      return;
    }

    setItems(prev =>
      prev.map(i => i.id === item.id ? { ...i, token, url, dataUrl } : i)
    );
  }, []);

  // ── Delete from DB ───────────────────────────────────────────────────────
  const deleteItem = useCallback(async (item: QRItem) => {
    const { error } = await adminDb("qr_locations")
      .delete()
      .eq("id", item.id);

    if (error) {
      alert(`Erreur lors de la suppression: ${error.message}`);
      return;
    }
    setItems(prev => prev.filter(i => i.id !== item.id));
  }, []);

  // ── Download single ───────────────────────────────────────────────────────
  const download = (item: QRItem) => {
    if (!item.dataUrl) return;
    const a = document.createElement("a");
    a.href = item.dataUrl;
    a.download = `QR-${item.type}-${item.label.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  // ── Copy URL ──────────────────────────────────────────────────────────────
  const copyUrl = (item: QRItem) => {
    navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-amber-500" />
            </span>
            Générateur QR Codes
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Codes sécurisés • Vérification en temps réel • Sauvegardés en base de données
          </p>
        </div>

        {/* DB Status + actions */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            dbStatus === "ok"      ? "bg-green-500/10 border-green-500/20 text-green-400" :
            dbStatus === "error"   ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                     "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
            {dbStatus === "ok"    ? <><Wifi className="w-3 h-3" /> Base connectée</> :
             dbStatus === "error" ? <><WifiOff className="w-3 h-3" /> Hors ligne</> :
                                    <><RefreshCw className="w-3 h-3 animate-spin" /> Chargement</>}
          </div>

          {items.some(i => i.dataUrl) && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl transition-all"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          )}
        </div>
      </div>

      {/* DB Error Banner */}
      {dbStatus === "error" && loadError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">{loadError}</p>
            <p className="text-xs text-red-500/70 mt-0.5">
              Vérifiez que la table <code className="bg-red-500/10 px-1 rounded">qr_locations</code> existe dans Supabase.
            </p>
          </div>
          <button onClick={loadFromDB} className="ml-auto shrink-0 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs font-bold">
            Réessayer
          </button>
        </div>
      )}

      {/* ── Type Tabs ────────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        {(Object.keys(TYPE_META) as LocationType[]).map(type => {
          const m = TYPE_META[type];
          const Icon = m.icon;
          const count = items.filter(i => i.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm border transition-all ${
                activeType === type
                  ? `${m.bg} ${m.color} border-current`
                  : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {m.label}
              {count > 0 && (
                <span className="bg-white/10 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Add new QRs */}
        <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Ajouter — {TYPE_META[activeType].label}
          </h3>

          <div className="flex flex-wrap gap-2">
            {PRESETS.find(p => p.type === activeType)?.labels.map(label => {
              const exists = items.some(i => i.type === activeType && i.label === label);
              return (
                <button
                  key={label}
                  onClick={() => !exists && addItem(activeType, label)}
                  disabled={!!generating || exists}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    exists
                      ? "bg-green-500/10 border-green-500/20 text-green-400 cursor-default"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-40"
                  }`}
                >
                  {exists ? "✓ " : "+ "}{label}
                </button>
              );
            })}
          </div>

          {/* Custom */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Personnalisé</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem(activeType, customLabel)}
                placeholder="Ex: Table VIP, Zone Adultes..."
                className="flex-1 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
              />
              <button
                onClick={() => addItem(activeType, customLabel)}
                disabled={!customLabel.trim() || !!generating}
                className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black rounded-xl transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 text-xs text-gray-400 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">Stockage sécurisé</span>
            </div>
            <p>Chaque QR est <strong className="text-amber-400">sauvegardé en base de données</strong> avec un token unique. Lors du scan, le token est <strong className="text-amber-400">vérifié en temps réel</strong> — un QR non enregistré affichera une erreur.</p>
          </div>
        </div>

        {/* RIGHT: List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {dbStatus === "loading" ? (
            <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-12 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-gray-400 text-sm font-medium">Chargement depuis la base...</p>
            </div>
          ) : items.filter(i => i.type === activeType).length === 0 ? (
            <div className="bg-[#1E293B] border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center text-center gap-3">
              <QrCode className="w-10 h-10 text-gray-600" />
              <p className="text-gray-500 font-medium text-sm">Aucun QR pour {TYPE_META[activeType].label}</p>
              <p className="text-gray-600 text-xs">Cliquez à gauche pour en générer un</p>
            </div>
          ) : (
            items.filter(i => i.type === activeType).map(item => {
              const m = TYPE_META[item.type];
              const Icon = m.icon;
              return (
                <div
                  key={item.id}
                  className="bg-[#1E293B] border border-white/10 rounded-2xl p-4 flex gap-4 items-center hover:border-white/20 transition-all"
                >
                  {/* QR Preview */}
                  <div className="w-20 h-20 shrink-0 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                    {generating === item.id ? (
                      <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                    ) : item.dataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.dataUrl} alt={item.label} className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${m.bg} ${m.color}`}>
                        <Icon className="w-2.5 h-2.5" /> {m.label}
                      </span>
                      {item.saved && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                          <Database className="w-2.5 h-2.5" /> DB
                        </span>
                      )}
                    </div>
                    <p className="text-white font-bold text-sm truncate">{item.label}</p>
                    <p className="text-gray-600 text-[10px] font-mono mt-0.5 truncate">🔑 {item.token}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => download(item)} disabled={!item.dataUrl} title="Télécharger"
                      className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-all disabled:opacity-30">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => copyUrl(item)} title="Copier URL"
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all">
                      {copied === item.id
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => regenerate(item)} title="Nouveau token"
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteItem(item)} title="Supprimer"
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Print */}
      <div ref={printRef} className="hidden print:block">
        <div className="grid grid-cols-3 gap-8 p-8">
          {items.filter(i => i.dataUrl).map(item => (
            <div key={item.id} className="flex flex-col items-center border border-gray-200 rounded-2xl p-4 gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.dataUrl!} alt={item.label} className="w-40 h-40" />
              <p className="font-black text-lg text-center">{item.label}</p>
              <p className="text-xs text-gray-500 text-center">{TYPE_META[item.type].label} · Golden Park</p>
              <p className="text-[8px] text-gray-300 font-mono">{item.token}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
