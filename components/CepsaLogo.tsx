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
                {/* Vibrant red gradient for G ribbon & red wings */}
                <linearGradient id="gpc-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#991B1B" />
                </linearGradient>
                {/* Silver/white gradient for the right wing (sbgtha b byd) */}
                <linearGradient id="gpc-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor="#F8FAFC" />
                    <stop offset="70%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
                {/* Subtle dark red shadow for 3D depth */}
                <linearGradient id="gpc-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7F1D1D" />
                    <stop offset="100%" stopColor="#450A0A" />
                </linearGradient>
            </defs>

            {/* Scale and center the group */}
            <g transform="translate(4, 4) scale(0.92)">
                
                {/* 1. Large Top Loop (G Ribbon) */}
                {/* Shadow underneath top loop */}
                <path
                    d="M 76 16 C 50 14, 18 24, 7 50 C 5 58, 14 80, 39 90 C 43 88, 43 84, 39 82 C 22 77, 12 57, 16 47 C 20 37, 50 24, 76 22 Z"
                    fill="url(#gpc-shadow)"
                    opacity="0.5"
                />
                {/* Main Red top loop */}
                <path
                    d="M 76 16 C 50 14, 18 24, 7 50 C 5 58, 14 80, 39 90 C 43 88, 43 84, 39 82 C 22 77, 12 57, 16 47 C 20 37, 50 24, 76 22 Z"
                    fill="url(#gpc-red)"
                />
                {/* Silver inlay highlights for the ribbon */}
                <path
                    d="M 70 19 C 50 17, 24 28, 16 44 C 13 50, 15 58, 18 61"
                    stroke="url(#gpc-silver)"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* 2. Top-Center Red Wing */}
                <path
                    d="M 40 40 C 45 34, 65 32, 74 40 C 76 42, 72 46, 68 47 C 58 50, 48 46, 40 40 Z"
                    fill="url(#gpc-red)"
                />
                <path
                    d="M 45 38 C 52 35, 64 36, 70 40"
                    stroke="url(#gpc-silver)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* 3. Right-Hand Wing (SWEPT RIGHT & DOWN) - Colored White/Silver as requested */}
                <path
                    d="M 52 50 C 65 50, 85 57, 88 80 C 88 82, 84 82, 82 78 C 75 64, 62 57, 52 50 Z"
                    fill="url(#gpc-silver)"
                />
                {/* Subtle dark inlay inside the white wing for contrast/depth */}
                <path
                    d="M 58 52 C 68 55, 78 62, 82 72"
                    stroke="#94A3B8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.6"
                />

                {/* 4. Bottom Red Wing (pointing down) */}
                <path
                    d="M 46 56 C 46 70, 43 87, 41 95 C 39 95, 37 87, 37 70 C 37 56, 41 52, 46 56 Z"
                    fill="url(#gpc-red)"
                />
                <path
                    d="M 42 62 L 42 87"
                    stroke="url(#gpc-silver)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* 5. Inward G-Arrow / Left Wing (Red) */}
                <path
                    d="M 12 57 C 10 67, 18 80, 38 90 C 42 88, 42 84, 38 82 C 22 77, 18 67, 22 60 Z"
                    fill="url(#gpc-red)"
                />
                <path
                    d="M 16 64 C 18 72, 26 79, 34 83"
                    stroke="url(#gpc-silver)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
}
