'use client';

import { ToggleSwitchProps } from '@/lib/types';

export default function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
    return (
        <div className="bg-surface-dark rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{label}</h3>
                    {description && (
                        <p className="text-sm text-text-secondary">{description}</p>
                    )}
                </div>
                <button
                    onClick={() => onChange(!enabled)}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${enabled ? 'bg-premium-gold' : 'bg-surface-lighter'
                        }`}
                    aria-label={label}
                >
                    <span
                        className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform duration-300 ${enabled ? 'translate-x-7' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>
        </div>
    );
}
