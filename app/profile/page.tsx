"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, Check, User, ChevronRight, Loader2, ArrowRight, LogOut, Clock, Calendar, MapPin, Package, AlertCircle, Wifi, Copy, Phone, Crown, QrCode, X } from 'lucide-react';
import { COLORS } from '@/lib/theme';

import { useAuth } from '@/lib/state/AuthProvider';

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/restaurant';
    const { user: authUser, loading: authLoading } = useAuth(); // Global Auth

    // Auth States
    const [step, setStep] = useState<'phone' | 'otp' | 'profile' | 'dashboard'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Dashboard Data
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [wifiCopied, setWifiCopied] = useState(false);

    // QR Modal State
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    // Helper to load profile data
    const loadUserProfile = async (uid: string) => {
        setIsLoading(true);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).single();
        if (profile) {
            setFullName(profile.full_name || 'Client');
            setPhone(profile.phone || '');
            setUserId(uid);
            setStep('dashboard');
            fetchUserOrders(profile.phone);
        } else {
            console.log("No profile found, moving to creation step");
            setUserId(uid);
            setStep('profile');
        }
        setIsLoading(false);
    };

    // React to Auth Changes
    // React to Auth Changes
    useEffect(() => {
        let isMounted = true;

        const handleAuth = async () => {
            const hasAuthParams = window.location.hash.includes('access_token') ||
                window.location.search.includes('code') ||
                window.location.search.includes('error');

            // 1. If we have a user, load their profile immediately
            if (authUser) {
                await loadUserProfile(authUser.id);
                return;
            }

            // 2. If we are still loading global auth, just wait (UI shows spinner)
            if (authLoading) {
                return;
            }

            // 3. If global auth is done, but no user found:
            if (!authUser) {
                // If we see redirect params, Supabase might still be processing the exchange
                // We give it a short grace period, then force stop content loading
                if (hasAuthParams) {
                    console.log("Auth params present but no user yet. Waiting brief moment...");
                    setTimeout(() => {
                        if (isMounted) setIsLoading(false);
                    }, 3000); // 3s safety timeout to stop infinite spinner
                } else {
                    // No params, no user -> Show login form
                    setIsLoading(false);
                }
            }
        };

        handleAuth();
        return () => { isMounted = false; };
    }, [authUser, authLoading]);

    // Fetch Orders
    const fetchUserOrders = async (userPhone: string) => {
        if (!userPhone) return;
        setLoadingOrders(true);
        const { data: serv } = await supabase.from('service_bookings').select('*').eq('customer_phone', userPhone);
        const { data: hotel } = await supabase.from('hotel_reservations').select('*').eq('customer_phone', userPhone);
        // Note: hotel uses 'hotel_reservations' table created in schema, checking use in page... 
        // Original code used 'hotel_bookings', I should conform to SCHEMA 'hotel_reservations' or fix schema? 
        // My schema created 'hotel_reservations'. The code used 'hotel_bookings'.
        // I should fix the query table name here too while I am at it.

        const all = [
            ...(serv || []).map(x => ({ ...x, type: x.service_type || 'Service', date: x.created_at, status: x.status, title: x.service_name, code: x.booking_number })),
            ...(hotel || []).map(x => ({ ...x, type: 'Hotel', date: x.created_at, status: x.status, title: `${x.room_type} (${x.duration_label || 'Séjour'})`, code: x.booking_number })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setOrders(all);
        setLoadingOrders(false);
        setIsLoading(false);
    };

    const handleCopyWifi = () => {
        navigator.clipboard.writeText("GoldenPark2024");
        setWifiCopied(true);
        setTimeout(() => setWifiCopied(false), 2000);
    };

    const handleSendOtp = async () => {
        if (!phone || phone.length < 9) { alert("Numéro invalide"); return; }
        if (phone === '0600000000' || phone === '600000000') { setStep('otp'); return; }

        setIsLoading(true);
        const cleanPhone = phone.startsWith('+') ? phone : `+212${phone.replace(/^0/, '')}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: cleanPhone, options: { shouldCreateUser: true } });
        setIsLoading(false);
        if (error) { alert("Erreur: " + error.message); } else { setStep('otp'); }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) return;
        setIsLoading(true);

        // --- UNIVERSAL BYPASS (NO SMS NEEDED) ---
        if (otp === '111111' || (phone === '0600000000' && otp === '123456')) {
            const cleanPhone = phone.startsWith('+') ? phone : `+212${phone.replace(/^0/, '')}`;

            setFullName("Utilisateur Test");
            setUserId("test-user-id");
            setStep('dashboard');
            setIsLoading(false);
            return;
        }
        // ----------------------------------------

        const cleanPhone = phone.startsWith('+') ? phone : `+212${phone.replace(/^0/, '')}`;
        const { data, error } = await supabase.auth.verifyOtp({ phone: cleanPhone, token: otp, type: 'sms' });

        if (error || !data.user) { alert("Code invalide"); setIsLoading(false); return; }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        setIsLoading(false);

        if (profile) {
            setFullName(profile.full_name);
            setUserId(data.user.id);
            setStep('dashboard');
            fetchUserOrders(profile.phone);
        } else {
            setUserId(data.user.id);
            setStep('profile');
        }
    };

    const handleSaveProfile = async () => {
        if (!fullName) return;

        // --- DEMO BYPASS: Don't save to DB, just Local State ---
        if (userId === 'test-user-id' || phone === '0600000000') {
            localStorage.setItem('demo_user', JSON.stringify({ fullName, phone }));
            setStep('dashboard');
            fetchUserOrders(phone);
            return;
        }
        // -------------------------------------------------------

        setIsLoading(true);
        const { error } = await supabase.from('profiles').insert({
            id: userId,
            full_name: fullName,
            phone: phone,
            created_at: new Date().toISOString()
        });

        setIsLoading(false);
        if (error) {
            console.error("Supabase Error:", error);
            if (error.code === '23505') {
                setStep('dashboard');
                fetchUserOrders(phone);
            } else {
                alert("Erreur: Database error saving new user");
            }
        } else {
            setStep('dashboard');
            fetchUserOrders(phone);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setStep('phone');
        setPhone('');
        setOtp('');
        setOrders([]);
    };

    // --- RENDER HELPERS ---
    const getStatusChip = (status: string) => {
        const s = status?.toLowerCase() || 'pending';
        let color = "bg-gray-500/20 text-gray-400";
        if (s === 'pending') color = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
        if (s === 'confirmed' || s === 'completed') color = "bg-green-500/10 text-green-500 border border-green-500/20";
        if (s === 'cancelled') color = "bg-red-500/10 text-red-500 border border-red-500/20";

        return (
            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${color}`}>
                {s}
            </span>
        );
    };

    // --- LOADING SCREEN ---
    if (isLoading && step === 'phone') {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] relative overflow-hidden flex flex-col" style={{ backgroundColor: COLORS.bgDark }}>

            {/* Background Accents */}
            {step !== 'dashboard' && (
                <>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </>
            )}

            {/* --- DASHBOARD VIEW --- */}
            {step === 'dashboard' ? (
                <div className="flex-1 pb-24 max-w-4xl mx-auto w-full pt-6 px-4 md:px-0">

                    {/* User Header Card */}
                    <div className="bg-gradient-to-r from-red-900 to-[#1E293B] rounded-3xl p-6 md:p-8 flex items-center justify-between mb-6 shadow-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                                <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-3xl font-black text-white">{fullName}</h2>
                                <div className="flex items-center gap-2 text-red-200 text-sm md:text-base font-medium">
                                    <Smartphone className="w-4 h-4" /> {phone}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-black/30 hover:bg-black/50 p-3 rounded-xl transition-colors text-white/80 hover:text-white border border-white/10"
                            title="Se déconnecter"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    {/* --- VIP SERVICES --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div
                            onClick={handleCopyWifi}
                            className="bg-[#1E293B] p-5 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#1E293B]/80 hover:border-red-500/30 transition-all group active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Wifi className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Guest WiFi</div>
                                    <div className="text-white font-black text-lg group-hover:text-blue-400 transition-colors">
                                        GoldenPark2024
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-500">
                                {wifiCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            </div>
                        </div>

                        <a href="tel:0661690179" className="bg-[#1E293B] p-5 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#1E293B]/80 hover:border-green-500/30 transition-all group active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Besoin d'aide ?</div>
                                    <div className="text-white font-black text-lg group-hover:text-green-400 transition-colors">
                                        Réception 24/7
                                    </div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            </div>
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10 mb-8 flex items-center justify-around">
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">{orders.length}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase">Commandes</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-white flex items-center gap-1 justify-center">
                                0 <Crown className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-xs text-gray-500 font-bold uppercase">Points Gold</div>
                        </div>
                    </div>

                    {/* Recent Orders Section */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-red-500" /> Historique Récent
                        </h3>

                        {loadingOrders ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-[#1E293B] rounded-2xl p-8 text-center border border-white/5 border-dashed">
                                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">Aucune commande pour le moment.</p>
                                <button onClick={() => router.push('/')} className="mt-4 text-red-500 font-bold text-sm hover:underline">
                                    Découvrir nos services
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order, idx) => (
                                    <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-red-500/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                                {order.type === 'lavage' ? <Smartphone className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm md:text-base">{order.title || order.service_name || 'Commande'}</div>
                                                <div className="text-gray-500 text-xs flex items-center gap-2">
                                                    <span className="font-mono bg-white/10 px-1 rounded text-white">{order.code || '---'}</span>
                                                    <span>• {new Date(order.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors"
                                        >
                                            <QrCode className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* QR CODE MODAL */}
                    {selectedOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                            <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-white mb-1">Code Commande</h3>
                                    <p className="text-gray-400 text-sm">Montrez ce QR au staff.</p>
                                </div>

                                <div className="bg-white p-4 rounded-2xl mx-auto mb-6 w-64 h-64 flex items-center justify-center shadow-inner">
                                    {/* Generating a Real QR Code Image using API */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedOrder.code || 'UNKNOWN'}`}
                                        alt="Order QR"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                    <div className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-1">Booking ID</div>
                                    <div className="text-3xl font-mono font-black text-red-500 tracking-wider">
                                        {selectedOrder.code || '-----'}
                                    </div>
                                </div>

                                <div className="mt-6 text-sm text-gray-500">
                                    {selectedOrder.title}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                /* --- AUTH FORMS --- */
                <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto">
                    <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Golden <span className="text-red-600">Park</span>
                        </h1>
                        <p className="text-gray-400">Join our exclusive club for instant orders.</p>
                    </div>

                    <div className="w-full bg-[#1E293B] border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                        {step === 'phone' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-bold text-white">Quél est votre numéro ?</h2>
                                <div className="flex items-center gap-3 bg-black/20 border border-white/10 p-4 rounded-xl focus-within:border-red-600 transition-colors">
                                    <Smartphone className="text-gray-500" />
                                    <span className="text-gray-400 font-bold">+212</span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="6 00 00 00 00"
                                        className="bg-transparent outline-none text-white font-bold w-full text-lg tracking-widest placeholder:tracking-normal"
                                    />
                                </div>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={isLoading || phone.length < 9}
                                    className="w-full py-4 bg-red-600 rounded-xl font-black text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                                </button>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#1E293B] px-2 text-gray-500">Ou</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsLoading(true);
                                        supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: window.location.origin + '/profile',
                                            }
                                        });
                                    }}
                                    className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>

                                {/* Demo Footer */}
                                <div className="text-[10px] text-center text-gray-500 mt-4">Try Demo: 0600000000</div>
                            </div>
                        )}

                        {step === 'otp' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-white">Code de vérification</h2>
                                <p className="text-xs text-gray-500">Envoyé au +212 {phone}</p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-full bg-black/20 border border-white/10 p-4 rounded-xl outline-none text-center text-white font-mono text-3xl tracking-[1em] focus:border-red-600 transition-colors"
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isLoading || otp.length < 6}
                                    className="w-full py-4 bg-white text-black rounded-xl font-black shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Verify Code"}
                                </button>
                                <button onClick={() => setStep('phone')} className="text-xs text-gray-500 w-full text-center hover:text-white">Changer le numéro</button>
                            </div>
                        )}

                        {step === 'profile' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-white">Create Profile</h2>
                                <p className="text-sm text-gray-400">Pour mieux vous servir.</p>
                                <div className="flex items-center gap-3 bg-black/20 border border-white/10 p-4 rounded-xl focus-within:border-red-600 transition-colors">
                                    <User className="text-gray-500" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Nom complet"
                                        className="bg-transparent outline-none text-white font-bold w-full"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isLoading || !fullName}
                                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-600 rounded-xl font-black text-white shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Start Ordering"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>}>
            <ProfileContent />
        </Suspense>
    );
}
