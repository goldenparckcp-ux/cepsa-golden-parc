"use client";

import React from "react";
import { useUI } from "@/lib/state/UIContext";
import InlineLoginModal from "@/components/modals/InlineLoginModal";

export function AppModals() {
    const { phoneFlow, closePhone } = useUI();

    return (
        <InlineLoginModal
            isOpen={phoneFlow.open}
            onClose={closePhone}
            onSuccess={(phone) => {
                // When verification succeeds:
                // 1. Close modal
                closePhone();
                // 2. Execute the callback (e.g., submit order)
                if (phoneFlow.onVerified) {
                    phoneFlow.onVerified(phone);
                }
            }}
        />
    );
}
