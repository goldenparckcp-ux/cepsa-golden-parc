'use client';

import Link from 'next/link';
import { ServiceCardProps } from '@/lib/types';

export default function ServiceCard({
    title,
    description,
    icon,
    badge,
    badgeColor = 'gold',
    ctaText,
    href,
    onClick,
}: ServiceCardProps) {
    const badgeClass = badgeColor === 'red' ? 'badge-red' : 'badge-gold';

    const CardContent = (
        <div className="card-hover group">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold group-hover:bg-premium-gold group-hover:text-bg-dark transition-all duration-300">
                    {icon}
                </div>
                {badge && (
                    <span className={badgeClass}>
                        {badge}
                    </span>
                )}
            </div>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-text-secondary text-sm mb-4">{description}</p>

            <div className="flex items-center gap-2 text-premium-gold font-bold text-sm group-hover:gap-3 transition-all">
                {ctaText}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="w-full text-left">
                {CardContent}
            </button>
        );
    }

    return <Link href={href}>{CardContent}</Link>;
}
