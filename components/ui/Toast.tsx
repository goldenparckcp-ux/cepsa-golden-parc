"use client";
import React from "react";

export function Toast({ message }: { message: string | null }) {
    if (!message) return null;
    return (
        <div className="fixed left-0 right-0 top-20 z-[90] pointer-events-none">
            <div className="mx-auto w-full max-w-md px-4">
                <div className="animate-fade-in rounded-2xl bg-black/60 px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl backdrop-blur">
                    {message}
                </div>
            </div>
        </div>
    );
}
