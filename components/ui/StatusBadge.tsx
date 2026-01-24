'use client';

import { StatusBadgeProps } from '@/lib/types';

export default function StatusBadge({ status, text }: StatusBadgeProps) {
    const statusConfig = {
        pending: {
            color: 'text-text-muted',
            bg: 'bg-text-muted/10',
            border: 'border-text-muted/20',
            dot: 'bg-text-muted',
        },
        confirmed: {
            color: 'text-premium-gold',
            bg: 'bg-premium-gold/10',
            border: 'border-premium-gold/20',
            dot: 'bg-premium-gold animate-pulse',
        },
        preparing: {
            color: 'text-cepsa-red',
            bg: 'bg-cepsa-red/10',
            border: 'border-cepsa-red/20',
            dot: 'bg-cepsa-red animate-pulse',
        },
        ready: {
            color: 'text-premium-gold',
            bg: 'bg-premium-gold/10',
            border: 'border-premium-gold/20',
            dot: 'bg-premium-gold',
        },
        completed: {
            color: 'text-text-secondary',
            bg: 'bg-surface-lighter',
            border: 'border-white/5',
            dot: 'bg-text-secondary',
        },
    };

    const config = statusConfig[status];

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border`}>
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                {text}
            </span>
        </div>
    );
}
