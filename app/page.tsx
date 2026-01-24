"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Coffee, Wrench, Utensils, Hotel, Waves, Fuel, MapPin, Star, Sparkles } from "lucide-react";

const COLORS = {
  bg: "#0f172a",
  header: "#1e293b",
  red: "#DC2626",
  gold: "#EAB308",
  white: "#FFFFFF",
  gray: "#94A3B8",
  accent: "#f59e0b"
};

function Tile({ title, subtitle, to, actionLabel, image, icon: Icon, badge }: any) {
  return (
    <Link
      href={to}
      className="group overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 hover:border-white/20 block"
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.08] group-hover:brightness-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Enhanced overlay effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-4 top-4 flex gap-3">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-2xl transition-all duration-200 group-hover:scale-110"
            style={{
              background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
              boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)"
            }}
          >
            <Icon className="h-6 w-6" />
          </span>
          {badge && (
            <span className="inline-flex items-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-extrabold text-white shadow-lg">
              <Star className="h-3.5 w-3.5 mr-1" />
              {badge}
            </span>
          )}
          <div className="max-w-[280px] truncate rounded-2xl bg-black/60 backdrop-blur-sm px-4 py-3 text-xs font-extrabold text-white">
            {title}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="line-clamp-2 text-sm font-semibold text-white/90 leading-relaxed">{subtitle}</div>
        <div className="mt-5 flex items-center justify-between">
          <div
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-extrabold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(220,38,38,0.1) 100%)",
              color: COLORS.gold,
              boxShadow: "0 4px 15px rgba(234,179,8,0.3)"
            }}
          >
            {actionLabel}
          </div>
          <ArrowRight className="h-6 w-6 text-white/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/80" />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const fuelPrices = {
    gasoil: "12.50 DH/L",
    sansPlomb: "14.20 DH/L",
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] relative" style={{ backgroundColor: COLORS.bg }}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>

      <div className="w-full max-w-6xl mx-auto px-4 pt-4 md:px-6 relative z-10 animate-fade-in">
        <h1 className="visually-hidden">Cepsa Golden Park Home</h1>
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
          <img
            src="/image/cepsa-station.jpg"
            alt="Station Cepsa Golden Parc"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          {/* Animated particles effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 bg-amber-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-20 right-16 w-3 h-3 bg-red-400 rounded-full opacity-40 animate-pulse animation-delay-1000"></div>
            <div className="absolute bottom-10 left-20 w-2 h-2 bg-blue-400 rounded-full opacity-50 animate-pulse animation-delay-2000"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-amber-300 rounded-full opacity-30 animate-pulse animation-delay-3000"></div>
          </div>

          <div className="relative p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/90">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20">
                <MapPin className="h-4 w-4" />
                <span>Outat El Haj</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20">
                <Fuel className="h-4 w-4" />
                <span>Gasoil {fuelPrices.gasoil}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20">
                <Fuel className="h-4 w-4" />
                <span>Sans Plomb {fuelPrices.sansPlomb}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 border border-green-400/30">
                <Sparkles className="h-4 w-4" />
                <span>24/7 Service</span>
              </div>
            </div>

            <div className="mt-8 max-w-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-1 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
                <div className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-lg">
                  Station <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">Cepsa Golden Parc</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
              </div>
              <div className="text-base font-semibold" style={{ color: COLORS.gray }}>
                Route Nationale 15, Outat El Haj - Your Highway Oasis.
              </div>
              <div className="mt-3 text-base text-white/90 leading-relaxed">
                Premium highway stop with <span className="font-extrabold" style={{ color: COLORS.gold }}>Moroccan gastronomy</span>, full café service, hotel rooms, pool access, and car care.
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/restaurant"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-3xl hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
                  boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)"
                }}
              >
                Explore Menu 🍽️
              </Link>
              <Link
                href="/restaurant"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-extrabold text-white transition-all duration-200 hover:bg-white/20 hover:scale-105"
              >
                Order Drinks ☕
              </Link>
            </div>
          </div>
        </section>

        {/* Enhanced Services Section */}
        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-amber-400 to-red-500"></div>
              <div className="text-2xl font-extrabold text-white">Premium Services</div>
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-red-500 to-amber-400"></div>
            </div>
            <div className="text-sm font-semibold" style={{ color: COLORS.gray }}>
              Full Service Station Experience
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Tile
              title="Restaurant"
              subtitle="Authentic homemade Moroccan cuisine. Tagines, Rfissa, and Grills served in a premium setting with traditional flavors and modern presentation."
              to="/restaurant"
              actionLabel="Explore Menu 🍽️"
              icon={Utensils}
              image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200"
              badge="Featured"
            />
            <Tile
              title="Coffee Shop"
              subtitle="Complete coffee experience with professional Barista, Fresh Juices (Avocado, Orange), and comfortable lounge seating with premium atmosphere."
              to="/restaurant"
              actionLabel="Order Drink ☕"
              icon={Coffee}
              image="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200"
              badge="Popular"
            />
            <Tile
              title="Hotel"
              subtitle="Soundproof rooms for weary travelers. Sleep tonight, drive refreshed tomorrow with premium comfort and amenities."
              to="/hotel"
              actionLabel="Book Room 🛌"
              icon={Hotel}
              image="https://images.unsplash.com/photo-1551887373-6abf154c1d1e?w=1200"
            />
            <Tile
              title="Pool & Relax"
              subtitle="Refresh yourself. Swimming pool and relaxation area to break the fatigue with comfortable seating and peaceful atmosphere."
              to="/services/pool"
              actionLabel="Book Access 🏊"
              icon={Waves}
              image="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200"
            />
            <Tile
              title="Car Care"
              subtitle="Professional Wash & Mechanic Services (Tires, Oil Change, Diagnostics) while you rest and enjoy our facilities."
              to="/services/mecanique"
              actionLabel="Book Service 🛠️"
              icon={Wrench}
              image="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200"
            />
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer
          className="mt-12 rounded-3xl border border-white/10 p-6 backdrop-blur-sm"
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            color: COLORS.gray
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-extrabold text-white mb-2">Cepsa Golden Parc</div>
              <div className="text-sm">Route Nationale 15 - Outat El Haj</div>
              <div className="text-sm mt-1">Phone: 06 61 69 01 79</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white/80">Open 24/7</div>
              <div className="text-sm text-white/60">Premium Highway Stop</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
