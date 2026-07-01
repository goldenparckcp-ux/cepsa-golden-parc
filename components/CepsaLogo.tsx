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
                {/* Vibrant red gradient for G ribbon & wings */}
                <linearGradient id="gpc-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#991B1B" />
                </linearGradient>
                {/* Silver/white gradient for highlights */}
                <linearGradient id="gpc-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>
            </defs>

            {/* Scale and center the group */}
            <g transform="translate(4, 4) scale(0.92)">
                
                {/* 1. Large Top Loop (G Ribbon) */}
                <path
                    d="M 76 20 C 50 18, 18 28, 8 50 C 6 56, 14 76, 38 86 C 42 84, 42 80, 38 78 C 22 73, 14 55, 18 45 C 22 35, 50 24, 76 22 Z"
                    fill="url(#gpc-red)"
                />
                {/* Silver inlay highlights for the top loop */}
                <path
                    d="M 70 21 C 50 19, 24 28, 17 44"
                    stroke="url(#gpc-silver)"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* 2. Large Bottom Loop (Mirrored G Ribbon) - identical protrusion at the bottom */}
                <path
                    d="M 76 80 C 50 82, 18 72, 8 50 C 6 44, 14 24, 38 14 C 42 16, 42 20, 38 22 C 22 27, 14 45, 18 55 C 22 65, 50 76, 76 78 Z"
                    fill="url(#gpc-red)"
                />
                {/* Silver inlay highlights for the bottom loop */}
                <path
                    d="M 70 79 C 50 81, 24 72, 17 56"
                    stroke="url(#gpc-silver)"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* 3. Center Star Wings */}
                {/* Top-Center Red Wing */}
                <path
                    d="M 40 40 C 45 34, 65 32, 74 40 C 76 42, 72 46, 68 47 C 58 50, 48 46, 40 40 Z"
                    fill="url(#gpc-red)"
                />
                <path
                    d="M 45 38 C 52 35, 64 36, 70 40"
                    stroke="url(#gpc-silver)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* Bottom-Center Red Wing (Symmetrical to Top-Center) */}
                <path
                    d="M 40 60 C 45 66, 65 68, 74 60 C 76 58, 72 54, 68 53 C 58 50, 48 54, 40 60 Z"
                    fill="url(#gpc-red)"
                />
                <path
                    d="M 45 62 C 52 65, 64 64, 70 60"
                    stroke="url(#gpc-silver)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
}
