'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Phone, Lock, Loader2, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import CepsaLogo from '@/components/CepsaLogo';

interface InlineLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (phoneOrEmail: string) => void;
}

export default function InlineLoginModal({
    isOpen,
    onClose,
    onSuccess,
}: InlineLoginModalProps) {
    const [step, setStep] = useState<'main' | 'otp' | 'email' | 'email-sent'>('main');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!phone) return;
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
            setError(err instanceof Error ? err.message : 'Échec de l\'envoi du code. Veuillez réessayer.');
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
                if (otp === '123456') {
                    console.log('⚡ Dev Mode: Bypassing authentication with magic code');
                    localStorage.setItem('cep_mock_session', 'true');
                    localStorage.setItem('cep_mock_user_id', 'dev-user-123');
                    onSuccess(formattedPhone);
                    return;
                }
                throw error;
            }

            if (!data.user) throw new Error('Vérification échouée');

            localStorage.removeItem('cep_mock_session');
            onSuccess(formattedPhone);
        } catch (err: unknown) {
            if (otp === '123456') {
                console.log('⚡ Dev Mode: Bypassing authentication with magic code');
                localStorage.setItem('cep_mock_session', 'true');
                localStorage.setItem('cep_mock_user_id', 'dev-user-123');
                onSuccess(formattedPhone);
                return;
            }
            setError(err instanceof Error ? err.message : 'Code incorrect. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            setStep('email-sent');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Impossible d\'envoyer le lien de connexion.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Échec de la connexion avec Google.');
            setLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Échec de la connexion avec Facebook.');
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('main');
        setOtp('');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-[#1E293B] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 text-white overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all duration-200"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Main View: Glovo-Style */}
                {step === 'main' && (
                    <div className="flex flex-col items-center">
                        {/* Logo with Glow */}
                        <div className="relative mt-2 mb-4 p-4 bg-white/5 rounded-full border border-white/10 shadow-inner">
                            <CepsaLogo className="w-12 h-12 text-[#D6001C]" />
                            <div className="absolute inset-0 bg-[#D6001C]/10 rounded-full blur-xl -z-10" />
                        </div>

                        {/* Headings */}
                        <h2 className="text-2xl font-extrabold text-white tracking-wide text-center">Bienvenue</h2>
                        <p className="text-[#94A3B8] text-sm text-center mt-1.5 mb-6 font-medium">
                            Continuez avec l&apos;une des options suivantes
                        </p>

                        {/* Error Message */}
                        {error && (
                            <div className="w-full mb-4 p-4 bg-[#D6001C]/10 border border-[#D6001C]/30 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-[#D6001C] flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-[#D6001C] font-semibold">{error}</p>
                            </div>
                        )}

                        {/* Phone Login Form */}
                        <form onSubmit={handleSendOTP} className="w-full space-y-4">
                            <div>
                                <label className="block text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mb-2">
                                    Numéro de téléphone
                                </label>
                                <div className="flex items-center bg-[#0F172A] rounded-2xl border border-white/10 focus-within:border-[#D6001C] transition-all duration-200 px-4 py-3.5">
                                    <span className="text-white font-bold text-base mr-3 flex items-center gap-1.5 border-r border-white/10 pr-3 h-6">
                                        <span>🇲🇦</span>
                                        <span>+212</span>
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder="6 00 00 00 00"
                                        className="bg-transparent text-white placeholder-[#64748B] font-semibold text-base outline-none w-full"
                                        required
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Main CTA: Continuer avec WhatsApp w/ Green Branding */}
                            <button
                                type="submit"
                                disabled={loading || !phone}
                                className="w-full bg-[#00A884] hover:bg-[#009675] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-[#00A884]/15 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Envoi du code...</span>
                                    </>
                                ) : (
                                    <>
                                        {/* WhatsApp SVG Icon */}
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        <span>Continuer avec WhatsApp</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="w-full flex items-center gap-4 my-6 text-[#94A3B8] text-[10px] font-extrabold uppercase tracking-widest">
                            <div className="flex-1 h-[1px] bg-white/10" />
                            <span>ou avec</span>
                            <div className="flex-1 h-[1px] bg-white/10" />
                        </div>

                        {/* Social login buttons stacked */}
                        <div className="w-full space-y-3">
                            {/* Google Button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-sm text-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.12.57 4.3 1.7l3.21-3.21C17.56 1.76 14.99 1 12 1 7.37 1 3.4 3.66 1.52 7.57l3.92 3.04C6.39 7.6 8.96 5.04 12 5.04z" />
                                    <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.21-2.36H12v4.51h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.7-4.92 3.7-8.6z" />
                                    <path fill="#FBBC05" d="M5.44 14.61c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.52 6.99C.55 8.93 0 11.1 0 13.38c0 2.28.55 4.45 1.52 6.39l3.92-3.04z" />
                                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.04 0-5.61-2.56-6.56-5.57l-3.92 3.04C3.4 20.34 7.37 23 12 23z" />
                                </svg>
                                <span>Google</span>
                            </button>

                            {/* Facebook Button */}
                            <button
                                onClick={handleFacebookLogin}
                                disabled={loading}
                                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-sm text-sm"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                            </button>

                            {/* E-mail Button */}
                            <button
                                onClick={() => { setStep('email'); setError(''); }}
                                disabled={loading}
                                className="w-full bg-[#1E293B] border border-white/10 hover:bg-[#2A374E] text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors text-sm"
                            >
                                <Mail className="w-5 h-5 text-[#94A3B8]" />
                                <span>E-mail</span>
                            </button>
                        </div>

                        {/* Test Box Info */}
                        <div className="mt-6 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl w-full text-center">
                            <p className="text-[11px] text-[#94A3B8]">
                                <span className="font-extrabold text-[#D4AF37]">Test local:</span> Utilisez le numéro{' '}
                                <code className="text-[#D4AF37] bg-white/5 px-1 py-0.5 rounded">0600000000</code> o code{' '}
                                <code className="text-[#D4AF37] bg-white/5 px-1 py-0.5 rounded">123456</code>
                            </p>
                        </div>
                    </div>
                )}

                {/* OTP View: Enter 6 digit code */}
                {step === 'otp' && (
                    <div>
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white mb-6 text-sm font-semibold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Retour</span>
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-extrabold text-white">Code de vérification</h3>
                            <p className="text-sm text-[#94A3B8] mt-1">
                                Saisissez le code à 6 chiffres envoyé au <span className="font-bold text-white">{phone}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-[#D6001C]/10 border border-[#D6001C]/30 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-[#D6001C] flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-[#D6001C] font-semibold">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        className="w-full bg-[#0F172A] border border-white/10 focus:border-[#D6001C] outline-none rounded-2xl pl-12 pr-4 py-3.5 text-center text-2xl tracking-[0.4em] font-extrabold text-white"
                                        required
                                        maxLength={6}
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full bg-[#D6001C] hover:bg-[#A00015] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Vérification...
                                        </>
                                    ) : (
                                        'Vérifier & Continuer'
                                    )}
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={loading}
                                    className="text-xs text-[#94A3B8] hover:underline"
                                >
                                    Changer de numéro de téléphone
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSendOTP()}
                                    disabled={loading}
                                    className="text-xs text-[#D4AF37] hover:underline font-bold"
                                >
                                    Renvoyer le code par SMS
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Email Login View */}
                {step === 'email' && (
                    <div>
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white mb-6 text-sm font-semibold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Retour</span>
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-extrabold text-white">Connexion par E-mail</h3>
                            <p className="text-sm text-[#94A3B8] mt-1">
                                Saisissez votre adresse e-mail pour recevoir un lien magique de connexion
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-[#D6001C]/10 border border-[#D6001C]/30 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-[#D6001C] flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-[#D6001C] font-semibold">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleEmailLogin} className="space-y-6">
                            <div>
                                <label className="block text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mb-2">
                                    Adresse e-mail
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre.email@gmail.com"
                                        className="w-full bg-[#0F172A] border border-white/10 focus:border-[#D6001C] outline-none rounded-2xl pl-12 pr-4 py-3.5 text-white font-semibold"
                                        required
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-[#D6001C] hover:bg-[#A00015] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Envoi du lien...
                                    </>
                                ) : (
                                    'Envoyer le lien de connexion'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Email Sent State */}
                {step === 'email-sent' && (
                    <div className="flex flex-col items-center text-center py-4">
                        <CheckCircle2 className="w-16 h-16 text-[#D4AF37] mb-4" />
                        <h3 className="text-xl font-extrabold text-white">Vérifiez votre boîte e-mail</h3>
                        <p className="text-sm text-[#94A3B8] mt-2 mb-6 max-w-sm">
                            Nous avons envoyé un lien de connexion magique à <span className="font-bold text-white">{email}</span>. 
                            Veuillez cliquer sur le lien pour terminer la connexion.
                        </p>

                        <button
                            onClick={handleBack}
                            className="w-full bg-[#1E293B] border border-white/10 hover:bg-[#2A374E] text-white font-bold py-3.5 rounded-2xl transition-all duration-200 text-sm"
                        >
                            Retour au menu principal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
