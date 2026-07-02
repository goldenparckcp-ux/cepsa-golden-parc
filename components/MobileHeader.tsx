"use client";

import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function MobileHeader() {
    const pathname = usePathname();

    // Hide mobile header on admin and staff pages
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/staff")) return null;

    return (
        <div className="md:hidden fixed top-2 left-2 right-2 z-50 bg-[#0F172A]/90 backdrop-blur-md border border-red-600/20 px-4 h-16 rounded-2xl flex items-center justify-between shadow-lg shadow-black/40">
            <div className="text-white font-black text-xl tracking-tight">
                GOLDEN <span className="text-red-600">PARC</span>
            </div>
            <LanguageSwitcher variant="nav" />
        </div>
    );
}
