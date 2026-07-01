import React from "react";

export default function CepsaLogo({ className = "w-8 h-8", color = "text-white" }: { className?: string, color?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={`${className} ${color}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Premium Red Gradient */}
                <linearGradient id="gpc-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#991B1B" />
                </linearGradient>
                {/* Premium Gold/Orange Gradient */}
                <linearGradient id="gpc-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                {/* Silver/White Highlight Gradient */}
                <linearGradient id="gpc-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
            </defs>

            {/* Mathematically Symmetrical Geometric G & Star Design */}
            <g transform="translate(2, 2) scale(0.96)">
                {/* Outer G Loop */}
                <path
                    d="M 75 30 A 35 35 0 1 0 75 70 L 55 70 L 55 52"
                    stroke="url(#gpc-red)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                
                {/* Silver Inline Highlight on G */}
                <path
                    d="M 74 32 A 31 31 0 1 0 74 68 L 57 68"
                    stroke="url(#gpc-silver)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* Symmetrical 4-Pointed GPS Star */}
                <path
                    d="M 50 28 Q 50 50 72 50 Q 50 50 50 72 Q 50 50 28 50 Q 50 50 50 28 Z"
                    fill="url(#gpc-gold)"
                />
            </g>
        </svg>
    );
}
