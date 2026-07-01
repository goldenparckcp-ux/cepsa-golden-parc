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
                {/* Red/Crimson gradient for the logo body */}
                <linearGradient id="gpc-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" /> {/* red-500 */}
                    <stop offset="50%" stopColor="#DC2626" /> {/* red-600 */}
                    <stop offset="100%" stopColor="#991B1B" /> {/* red-800 */}
                </linearGradient>
                {/* Silver/White gradient for highlights */}
                <linearGradient id="gpc-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
            </defs>

            {/* MAIN LOGO GRAPHIC */}
            <g transform="translate(2, 2) scale(0.96)">
                {/* --- Outer 'G' Ribbon --- */}
                {/* Main Red top loop */}
                <path
                    d="M 76 16 C 50 14, 18 24, 7 50 C 5 58, 14 80, 39 90 C 43 88, 43 84, 39 82 C 22 77, 12 57, 16 47 C 20 37, 50 24, 76 22 Z"
                    fill="url(#gpc-red-grad)"
                />
                {/* White inlay line in top loop */}
                <path
                    d="M 72 19 C 50 17, 24 28, 16 44 C 13 50, 15 58, 18 61"
                    stroke="url(#gpc-white-grad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />

                {/* --- Inner Star / Wings --- */}
                
                {/* Top-Center Wing */}
                <path
                    d="M 40 40 C 45 34, 65 32, 74 40 C 76 42, 72 46, 68 47 C 58 50, 48 46, 40 40 Z"
                    fill="url(#gpc-red-grad)"
                />
                <path
                    d="M 45 38 C 52 35, 64 36, 70 40"
                    stroke="url(#gpc-white-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* Right-Hand Wing (sweeping down-right) */}
                <path
                    d="M 52 50 C 65 50, 85 57, 88 80 C 88 82, 84 82, 82 78 C 75 64, 62 57, 52 50 Z"
                    fill="url(#gpc-red-grad)"
                />
                <path
                    d="M 58 52 C 68 55, 78 62, 82 72"
                    stroke="url(#gpc-white-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* Bottom Wing (pointing down) */}
                <path
                    d="M 46 56 C 46 70, 43 87, 41 95 C 39 95, 37 87, 37 70 C 37 56, 41 52, 46 56 Z"
                    fill="url(#gpc-red-grad)"
                />
                <path
                    d="M 42 62 L 42 87"
                    stroke="url(#gpc-white-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* --- Inward G-Arrow / Left Wing --- */}
                <path
                    d="M 12 57 C 10 67, 18 80, 38 90 C 42 88, 42 84, 38 82 C 22 77, 18 67, 22 60 Z"
                    fill="url(#gpc-red-grad)"
                />
                <path
                    d="M 16 64 C 18 72, 26 79, 34 83"
                    stroke="url(#gpc-white-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
}
