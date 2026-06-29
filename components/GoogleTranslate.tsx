"use client";

import { useEffect, useState } from "react";

export function GoogleTranslate() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Add Google Translate Script
        const addScript = document.createElement("script");
        addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        addScript.async = true;
        document.body.appendChild(addScript);

        // Extend Window interface locally
        interface GoogleTranslateWindow extends Window {
            googleTranslateElementInit?: () => void;
            google?: {
                translate: {
                    TranslateElement: new (options: object, element: string) => void;
                    InlineLayout: { SIMPLE: string };
                };
            };
        }

        const win = window as unknown as GoogleTranslateWindow;

        win.googleTranslateElementInit = () => {
            if (win.google?.translate) {
                const InlineLayout = win.google.translate.InlineLayout;
                new win.google.translate.TranslateElement(
                    {
                        pageLanguage: "fr",
                        includedLanguages: "fr,en,es,ar",
                        layout: InlineLayout ? InlineLayout.SIMPLE : undefined,
                        autoDisplay: false,
                    },
                    "google_translate_element"
                );
            }
        };
    }, []);

    if (!isMounted) return null;

    return <div id="google_translate_element" className="hidden" suppressHydrationWarning></div>;
}
