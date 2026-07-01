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
                <linearGradient id="gpc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
            </defs>
            {/* Outer Hexagonal Shield */}
            <path
                d="M50 8 L85 28 L85 72 L50 92 L15 72 L15 28 Z"
                stroke="url(#gpc-gradient)"
                strokeWidth="6"
                strokeLinejoin="round"
                opacity="0.4"
            />
            {/* Stylized Monogram G & Road */}
            <path
                d="M70 36 C65 26 55 20 44 20 C28 20 16 32 16 48 C16 64 28 76 44 76 C56 76 66 68 70 57 L48 57"
                stroke="url(#gpc-gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Star representing GPS / Premium quality */}
            <path
                d="M50 32 L53 41 L62 41 L55 46 L57 55 L50 49 L43 55 L45 46 L38 41 L47 41 Z"
                fill="#F59E0B"
            />
        </svg>
    );
}
