import React from 'react';
import { X } from 'lucide-react';

interface DarkSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function DarkSheet({ open, onClose, title, children }: DarkSheetProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-[#1E293B] border-l border-white/10 shadow-2xl h-full flex flex-col rounded-t-[2rem] sm:rounded-t-none sm:rounded-l-[2.5rem] overflow-hidden animate-slide-up sm:animate-slide-in-right transform transition-transform duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0F172A]">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Add animation keyframes for side slide if not global
/*
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
*/
