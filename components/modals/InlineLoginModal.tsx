'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Phone, Lock, Loader2, AlertCircle } from 'lucide-react';

interface InlineLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (phone: string) => void;
}

export default function InlineLoginModal({
    isOpen,
    onClose,
    onSuccess,
}: InlineLoginModalProps) {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+212${phone.replace(/^0/, '')}`;

            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });

            if (error) throw error;

            setStep('otp');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formattedPhone = phone.startsWith('+') ? phone : `+212${phone.replace(/^0/, '')}`;

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            });

            if (error) {
                // DEV MODE BYPASS
                // If the backend fails (e.g. invalid code or no provider set up)
                // BUT the user entered the Magic Code "123456", we allow them in for UI testing.
                if (otp === '123456') {
                    console.log('⚡ Dev Mode: Bypassing authentication with magic code');
                    localStorage.setItem('cep_mock_session', 'true');
                    localStorage.setItem('cep_mock_user_id', 'dev-user-123');
                    onSuccess(formattedPhone);
                    return;
                }
                throw error;
            }

            if (!data.user) throw new Error('Verification failed');

            // clear mock session if real login succeeds
            localStorage.removeItem('cep_mock_session');
            onSuccess(formattedPhone);
        } catch (err: unknown) {
            // Check for bypass again in catch block to be safe
            if (otp === '123456') {
                console.log('⚡ Dev Mode: Bypassing authentication with magic code');
                localStorage.setItem('cep_mock_session', 'true');
                localStorage.setItem('cep_mock_user_id', 'dev-user-123');
                onSuccess(formattedPhone);
                return;
            }
            setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('phone');
        setOtp('');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-surface-dark rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Verify Your Phone</h2>
                        <p className="text-sm text-text-secondary">Quick verification to complete your order</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-surface-lighter hover:bg-cepsa-red transition-colors flex items-center justify-center"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-cepsa-red/10 border border-cepsa-red/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-cepsa-red flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-cepsa-red">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Phone Number */}
                    {step === 'phone' && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0600000000"
                                        className="input w-full pl-12"
                                        required
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-2">
                                    We&apos;ll send you a verification code
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !phone}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Code'
                                )}
                            </button>

                            {/* Test Note */}
                            <div className="p-3 bg-premium-gold/5 border border-premium-gold/20 rounded-lg">
                                <p className="text-xs text-text-secondary">
                                    <span className="font-bold text-premium-gold">Test:</span> Use{' '}
                                    <code className="text-premium-gold">0600000000</code> / <code className="text-premium-gold">123456</code>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Verification Code</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        className="input w-full pl-12 text-center text-2xl tracking-widest font-bold"
                                        required
                                        maxLength={6}
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-2">
                                    Code sent to {phone}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Continue'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={loading}
                                    className="btn-secondary w-full"
                                >
                                    Change Number
                                </button>
                            </div>

                            {/* Resend */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                    className="text-sm text-premium-gold hover:underline"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
