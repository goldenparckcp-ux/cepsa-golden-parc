"use client";

import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface CheckoutClientProps {
    bookingId: string;
    amount: number;
    serviceType: 'lavage' | 'hotel' | 'pool' | 'restaurant' | 'topup';
    tableName: string;
    paymentType?: 'full_discounted' | 'deposit' | 'full';
}

export default function CheckoutClient({ bookingId, amount, serviceType, tableName, paymentType }: CheckoutClientProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
    const [selectedGateway, setSelectedGateway] = useState<'cmi' | 'paypal'>('cmi');
    const [paypalClientId, setPaypalClientId] = useState<string>('');

    useEffect(() => {
        setPaypalClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '');
    }, []);

    const handleSuccessActions = async (captureId: string) => {
        try {
            const response = await fetch('/api/checkout/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    tableName,
                    orderId: captureId,
                    amount
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Erreur de validation du paiement serveur");
            }

            setStep('success');
            setTimeout(() => {
                router.push('/profile?payment=success');
            }, 2000);
        } catch (err: unknown) {
            console.error("Success database update error:", err);
            setError(err instanceof Error ? err.message : "Paiement capturé, mais erreur de mise à jour.");
            setStep('selection');
        }
    };

    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId || 'sb', currency: 'USD' }}>
            <div className="w-full">
                {step === 'selection' && (
                    <div className="animate-in fade-in duration-500">
                        {serviceType !== 'topup' && (
                            <div className="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex gap-4 text-left shadow-inner">
                                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-300 leading-relaxed">
                                    {paymentType === 'full_discounted' ? (
                                        <>
                                            <p className="font-bold text-amber-500 mb-1.5 text-base">
                                                Conditions de Paiement & Annulation
                                            </p>
                                            Vous réglez la totalité en ligne avec une <span className="text-white font-bold">remise de 10%</span> appliquée.
                                            <br className="my-1"/>
                                            En cas d&apos;annulation <span className="text-white font-bold">&gt; 45 minutes</span> avant l&apos;heure prévue, le montant sera remboursé moins <span className="text-white font-bold">10 MAD</span> de frais de dossier.
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-bold text-amber-500 mb-1.5 text-base">
                                                Conditions d&apos;Acompte & Annulation
                                            </p>
                                            Vous réglez un acompte de <span className="text-white font-bold">30%</span> (minimum 20 MAD).
                                            <br className="my-1"/>
                                            En cas d&apos;annulation <span className="text-white font-bold">&gt; 45 minutes</span> avant l&apos;heure, l&apos;acompte sera remboursé moins <span className="text-white font-bold">10 MAD</span> de frais.
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex items-start gap-3 animate-shake shadow-lg shadow-red-500/5">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <span className="text-sm font-bold text-red-500 leading-tight">{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3 mb-8 p-1.5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                            <button 
                                onClick={() => setSelectedGateway('cmi')}
                                className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all duration-300 ${selectedGateway === 'cmi' ? 'bg-[#004b87] text-white shadow-lg shadow-[#004b87]/30 scale-[1.02]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Carte Bancaire (CMI)
                            </button>
                            <button 
                                onClick={() => setSelectedGateway('paypal')}
                                className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all duration-300 ${selectedGateway === 'paypal' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-[1.02]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                PayPal
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedGateway === 'cmi' ? (
                                <button
                                    onClick={async () => {
                                        setStep('processing');
                                        try {
                                            const res = await fetch('/api/checkout', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    bookingId, amount, serviceType, gateway: 'cmi', paymentType
                                                })
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.error || 'CMI initialization failed');
                                            
                                            const { submitCmiForm } = await import('@/lib/cmi');
                                            submitCmiForm(data.gateway_url, data.cmi_params);
                                        } catch (err) {
                                            const msg = err instanceof Error ? err.message : 'Erreur CMI';
                                            setError(msg);
                                            setStep('selection');
                                        }
                                    }}
                                    className="w-full py-5 bg-gradient-to-r from-[#004b87] to-[#00a9e0] hover:from-[#003b6b] hover:to-[#0089b0] rounded-2xl font-black text-white shadow-xl shadow-[#004b87]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                    <ShieldCheck className="w-6 h-6 relative z-10" />
                                    <span className="text-lg relative z-10">Payer {amount.toFixed(2)} MAD via CMI</span>
                                </button>
                            ) : (
                                paypalClientId ? (
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <PayPalButtons
                                            key={paypalClientId}
                                            style={{ layout: "vertical", shape: "rect", label: "pay", color: "gold" }}
                                            createOrder={async () => {
                                                setError(null);
                                                try {
                                                    const res = await fetch('/api/checkout', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            bookingId, amount, serviceType, gateway: 'paypal', paymentType
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    if (!res.ok) throw new Error(data.error || 'PayPal order creation failed');
                                                    return data.order_id;
                                                } catch (err) {
                                                    const msg = err instanceof Error ? err.message : 'Error creating PayPal order';
                                                    setError(msg);
                                                    throw err;
                                                }
                                            }}
                                            onApprove={async (data, actions) => {
                                                setStep('processing');
                                                try {
                                                    const captureResult = await actions.order?.capture();
                                                    const captureId = captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || captureResult?.id || data.orderID;
                                                    await handleSuccessActions(captureId);
                                                } catch (err) {
                                                    console.error("Capture error:", err);
                                                    const msg = err instanceof Error ? err.message : 'Error capturing PayPal payment';
                                                    setError(msg);
                                                    setStep('selection');
                                                }
                                            }}
                                            onError={(err) => {
                                                console.error("PayPal SDK Error:", err);
                                                setError('Erreur d\'intégration PayPal Sandbox.');
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center p-8 text-gray-400 text-sm border border-white/5 bg-white/5 rounded-2xl animate-pulse">
                                        Chargement de l'environnement sécurisé PayPal...
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin shadow-[0_0_50px_rgba(245,158,11,0.2)]" />
                            <ShieldCheck className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3">Sécurisation en cours</h3>
                        <p className="text-gray-400">Veuillez ne pas fermer cette page.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-20 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                        <Confetti 
                            width={typeof window !== 'undefined' ? window.innerWidth : 300} 
                            height={typeof window !== 'undefined' ? window.innerHeight : 300}
                            recycle={false}
                            numberOfPieces={500}
                            gravity={0.15}
                        />
                        <div className="w-32 h-32 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mb-8 shadow-[0_0_100px_rgba(34,197,94,0.2)]">
                            <CheckCircle2 className="w-16 h-16 animate-pulse" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-3">Félicitations ! Paiement Réussi</h3>
                        <p className="text-gray-400 mb-8">
                            Merci pour votre confiance. Vous allez être redirigé vers votre profil.
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 font-mono text-amber-500 text-xl font-bold shadow-inner">
                            #{bookingId.split('-')[0].toUpperCase()}
                        </div>
                    </div>
                )}
            </div>
        </PayPalScriptProvider>
    );
}
