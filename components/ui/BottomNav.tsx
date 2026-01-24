'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, Grid, Package } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/menu', icon: UtensilsCrossed, label: 'Menu' },
        { href: '/services', icon: Grid, label: 'Services' },
        { href: '/orders', icon: Package, label: 'My Orders' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-navy-surface border-t border-navy-border z-50">
            <div className="max-w-md mx-auto flex items-center justify-around py-3">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive
                                    ? 'text-premium-gold'
                                    : 'text-text-muted hover:text-white'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                            <span className="text-xs font-bold">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
