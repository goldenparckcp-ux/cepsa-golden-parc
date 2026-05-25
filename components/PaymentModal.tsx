"use client";
// ts-refresh

import { useState, useEffect } from 'react';
import { Wallet, AlertTriangle, ShieldCheck, X, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/state/AuthProvider';

type PaymentGateway = 'wallet' | null;

interface PaymentModalProps {
    bookingId: string;
    amount: number;
    serviceType: 'lavage' | 'hotel' | 'pool' | 'restaurant' | 'topup';
    tableName: string;
    onSuccess: (method: string) => void;
    onClose: () => void;
}

/**
 * MAIN MODAL
 */
export default function PaymentModal({ bookingId, amount, serviceType, tableName, onSuccess, onClose }: PaymentModalProps) {
    const { user } = useAuth();
    const [gateway, setGateway] = useState<PaymentGateway>(null);
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');

    // Fetch Wallet Balance
    useEffect(() => {
        if (!user?.id) return;
        const fetchWallet = async () => {
            const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
            if (data) setWalletBalance(data.wallet_balance || 0);
        };
        fetchWallet();
    }, [user?.id]);

    const handleWalletPayment = async () => {
        setLoading(true);
        setError(null);

        if (walletBalance < amount) {
            setError(`Solde insuffisant. Vous avez besoin de ${amount} DH.`);
            setLoading(false);
            return;
        }

        try {
            const newBalance = walletBalance - amount;
            await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user?.id);

            await supabase.from('wallet_transactions').insert({
                user_id: user?.id,
                amount: -amount,
                type: 'payment',
                description: `Paiement Arboun (${serviceType}) - Booking #${bookingId.slice(0, 5)}`,
                status: 'completed'
            });

            await supabase.from(tableName).update({ deposit_paid: true, deposit_amount: amount }).eq('id', bookingId);

            await supabase.from('transactions').insert({
                user_id: user?.id,
                booking_id: bookingId,
                booking_table: tableName,
                amount,
                gateway: 'wallet',
                type: 'deposit',
                status: 'completed'
            });

            setStep('success');
            setTimeout(() => onSuccess('wallet'), 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        }
        setLoading(false);
    };



    return (
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
                            {serviceType === 'topup' ? 'Ajout de solde sécurisé' : 'Arboun de garantie (Dépôt)'}
                        </p>
                    </div>
                    <button title="Fermer" onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 relative z-10">
                    {(step === 'selection') && !['processing', 'success'].includes(step) && (
                        <>
                            <div className="bg-black/40 rounded-3xl p-5 border border-white/5 flex items-center justify-between mb-8 shadow-inner">
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-0.5">Montant à Payer</div>
                                    <div className="text-3xl font-black text-white flex items-baseline gap-1">
                                        {amount.toFixed(2)} <span className="text-amber-500 text-lg">MAD</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>

                            <p className="text-sm font-bold text-gray-300 mb-4 px-1">Choisissez un moyen de paiement :</p>

                            <div className="space-y-3 mb-6">
                                {serviceType !== 'topup' && (
                                    <button
                                        onClick={() => setGateway('wallet')}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${gateway === 'wallet' ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gateway === 'wallet' ? 'bg-amber-500/20 text-amber-500' : 'bg-black/30 text-gray-400'}`}>
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-bold text-white mb-0.5">Golden Wallet</div>
                                            <div className="text-xs text-gray-400 font-mono">Solde: {walletBalance.toFixed(2)} DH</div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gateway === 'wallet' ? 'border-amber-500' : 'border-gray-500'}`}>
                                            {gateway === 'wallet' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                                        </div>
                                    </button>
                                )}


                            </div>

                            {error && (
                                <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-start gap-3 animate-shake">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    <span className="text-sm font-bold text-red-500 leading-tight">{error}</span>
                                </div>
                            )}

                            {/* Wallet Action Button */}
                            {gateway === 'wallet' && (
                                <button onClick={handleWalletPayment} disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-lg transition-all bg-amber-500 text-black shadow-lg shadow-amber-500/25 hover:bg-amber-400">
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Confirmer & Payer <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            )}



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
    );
}
