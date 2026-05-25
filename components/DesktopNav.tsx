"use client";

import Link from 'next/link';
import { Home, UtensilsCrossed, BedDouble, User, Waves, Droplets } from 'lucide-react';
import { usePathname } from 'next/navigation';
import CepsaLogo from './CepsaLogo';
import { useTranslation } from '@/lib/state/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function DesktopNav() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const LINKS = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/restaurant', label: t('nav.restaurant'), icon: UtensilsCrossed },
        { href: '/hotel', label: t('nav.hotel'), icon: BedDouble },
        { href: '/services/pool', label: t('nav.piscine'), icon: Waves },
        { href: '/services/lavage', label: t('nav.lavage'), icon: Droplets },
        { href: '/profile', label: t('nav.profile'), icon: User },
    ];

    return (
        <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-red-600/20">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* Logo - Centered Left */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        <CepsaLogo className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                            GOLDEN <span className="text-red-600">PARC</span>
                        </h1>
                        <span className="text-[10px] font-bold text-amber-500 tracking-[0.3em] block ml-0.5">STATION</span>
                    </div>
                </Link>

                {/* Nav Links - Spaced Out */}
                <nav className="flex items-center gap-8">
                    {LINKS.map(link => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 text-sm font-bold transition-all relative group py-2 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`} />
                                <span>{link.label}</span>

                                {/* Active Underline */}
                                <span className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher variant="nav" />
                    </div>

                    {/* Decorative Red Dot */}
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                </div>
            </div>
        </header>
    );
}
