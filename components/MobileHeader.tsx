"use client";

import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import CepsaLogo from "./CepsaLogo";

export default function MobileHeader() {
    const pathname = usePathname();

    // Hide mobile header on admin and staff pages
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/staff")) return null;

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-red-600/20 px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <CepsaLogo className="w-8 h-8" />
                <div className="text-white font-black text-xl tracking-tight">
                    GOLDEN <span className="text-red-600">PARC</span>
                </div>
            </div>
            <LanguageSwitcher variant="nav" />
        </div>
    );
}
