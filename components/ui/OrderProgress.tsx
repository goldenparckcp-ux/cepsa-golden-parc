'use client';

import { OrderProgressProps } from '@/lib/types';

export default function OrderProgress({ steps, currentStep }: OrderProgressProps) {
    return (
        <div className="space-y-3">
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isFuture = index > currentStep;

                return (
                    <div key={step} className="flex items-center gap-3">
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${isActive ? 'bg-premium-gold text-bg-dark' : ''}
              ${isCompleted ? 'bg-premium-gold/30 text-premium-gold' : ''}
              ${isFuture ? 'bg-surface-lighter text-text-muted' : ''}
            `}>
                            {isCompleted ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                index + 1
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`font-bold ${isActive ? 'text-premium-gold' : isFuture ? 'text-text-muted' : 'text-text-secondary'}`}>
                                {step}
                            </p>
                        </div>
                        {isActive && (
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-premium-gold rounded-full animate-pulse" />
                                <span className="w-2 h-2 bg-premium-gold rounded-full animate-pulse delay-75" />
                                <span className="w-2 h-2 bg-premium-gold rounded-full animate-pulse delay-150" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
