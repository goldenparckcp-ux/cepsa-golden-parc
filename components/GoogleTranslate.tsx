"use client";

import { useEffect } from "react";

export function GoogleTranslate() {
    useEffect(() => {
        // Prevent React Hydration Errors when Google Translate modifies the DOM
        if (typeof Node === "function" && Node.prototype) {
            const originalRemoveChild = Node.prototype.removeChild;
            Node.prototype.removeChild = function <T extends Node>(child: T): T {
                if (child.parentNode !== this) {
                    if (console) console.warn("Google Translate React Hydration fix - removeChild caught.");
                    return child;
                }
                return originalRemoveChild.call(this, child) as T;
            };

            const originalInsertBefore = Node.prototype.insertBefore;
            Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
                if (referenceNode && referenceNode.parentNode !== this) {
                    if (console) console.warn("Google Translate React Hydration fix - in.sertBefore caught.");
                    return newNode;
                }
                return originalInsertBefore.call(this, newNode, referenceNode) as T;
            };
        }

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
                new win.google.translate.TranslateElement(
                    {
                        pageLanguage: "fr",
                        includedLanguages: "fr,en,es,ar",
                        layout: win.google.translate.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    "google_translate_element"
                );
            }
        };
    }, []);

    return <div id="google_translate_element" className="hidden"></div>;
}
