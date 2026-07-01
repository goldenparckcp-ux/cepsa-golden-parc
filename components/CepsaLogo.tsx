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
                <linearGradient id="gpc-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="gpc-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#B91C1C" />
                </linearGradient>
            </defs>

            {/* Mathematically Generated G outer path */}
            <path
                d="M 76.87 23.13 A 38 38 0 1 0 76.87 76.87 L 58 76.87 L 58 50"
                stroke="url(#gpc-red-grad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Inner P loop forming the monogram */}
            <path
                d="M 50 25 A 25 25 0 1 1 50 75 A 25 25 0 0 1 50 25"
                stroke="url(#gpc-red-grad)"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.3"
            />

            {/* Star Spark representing quality & GPS direction */}
            <path
                d="M 50 32 Q 50 50 68 50 Q 50 50 50 68 Q 50 50 32 50 Q 50 50 50 32 Z"
                fill="url(#gpc-gold-grad)"
            />
        </svg>
    );
}
