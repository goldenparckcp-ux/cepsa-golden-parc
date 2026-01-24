'use client';

import { PriceTagProps } from '@/lib/types';

export default function PriceTag({ amount, currency = 'MAD', size = 'md' }: PriceTagProps) {
    const sizeClasses = {
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-4xl',
    };

    const isLarge = size === 'lg';

    return (
        <div className={`${sizeClasses[size]} font-bold ${isLarge ? 'text-gold-gradient' : 'text-premium-gold'}`}>
            {amount.toFixed(2)} {currency}
        </div>
    );
}
