"use client";

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/lib/state/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '@/lib/i18n/dictionaries';

const LANGUAGES = [
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'es', label: 'Español', short: 'ES' },
    { code: 'ar', label: 'العربية', short: 'AR' }
];

interface Props {
    variant?: 'nav' | 'profile';
}

export default function LanguageSwitcher({ variant = 'nav' }: Props) {
    const { language, setLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    const handleSelect = (code: string) => {
        setLanguage(code as Language);
        setIsOpen(false);
    };

    if (variant === 'profile') {
        return (
            <div className="relative w-full" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between bg-black/50 border border-white/10 rounded-xl px-4 py-3 hover:bg-black/70 hover:border-white/20 transition-all font-bold text-white text-sm"
                >
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-500" />
                        {activeLang.label}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${language === lang.code ? 'text-red-500 bg-red-500/10' : 'text-gray-300'
                                    }`}
                            >
                                {lang.label}
                                {language === lang.code && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600/10 to-transparent border border-white/10 hover:border-red-500/50 hover:bg-red-600/10 px-4 py-2 rounded-full transition-all group ltr:flex-row rtl:flex-row-reverse"
            >
                <Globe className={`w-4 h-4 ${isOpen ? 'text-red-500' : 'text-gray-400 group-hover:text-white'} transition-colors duration-300`} />
                <span className={`text-xs font-black uppercase tracking-wider ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'} transition-colors`}>
                    {activeLang.short}
                </span>
                <ChevronDown className={`w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 w-40 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <div className="p-2 space-y-1">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ltr:flex-row rtl:flex-row-reverse ${language === lang.code
                                        ? 'bg-red-600/20 text-red-500 shadow-inner border border-red-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${language === lang.code ? 'bg-red-500' : 'bg-transparent'}`} />
                                    {lang.label}
                                </div>
                                <span className="text-[10px] text-gray-500 opacity-50">{lang.short}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
