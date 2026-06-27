"use client";

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Html5QrScannerProps {
    onScan: (text: string) => void;
    onError?: (err: any) => void;
}

export function Html5QrScanner({ onScan, onError }: Html5QrScannerProps) {
    const qrcodeRegionId = "html5qr-code-region";
    const qrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        // Initialize the Html5Qrcode instance
        const html5QrCode = new Html5Qrcode(qrcodeRegionId);
        qrCodeRef.current = html5QrCode;

        // Start scanning with environment camera
        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: (width, height) => {
                    const size = Math.min(width, height) * 0.8;
                    return { width: size, height: size };
                },
                aspectRatio: 1.0,
            },
            (decodedText) => {
                onScan(decodedText);
            },
            (errorMessage) => {
                // Verbose errors from scanner, can be passed to onError
                if (onError) onError(errorMessage);
            }
        ).catch((err) => {
            console.error("Error starting html5-qrcode scanner:", err);
        });

        // Cleanup on unmount
        return () => {
            if (qrCodeRef.current) {
                const currentQrCode = qrCodeRef.current;
                if (currentQrCode.isScanning) {
                    currentQrCode.stop().then(() => {
                        console.log("Scanner stopped successfully");
                    }).catch(err => {
                        console.error("Failed to stop scanner on unmount:", err);
                    });
                }
            }
        };
    }, [onScan, onError]);

    return (
        <div 
            id={qrcodeRegionId} 
            className="w-full h-full"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
            }}
        />
    );
}
