"use client";

/**
 * ClientShell - wraps all client-only UI chrome (nav, tabs, widgets)
 * Must be a Client Component so that dynamic({ ssr: false }) is allowed.
 * Lazy-loading these keeps them OUT of the initial JS bundle → faster TTFB.
 */

import dynamic from "next/dynamic";

const BottomTabs = dynamic(() => import("@/components/BottomTabs"), { ssr: false });
const DesktopNav = dynamic(() => import("@/components/DesktopNav"), { ssr: false });
const MobileHeader = dynamic(() => import("@/components/MobileHeader"), { ssr: false });
const GoogleTranslate = dynamic(
  () => import("@/components/GoogleTranslate").then((m) => ({ default: m.GoogleTranslate })),
  { ssr: false }
);
const FuelPriceWidget = dynamic(
  () => import("@/components/ui/FuelPriceWidget").then((m) => ({ default: m.FuelPriceWidget })),
  { ssr: false }
);

export default function ClientShell() {
  return (
    <>
      <DesktopNav />
      <MobileHeader />
      <FuelPriceWidget />
      <GoogleTranslate />
      <BottomTabs />
    </>
  );
}
