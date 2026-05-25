"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Language, getDictionary } from '../i18n/dictionaries';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('fr');

    const pathname = usePathname();

    const syncWithGoogleTranslate = (lang: string, forceResync = false) => {
        // Find the hidden Google Translate select element
        const googleTranslateSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;

        // Force cookie for all domains and paths to ensure it sticks
        const domain = window.location.hostname;
        document.cookie = `googtrans=/fr/${lang}; path=/; domain=${domain}`;
        document.cookie = `googtrans=/fr/${lang}; path=/;`;

        if (googleTranslateSelect) {
            if (forceResync && lang !== 'fr') {
                // Trick Google Translate into rescanning the DOM by toggling to source then back
                googleTranslateSelect.value = 'fr';
                googleTranslateSelect.dispatchEvent(new Event('change'));

                setTimeout(() => {
                    googleTranslateSelect.value = lang;
                    googleTranslateSelect.dispatchEvent(new Event('change'));
                }, 50);
            } else {
                googleTranslateSelect.value = lang;
                googleTranslateSelect.dispatchEvent(new Event('change'));
            }
        }
        // The cookie is already set, so Google Translate will pick it up when it finishes loading.
    };

    // Re-sync translation whenever the route changes
    useEffect(() => {
        if (language !== 'fr') {
            const timeoutId = setTimeout(() => {
                syncWithGoogleTranslate(language, true);
            }, 300); // Delay slightly to allow React DOM to render new components
            return () => clearTimeout(timeoutId);
        }
    }, [pathname]);

    useEffect(() => {
        const storedLang = localStorage.getItem('app_lang') as Language;
        if (storedLang && ['fr', 'ar', 'es', 'en'].includes(storedLang)) {
            // Avoid calling setState synchronously during the first pass to prevent React Compiler warnings
            setTimeout(() => {
                setLanguageState(storedLang);
                document.documentElement.lang = storedLang;
                document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
                syncWithGoogleTranslate(storedLang);
            }, 0);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_lang', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        syncWithGoogleTranslate(lang);
    };

    const t = (key: string): string => {
        const dict = getDictionary(language);
        return dict[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
