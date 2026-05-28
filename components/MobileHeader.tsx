"use client";

import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function MobileHeader() {
    const pathname = usePathname();

    // Hide mobile header on admin pages
    if (pathname?.startsWith("/admin")) return null;

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-red-600/20 px-4 h-16 flex items-center justify-between">
            <div className="text-white font-black text-xl tracking-tight">
                GOLDEN <span className="text-red-600">PARC</span>
            </div>
            <LanguageSwitcher variant="nav" />
        </div>
    );
}
