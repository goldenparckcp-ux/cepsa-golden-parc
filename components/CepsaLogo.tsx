import React from "react";

export default function CepsaLogo({ className = "w-8 h-8", color = "text-white" }: { className?: string, color?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={`${className} ${color}`}
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* 4-Pointed Star (Cepsa Style) */}
            <path d="M50 10 L62 38 L90 50 L62 62 L50 90 L38 62 L10 50 L38 38 Z" />
            <circle cx="50" cy="50" r="8" className="text-[#0F172A]" fill="currentColor" />
        </svg>
    );
}
