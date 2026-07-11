"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Loader2 } from 'lucide-react';

interface QRScannerProps {
    onScan: (code: string) => void;
    onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    const [isStarting, setIsStarting] = useState(true);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const hasScanned = useRef(false);

    useEffect(() => {
        let isMounted = true;
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { 
                        fps: 10, 
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0 
                    },
                    (decodedText) => {
                        if (isMounted && !hasScanned.current) {
                            hasScanned.current = true;
                            onScan(decodedText);
                        }
                    },
                    (errorMessage) => {
                        // Ignore minor frame errors, they are very noisy
                    }
                );
                if (isMounted) setIsStarting(false);
            } catch (err: any) {
                console.error("Failed to start scanner:", err);
                if (isMounted) {
                    setIsStarting(false);
                    if (onError) onError(err?.message || String(err));
                }
            }
        };

        startScanner();

        return () => {
            isMounted = false;
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [onScan, onError]);

    return (
        <div className="relative w-full h-full">
            {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                    <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                    <p className="text-white text-xs">Initialisation caméra...</p>
                </div>
            )}
            <div id="reader" className="w-full h-full overflow-hidden rounded-xl"></div>
        </div>
    );
}
