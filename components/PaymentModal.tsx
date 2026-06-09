"use client";

import { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/state/AuthProvider';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PaymentModalProps {
    bookingId: string;
    amount: number;
    serviceType: 'lavage' | 'hotel' | 'pool' | 'restaurant' | 'topup';
    tableName: string;
    onSuccess: (method: string) => void;
    onClose: () => void;
}

export default function PaymentModal({ bookingId, amount, serviceType, tableName, onSuccess, onClose }: PaymentModalProps) {
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
    const [paypalClientId, setPaypalClientId] = useState<string>('');

    // Load client ID client-side safely
    useEffect(() => {
        setPaypalClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '');
    }, []);

    const handleSuccessActions = async (captureId: string) => {
        try {
            // Standard Booking Checkout - Flip status to confirmed and deposit paid
            await supabase
                .from(tableName)
                .update({ deposit_paid: true, deposit_amount: amount, status: 'confirmed' })
                .eq('id', bookingId);

            // Log General Transaction
            await supabase.from('transactions').insert({
                user_id: user?.id,
                booking_id: bookingId,
                booking_table: tableName,
                amount,
                gateway: 'paypal',
                gateway_reference: captureId,
                type: 'deposit',
                status: 'completed'
            });

            setStep('success');
            setTimeout(() => onSuccess('paypal'), 2000);
        } catch (err: unknown) {
            console.error("Success database update error:", err);
            setError("Paiement capturé, mais erreur de mise à jour de la base de données.");
            setStep('selection');
        }
    };

    return (
        <PayPalScriptProvider options={{
            clientId: paypalClientId || 'sb', // Fallback value during script load
            currency: 'USD'
        }}>
            <div className="fixed inset-0 z-[100] flex flex-col md:items-center justify-end md:justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-[#1E293B] w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-4 duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none" />

                    <div className="p-6 pb-0 flex justify-between items-start relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                                {serviceType === 'topup' ? 'Recharger Wallet' : 'Paiement Sécurisé'}
                            </h2>
                            <p className="text-gray-400 text-sm font-medium flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                {serviceType === 'topup' ? 'Ajout de solde via PayPal' : 'Garantie PayPal (Dépôt)'}
                            </p>
                        </div>
                        <button title="Fermer" onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 relative z-10">
                        {step === 'selection' && (
                            <>
                                <div className="bg-black/40 rounded-3xl p-5 border border-white/5 flex items-center justify-between mb-8 shadow-inner">
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-0.5">Montant à Payer</div>
                                        <div className="text-3xl font-black text-white flex items-baseline gap-1">
                                            {amount.toFixed(2)} <span className="text-amber-500 text-lg">MAD</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            Equivalent PayPal : {(amount / 10).toFixed(2)} USD
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                </div>

                                {serviceType !== 'topup' && (
                                    <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-left">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="text-[11px] text-gray-300 leading-relaxed">
                                            <p className="font-bold text-amber-500 mb-1">
                                                * Conditions d&apos;Acompte & Annulation
                                            </p>
                                            Le montant à régler correspond à un acompte obligatoire de <span className="text-white font-bold">30%</span> (minimum 20 MAD).
                                            <br />
                                            En cas d&apos;annulation <span className="text-white font-bold">&gt; 45 minutes</span> avant l&apos;heure prévue, le dépôt sera remboursé sur votre portefeuille local moins <span className="text-white font-bold">10 MAD</span> de frais de dossier. Moins de 45 minutes, l&apos;acompte est non-remboursable (perdu).
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-start gap-3 animate-shake">
                                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                        <span className="text-sm font-bold text-red-500 leading-tight">{error}</span>
                                    </div>
                                )}

                                <div className="space-y-4 mb-4">
                                    {paypalClientId ? (
                                        <PayPalButtons
                                            key={paypalClientId}
                                            style={{ layout: "vertical", shape: "rect", label: "pay" }}
                                            createOrder={async () => {
                                                setError(null);
                                                try {
                                                    const res = await fetch('/api/checkout', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            bookingId,
                                                            amount,
                                                            serviceType,
                                                            gateway: 'paypal'
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    if (!res.ok) throw new Error(data.error || 'PayPal order creation failed');
                                                    return data.order_id;
                                                } catch (err: any) {
                                                    setError(err.message || 'Error creating PayPal order');
                                                    throw err;
                                                }
                                            }}
                                            onApprove={async (data, actions) => {
                                                setStep('processing');
                                                try {
                                                    const captureResult = await actions.order?.capture();
                                                    const captureId = captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || captureResult?.id || data.orderID;
                                                    await handleSuccessActions(captureId);
                                                } catch (err: any) {
                                                    console.error("Capture error:", err);
                                                    setError(err.message || 'Error capturing PayPal payment');
                                                    setStep('selection');
                                                }
                                            }}
                                            onError={(err) => {
                                                console.error("PayPal SDK Error:", err);
                                                setError('Erreur d\'intégration PayPal Sandbox.');
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center p-6 text-gray-400 text-xs">
                                            Chargement du script PayPal...
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {step === 'processing' && (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Traitement en cours...</h3>
                                <p className="text-gray-400 text-sm">Veuillez patienter pendant que nous sécurisons la transaction.</p>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                                    <CheckCircle2 className="w-12 h-12 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">
                                    {serviceType === 'topup' ? 'Recharge Confirmée !' : 'Arboun Confirmé !'}
                                </h3>
                                <p className="text-gray-400 text-sm mb-6">
                                    {serviceType === 'topup' ? 'Votre solde a été mis à jour.' : 'Votre garantie a bien été déposée.'}
                                </p>
                                {serviceType !== 'topup' && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-amber-500 text-sm font-bold">
                                        {bookingId.split('-')[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PayPalScriptProvider>
    );
}
