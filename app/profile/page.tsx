"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, Check, User, Loader2, ArrowRight, LogOut, Clock, Package, Wifi, Phone, Crown, QrCode, X, Moon, Waves, Trash2, UtensilsCrossed, AlertTriangle, Pencil, Save, ChevronLeft, Mail } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

import { useAuth } from '@/lib/state/AuthProvider';

import Image from 'next/image';

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/restaurant';
    const { user: authUser, loading: authLoading } = useAuth(); // Global Auth

    // Auth States
    const [step, setStep] = useState<'phone' | 'otp' | 'profile' | 'dashboard' | 'email' | 'email-sent'>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    interface Order {
        id: string;
        type: string;
        date: string;
        status: string;
        title: string;
        details: string;
        amount: number;
        code?: string;
        table?: string;
        image?: string;
        duration?: string;
        contextIcon?: string | null;
        scheduledAt?: string;
        deposit_amount?: number;
        deposit_paid?: boolean;
        rawItems?: any;
        locationType?: string;
        locationDetail?: string;
        arrivalTime?: string;
        customerNotes?: string;
    }

    // Dashboard Data
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [wifiCopied, setWifiCopied] = useState(false);

    // QR Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Order Editing States
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [newTableDetail, setNewTableDetail] = useState("");
    const [newArrivalTime, setNewArrivalTime] = useState("");
    const [newNotes, setNewNotes] = useState("");

    // Update Profile Handler
    const handleUpdateProfile = async () => {
        if (!editName || editName.length < 2) { alert("Nom invalide"); return; }
        setIsLoading(true);

        const updates: Record<string, string> = {
            full_name: editName,
            phone: editPhone
        };

        // Demo User Bypass
        if (userId === 'test-user-id' || phone === '0600000000') {
            setFullName(editName);
            setPhone(editPhone);
            setIsEditing(false);
            setIsLoading(false);
            return;
        }

        const { error } = await supabase.from('profiles').update(updates).eq('id', userId);

        if (error) {
            alert('Erreur: ' + error.message);
        } else {
            setFullName(editName);
            setPhone(editPhone);
            setIsEditing(false);
        }
        setIsLoading(false);
    };

    const startEditing = () => {
        setEditName(fullName);
        setEditPhone(phone);
        setIsEditing(true);
    };

    // Cancel Order Handler
    const handleCancelOrder = async (orderId: string, table: string, scheduledAt?: string, depositAmount?: number, depositPaid?: boolean) => {
        let refundMsg = "";

        if (scheduledAt && depositPaid && depositAmount) {
            const now = new Date();
            const serviceTime = new Date(scheduledAt);
            const diffMs = serviceTime.getTime() - now.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins <= 45) {
                refundMsg = "\n⚠️ Attention: Annulation à moins de 45min. Le dépôt ne sera pas remboursé.";
            } else {
                refundMsg = `\n✅ Remboursable: ${depositAmount - 10} DH seront recrédités sur votre compte bancaire (Frais de 10 DH déduits).`;
            }
        }

        if (!confirm(`Voulez-vous vraiment annuler cette réservation ?${refundMsg}`)) return;

        setIsLoading(true);

        try {
            const res = await fetch('/api/bookings/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: orderId, tableName: table })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Erreur lors de l'annulation");
            }

            alert(result.message || "Annulation effectuée.");

            // Update UI by removing order f list
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    const getArrivalDate = (createdAt: Date, arrivalTimeStr: string): Date => {
        const arrivalTime = arrivalTimeStr.toLowerCase().trim();
        const date = new Date(createdAt);
        
        if (arrivalTime.includes("min")) {
            const mins = parseInt(arrivalTime.replace(/[^0-9]/g, "")) || 0;
            date.setMinutes(date.getMinutes() + mins);
            return date;
        }
        
        if (arrivalTime.includes("h")) {
            const parts = arrivalTime.split("h");
            const hours = parseInt(parts[0].replace(/[^0-9]/g, "")) || 0;
            const mins = parts[1] ? (parseInt(parts[1].replace(/[^0-9]/g, "")) || 0) : 0;
            
            if (hours >= 8) {
                date.setHours(hours);
                date.setMinutes(mins);
                date.setSeconds(0);
                date.setMilliseconds(0);
            } else {
                date.setMinutes(date.getMinutes() + (hours * 60 + mins));
            }
            return date;
        }
        
        date.setMinutes(date.getMinutes() + 30);
        return date;
    };

    const getIsModifiable = (order: Order): boolean => {
        if (order.status === 'cancelled' || order.status === 'completed' || order.status === 'ready' || order.status === 'preparing') {
            return false;
        }
        if (order.table !== 'restaurant_orders') return false;
        
        let itemsList = [];
        try {
            itemsList = typeof order.rawItems === 'string' ? JSON.parse(order.rawItems) : order.rawItems;
        } catch {
            itemsList = [];
        }
        const metaItem = Array.isArray(itemsList) ? itemsList.find((i: any) => i.is_meta) : null;
        if (!metaItem) return false;
        
        const createdAt = new Date(order.date);
        const now = new Date();
        
        if (metaItem.location_type === 'on_way') {
            const arrivalTimeStr = metaItem.arrival_time || "30 min";
            const arrivalDate = getArrivalDate(createdAt, arrivalTimeStr);
            const diffMs = arrivalDate.getTime() - now.getTime();
            const diffMins = diffMs / 60000;
            return diffMins > 45;
        } else {
            const diffMs = now.getTime() - createdAt.getTime();
            const diffMins = diffMs / 60000;
            return diffMins < 10;
        }
    };

    const handleSaveEditedOrder = async () => {
        if (!editingOrder) return;
        setIsLoading(true);
        try {
            let itemsList = [];
            try {
                itemsList = typeof editingOrder.rawItems === 'string' ? JSON.parse(editingOrder.rawItems) : editingOrder.rawItems;
            } catch {
                itemsList = [];
            }
            
            const metaIdx = itemsList.findIndex((i: any) => i.is_meta);
            if (metaIdx !== -1) {
                if (itemsList[metaIdx].location_type === 'on_way') {
                    itemsList[metaIdx].arrival_time = newArrivalTime;
                } else {
                    itemsList[metaIdx].location_detail = newTableDetail;
                }
                itemsList[metaIdx].customer_notes = newNotes;
            }
            
            const { error } = await supabase
                .from('restaurant_orders')
                .update({ items: itemsList })
                .eq('id', editingOrder.id);
                
            if (error) throw error;
            
            alert("Commande modifiée avec succès.");
            
            if (userId) {
                fetchUserOrders(userId, editPhone || phone || email);
            }
            setEditingOrder(null);
        } catch (err: any) {
            alert("Erreur lors de la modification: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Orders - Updated to work with both phone and Google users
    const fetchUserOrders = useCallback(async (userId: string | null, contactInfo: string) => {
        if (!userId && !contactInfo) return;
        setLoadingOrders(true);

        // Build query for each table based on available identifiers
        let query = '';
        if (userId && contactInfo) query = `user_id.eq.${userId},customer_phone.eq.${contactInfo}`;
        else if (userId) query = `user_id.eq.${userId}`;
        else query = `customer_phone.eq.${contactInfo}`;

        // Pool bookings use customer_phone field
        let poolQuery = contactInfo ? `customer_phone.eq.${contactInfo}` : '';
        if (userId && poolQuery) poolQuery += `,user_id.eq.${userId}`;
        else if (userId) poolQuery = `user_id.eq.${userId}`;

        const { data: serv } = await supabase.from('service_bookings').select('*').or(query);
        const { data: hotel } = await supabase.from('hotel_reservations').select('*').or(query);
        const { data: pool } = await supabase.from('pool_bookings').select('*').or(poolQuery || query);
        const { data: resto } = await supabase.from('restaurant_orders').select('*').or(query);

        const all = [
            // --- LAVAGE / SERVICES ---
            ...(serv || []).map(x => ({
                ...x,
                id: x.id,
                type: 'Service',
                date: x.created_at,
                status: x.status,
                title: (x.service_type === 'pool' || (x.service_name || '').toLowerCase().includes('piscine'))
                    ? 'Accès Piscine'
                    : (x.service_type === 'lavage')
                        ? (x.service_name || 'Lavage Auto').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        : (x.service_name || 'Lavage Auto'),
                details: (x.service_type === 'lavage')
                    ? `Le ${new Date(x.scheduled_date || x.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • ${x.time_slot || 'En attente'}${x.vehicle_info ? ` • ${x.vehicle_info}` : ''}`
                    : ((x.service_type === 'pool' || (x.service_name || '').toLowerCase().includes('piscine'))
                        ? (x.service_name || '').replace(/^Piscine\s*/i, '')
                        : 'Service sur demande'),
                amount: x.price || 100,
                code: x.booking_number,
                table: 'service_bookings',
                image: (x.service_type === 'lavage')
                    ? 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=200'
                    : (x.service_type === 'pool' || (x.service_name || '').toLowerCase().includes('piscine'))
                        ? 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200'
                        : 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=200',
                duration: (x.service_type === 'pool' || (x.service_name || '').toLowerCase().includes('piscine'))
                    ? 'Journée'
                    : (x.time_slot ? x.time_slot.split('-').length > 1
                        ? 'Sur RDV'
                        : '45 min'
                        : '45 min'),
                scheduledAt: x.scheduled_at || x.scheduled_date || x.booking_date,
                deposit_amount: x.deposit_amount,
                deposit_paid: x.deposit_paid
            })),

            // --- HOTEL ---
            ...(hotel || []).map(x => {
                // Determine Image based on Room Type
                let img = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'; // Default / Standard
                const type = (x.room_type || '').toLowerCase();

                if (type.includes('deluxe')) img = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800';
                if (type.includes('suite')) img = 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800';
                if (type.includes('familiale')) img = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

                // Determine Duration Text
                let durationText = "";
                if (x.booking_type === 'sieste') {
                    durationText = `${x.duration_hours || 3}h (Sieste)`;
                } else {
                    durationText = `${x.nights || 1} Nuit(s)`;
                }

                // Format Date
                const dateObj = x.check_in ? new Date(x.check_in) : new Date();
                const dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

                return {
                    ...x,
                    id: x.id,
                    type: 'Hôtel',
                    date: x.created_at,
                    status: x.status,
                    title: `Réservation ${x.room_type || 'Chambre'}`,
                    details: `${x.guests || 2} Voyageurs • ${durationText} • Du ${dateStr}`,
                    amount: x.total_price || 0,
                    code: x.booking_number,
                    table: 'hotel_reservations',
                    image: img,
                    duration: '24h',
                    scheduledAt: x.check_in,
                    deposit_amount: x.deposit_amount,
                    deposit_paid: x.deposit_paid
                };
            }),

            // --- PISCINE ---
            ...(pool || []).map(x => {
                // Determine image based on context if possible, otherwise generic generic pool
                const img = (x.adults || 0) > 2
                    ? 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200' // Group/Family
                    : 'https://images.unsplash.com/photo-1572331165267-854da2b49242?w=200'; // Couple/Solo

                // Map ambiance to label
                const ambianceMap: Record<string, string> = {
                    'family': 'Famille 👨‍👩‍👧‍👦',
                    'mixed': 'Mixte 👫',
                    'women': 'Femmes 💃',
                    'famille': 'Famille 👨‍👩‍👧‍👦',
                    'mixte': 'Mixte 👫',
                    'femmes': 'Femmes 💃'
                };
                const ambianceLabel = ambianceMap[x.ambiance] || x.ambiance || 'Standard';

                // Format booking date (The day they are coming)
                const bookDate = x.booking_date
                    ? new Date(x.booking_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    : 'Date à confirmer';

                return {
                    ...x,
                    id: x.id,
                    type: 'Piscine',
                    date: x.created_at || x.booking_date,
                    status: x.status,
                    title: `Piscine (${ambianceLabel})`,
                    details: `Le ${bookDate} • ${x.adults || 1} Adulte(s), ${x.children || 0} Enfant(s)`,
                    amount: x.total_price || ((x.adults || 1) * 150 + (x.children || 0) * 100),
                    code: x.booking_number,
                    table: 'pool_bookings',
                    image: img,
                    duration: 'Journée',
                    scheduledAt: x.booking_date,
                    deposit_amount: x.deposit_amount,
                    deposit_paid: x.deposit_paid
                };
            }),

            // --- RESTAURANT ---
            ...(resto || []).map(x => {
                let itemsList = [];
                try { itemsList = typeof x.items === 'string' ? JSON.parse(x.items) : x.items; } catch { itemsList = []; }

                // 1. Separate Food from Meta Info (Table/Time)
                const foodItems = Array.isArray(itemsList) ? itemsList.filter((i: Record<string, unknown>) => !i.is_meta) : [];
                const metaItem = Array.isArray(itemsList) ? itemsList.find((i: Record<string, unknown>) => i.is_meta) : null;

                // 2. Get Main Title
                const firstItem = foodItems[0];
                const mainName = firstItem?.name || 'Commande Restaurant';

                // 3. Build SUPER Detailed String (All options + Custom Notes)
                const fullDetailsArray: string[] = [];

                foodItems.forEach((item: Record<string, unknown>) => {
                    const itemName = item.name;
                    const itemQuantity = item.quantity || 1;
                    let detailLine = `x${itemQuantity} ${itemName}`;

                    if (item.meta) {
                        detailLine += ` (${item.meta})`;
                    } else {
                        const sels = item.customizations || item.selections;
                        if (sels) {
                            const itemDetails: string[] = [];
                            const visibleOpts = Object.entries(sels as Record<string, unknown>)
                                .filter(([k, v]) => k !== 'special_instructions' && v && (Array.isArray(v) ? v.length > 0 : true))
                                .map(([, v]) => {
                                    if (Array.isArray(v)) return v.join(', ');
                                    return `${v}`;
                                });
                            if (visibleOpts.length > 0) itemDetails.push(...visibleOpts);
                            if ((sels as Record<string, unknown>).special_instructions) {
                                itemDetails.push(`Note: ${(sels as Record<string, unknown>).special_instructions}`);
                            }
                            if (itemDetails.length > 0) {
                                detailLine += ` (${itemDetails.join(', ')})`;
                            }
                        }
                    }
                    fullDetailsArray.push(detailLine);
                });

                // c) Parse Global Order Note
                if (metaItem?.customer_notes) {
                    fullDetailsArray.push(`Note Globale: ${metaItem.customer_notes}`);
                }

                const detailsStr = fullDetailsArray.join(" • ");

                // 4. Handle Context (Table vs Takeout)
                let contextInfo = "";
                let contextIcon = null;

                if (metaItem) {
                    const locType = metaItem.location_type || metaItem.type;
                    if (locType === 'on_site' || locType === 'dine_in') {
                        const locDetail = metaItem.location_detail || metaItem.table_number;
                        const locName = metaItem.on_site_location || 'table';
                        const label = locName === 'table' ? 'Table' : locName === 'pool' ? 'Piscine Place' : 'Chambre';
                        contextInfo = `${label} N° ${locDetail || '?'}`;
                        contextIcon = 'table';
                    } else if (locType === 'on_way' || locType === 'takeout') {
                        contextInfo = `Arrivée ${metaItem.arrival_time || 'Bientôt'}`;
                        contextIcon = 'clock';
                    }
                }

                // Append Context to Details if meaningful
                let finalDetails = detailsStr;
                if (contextInfo) {
                    if (finalDetails && finalDetails !== "Aucune option sélectionnée") {
                        finalDetails += ` • ${contextInfo}`;
                    } else {
                        finalDetails = contextInfo;
                    }
                } else if (!finalDetails || finalDetails === "Aucune option sélectionnée") {
                    finalDetails = "Commande standard";
                }

                return {
                    ...x,
                    id: x.id,
                    type: 'Restaurant',
                    date: x.created_at,
                    status: x.status,
                    title: foodItems.length > 1 ? `${mainName} + ${foodItems.length - 1} autre(s)` : mainName,
                    details: finalDetails,
                    contextInfo: contextInfo, // New Field for Table/Time
                    contextIcon: contextIcon,
                    amount: x.total_price || x.total_amount || 0,
                    code: x.order_number,
                    table: 'restaurant_orders',
                    image: firstItem?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
                    duration: '15-20 min',
                    rawItems: x.items
                };
            }),
        ]
            // Filter out Cancelled orders (Hidden from history)
            .filter(order => order.status !== 'cancelled')
            .sort((a, b) => {
                const dateA = new Date(a.date || 0).getTime();
                const dateB = new Date(b.date || 0).getTime();
                return dateB - dateA;
            });

        setOrders(all);
        setLoadingOrders(false);
        setIsLoading(false);
    }, []);

    // Helper to load profile data
    const loadUserProfile = useCallback(async (uid: string) => {
        setIsLoading(true);
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).single();

        // If no profile exists, create one automatically (especially for Google users)
        if (!profile && authUser) {
            const newProfile = {
                id: uid,
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
                avatar_url: authUser.user_metadata?.avatar_url || '',
                phone: authUser.phone || '',
                created_at: new Date().toISOString()
            };

            const { data: created, error } = await supabase
                .from('profiles')
                .insert(newProfile)
                .select()
                .single();

            if (!error && created) {
                profile = created;
            }
        }

        if (profile) {
            setFullName(profile.full_name || 'Client');
            setPhone(profile.phone || '');
            setEmail(profile.email || '');
            setUserId(uid);

            // Check if there's a redirect parameter
            if (redirectTo && redirectTo !== '/restaurant' && redirectTo !== '/profile') {
                // Redirect to the requested page
                router.push(redirectTo);
            } else {
                // Stay on profile dashboard
                setStep('dashboard');
                fetchUserOrders(uid, profile.phone || profile.email);
            }
        } else {
            // Fallback: show profile creation form
            console.log("Could not create profile automatically, showing form");
            if (authUser?.email) {
                setEmail(authUser.email);
                setFullName(authUser.user_metadata?.full_name || '');
            }
            setUserId(uid);
            setStep('profile');
        }
        setIsLoading(false);
    }, [authUser, fetchUserOrders, redirectTo, router]);

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
    }, [authUser, authLoading, loadUserProfile]);

    const handleCopyWifi = () => {
        navigator.clipboard.writeText("GoldenParc2024");
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

    const handleEmailLogin = async () => {
        if (!email) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/profile`,
                },
            });

            if (error) throw error;
            setStep('email-sent');
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Impossible d\'envoyer le lien de connexion.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) return;
        setIsLoading(true);

        // --- UNIVERSAL BYPASS (NO SMS NEEDED) ---
        if (otp === '111111' || (phone === '0600000000' && otp === '123456')) {

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

            // Check if there's a redirect parameter
            if (redirectTo && redirectTo !== '/restaurant' && redirectTo !== '/profile') {
                router.push(redirectTo);
            } else {
                setStep('dashboard');
                fetchUserOrders(data.user.id, profile.phone);
            }
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
            fetchUserOrders(userId, phone);
            return;
        }
        // -------------------------------------------------------

        setIsLoading(true);
        const { error } = await supabase.from('profiles').insert({
            id: userId,
            full_name: fullName,
            phone: phone,
            email: email, // Save email if present
            created_at: new Date().toISOString()
        });

        setIsLoading(false);
        if (error) {
            console.error("Supabase Error:", error);
            if (error.code === '23505') {
                // Profile already exists, redirect or show dashboard
                if (redirectTo && redirectTo !== '/restaurant' && redirectTo !== '/profile') {
                    router.push(redirectTo);
                } else {
                    setStep('dashboard');
                    fetchUserOrders(userId, phone);
                }
            } else {
                alert("Erreur: Database error saving new user");
            }
        } else {
            // Profile created successfully, redirect or show dashboard
            if (redirectTo && redirectTo !== '/restaurant' && redirectTo !== '/profile') {
                router.push(redirectTo);
            } else {
                setStep('dashboard');
                fetchUserOrders(userId, phone);
            }
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
        if (s === 'confirmed' || s === 'completed' || s === 'active') color = "bg-green-500/10 text-green-500 border border-green-500/20";
        if (s === 'cancelled') color = "bg-red-500/10 text-red-500 border border-red-500/20";

        const label = s === 'pending' ? 'En attente' : s === 'cancelled' ? 'Annulé' : s === 'active' ? 'Validé' : s;

        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${color}`}>
                {label}
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
        <div className="min-h-screen pt-16 md:pt-20 bg-[#0F172A] relative overflow-hidden flex flex-col font-sans">

            {/* Premium Background FX */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] opacity-30" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] opacity-30" />
            </div>

            {/* Header / Back Navigation */}
            <div className="sticky top-[64px] md:top-[80px] z-30 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/5 p-4 pt-6">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => {
                            if (window.history.length > 1) {
                                router.back();
                            } else {
                                router.push('/');
                            }
                        }} 
                        className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold" 
                        aria-label="Retour"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Golden Park</div>
                </div>
            </div>

            {/* --- DASHBOARD VIEW --- */}
            {
                step === 'dashboard' ? (
                    <div className="flex-1 pb-28 max-w-2xl mx-auto w-full pt-6 px-4 md:px-0 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* ACCOUNT HEADER */}
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Mon Profil</h1>
                                <div className="flex items-center gap-3">
                                    <p className="text-gray-400 text-sm font-medium">Bienvenue, <span className="text-white">{fullName.split(' ')[0]}</span></p>
                                    <button
                                        onClick={startEditing}
                                        className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-lg hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                                    >
                                        <Pencil className="w-3 h-3" /> Modifier
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors hover:rotate-90 duration-300"
                                aria-label="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        {/* EDIT PROFILE MODAL */}
                        {isEditing && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-[#1E293B] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
                                    <h3 className="text-xl font-bold text-white mb-6">Modifier le Profil</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nom Complet</label>
                                            <input
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500/50"
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Téléphone</label>
                                            <input
                                                value={editPhone}
                                                onChange={e => setEditPhone(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500/50"
                                                placeholder="06..."
                                            />
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={handleUpdateProfile}
                                                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold shadow-lg shadow-amber-500/20 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Save className="w-4 h-4" /> Enregistrer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EDIT ORDER MODAL */}
                        {editingOrder && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-[#1E293B] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
                                    <h3 className="text-xl font-bold text-white mb-6">Modifier la Commande</h3>

                                    <div className="space-y-4">
                                        {/* Dynamic field based on Location Type */}
                                        {(() => {
                                            let itemsList = [];
                                            try {
                                                itemsList = typeof editingOrder.rawItems === 'string' ? JSON.parse(editingOrder.rawItems) : editingOrder.rawItems;
                                            } catch {
                                                itemsList = [];
                                            }
                                            const metaItem = itemsList.find((i: any) => i.is_meta) || {};
                                            const isWay = metaItem.location_type === 'on_way';

                                            return isWay ? (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Heure d'arrivée</label>
                                                    <input
                                                        value={newArrivalTime}
                                                        onChange={e => setNewArrivalTime(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500/50"
                                                        placeholder="Ex: 30 min, 14h30"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Numéro de table / Emplacement</label>
                                                    <input
                                                        value={newTableDetail}
                                                        onChange={e => setNewTableDetail(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500/50"
                                                        placeholder="Ex: Table 5"
                                                    />
                                                </div>
                                            );
                                        })()}

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Notes / Remarques</label>
                                            <textarea
                                                value={newNotes}
                                                onChange={e => setNewNotes(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500/50 h-24 resize-none"
                                                placeholder="Instructions particulières..."
                                            />
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={() => setEditingOrder(null)}
                                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={handleSaveEditedOrder}
                                                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold shadow-lg shadow-amber-500/20 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Save className="w-4 h-4" /> Enregistrer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DIGITAL MEMBER CARD - ULTRA PREMIUM */}
                        <div className="relative w-full aspect-[1.7/1] rounded-[2rem] p-8 border border-white/10 shadow-2xl mb-10 overflow-hidden group transform hover:scale-[1.02] transition-transform duration-500">

                                {/* Dynamic Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0F172A] to-black" />
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                {/* Gold Accents */}
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 blur-[80px] rounded-full group-hover:bg-amber-500/30 transition-colors duration-700" />
                                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-amber-900/10 to-transparent" />

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/40">
                                                <Crown className="w-5 h-5 text-black fill-black/20 stroke-[2.5]" />
                                            </div>
                                            <div>
                                                <div className="font-black text-amber-500 tracking-widest text-xs uppercase mb-0.5">Golden Member</div>
                                                <div className="text-[10px] text-gray-400 font-mono tracking-wider">ID: {userId?.slice(0, 8).toUpperCase() || 'Waitlist'}</div>
                                            </div>
                                        </div>
                                        {/* User Picture (Replaces Points) */}
                                        <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 p-0.5 shadow-lg shadow-black/50">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-black/50 relative">
                                                <Image
                                                    src={authUser?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Titulaire de la carte</div>
                                            <div className="text-amber-500/80 text-[10px] uppercase tracking-widest font-mono font-bold">
                                                Depuis {new Date(authUser?.created_at || '2024-01-01').getFullYear()}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none shadow-black drop-shadow-sm">
                                                {fullName}
                                            </div>
                                            <div className="h-8 w-12 bg-white/10 rounded-md backdrop-blur border border-white/5 flex items-center justify-center">
                                                <div className="w-6 h-4 border border-white/30 rounded-sm opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        {/* WARNING: MISSING PHONE */}
                        {(!phone || phone === '0600000000') && (
                            <div className="mb-8 mx-1 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-xl rounded-full pointer-events-none" />
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">Profil Incomplet</h4>
                                    <p className="text-gray-400 text-xs leading-relaxed">Ajoutez votre numéro de téléphone pour sécuriser votre compte et recevoir vos confirmations.</p>
                                </div>
                            </div>
                        )}

                        {/* QUICK ACTIONS - Glassmorphism */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div
                                onClick={handleCopyWifi}
                                className="bg-[#1E293B]/60 backdrop-blur-md p-5 rounded-3xl border border-white/5 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Wifi className="w-6 h-6" />
                                </div>
                                <div className="font-bold text-white text-base">WiFi Gratuit</div>
                                <div className="text-xs text-gray-500 font-mono mt-1">
                                    {wifiCopied ? <span className="text-green-400 flex items-center gap-1 font-bold animate-pulse"><Check className="w-3 h-3" /> Copié!</span> : 'GoldenParc2024'}
                                </div>
                            </div>

                            <a href="tel:0661690179" className="bg-[#1E293B]/60 backdrop-blur-md p-5 rounded-3xl border border-white/5 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div className="font-bold text-white text-base">Assistance</div>
                                <div className="text-xs text-gray-500 mt-1">Réception 24/7</div>
                            </a>
                        </div>

                        {/* SERVICES SHORTCUTS */}
                        <div className="mb-8">
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest px-2 mb-4">Menu Rapide</h3>
                            <div className="grid grid-cols-3 gap-3 px-1">
                                {[
                                    { name: 'Resto', icon: UtensilsCrossed, color: 'text-orange-500', bg: 'bg-orange-500/10', link: '/restaurant' },
                                    { name: 'Hôtel', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', link: '/hotel' },
                                    { name: 'Piscine', icon: Waves, color: 'text-red-400', bg: 'bg-red-500/10', link: '/piscine' },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => router.push(item.link)}
                                        className="flex flex-col items-center gap-2 group p-2 hover:bg-white/5 rounded-2xl transition-all"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center border border-white/5 active:scale-95 transition-all group-hover:scale-110 shadow-lg`}>
                                            <item.icon className={`w-5 h-5 ${item.color}`} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">{item.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* RECENT ACTIVITY - Clean & Modern List */}
                        <div>
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-xl font-bold text-white tracking-tight">Activité Récente</h3>
                                {orders.length > 0 && <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{orders.length} commandes</span>}
                            </div>

                            {loadingOrders ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-28 bg-white/5 rounded-3xl animate-pulse" />
                                    ))}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="bg-[#1E293B]/40 rounded-3xl p-10 text-center border border-white/5 border-dashed">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Package className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2">Aucune activité</h4>
                                    <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Vos réservations et commandes apparaîtront ici une fois confirmées.</p>
                                    <button onClick={() => router.push('/')} className="px-8 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                                        Découvrir les services
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 pb-8">
                                    {orders.map((order, idx) => (
                                        <div key={idx} className="bg-[#1E293B]/80 border border-white/5 p-4 rounded-[20px] flex items-start gap-4 hover:border-white/10 hover:bg-[#1E293B] transition-all group relative overflow-hidden shadow-lg">

                                            {/* Image (Left) */}
                                            <div className="w-20 h-24 rounded-2xl overflow-hidden shrink-0 bg-black/50 relative shadow-inner">
                                                <Image src={order.image || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=200&h=200&fit=crop'} alt={order.type || 'Order'} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                {/* Type Badge on Image */}
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                                                    {/* Mini Icon based on Type */}
                                                    {order.type === 'Piscine' && <Waves className="w-4 h-4 text-white" />}
                                                    {order.type === 'Restaurant' && <UtensilsCrossed className="w-4 h-4 text-white" />}
                                                    {(order.type === 'Service') && <Clock className="w-4 h-4 text-white" />}
                                                    {order.type === 'Hôtel' && <Moon className="w-4 h-4 text-white" />}
                                                </div>
                                            </div>

                                            {/* Content (Middle) */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-white font-bold text-base leading-tight truncate">{order.title}</h3>
                                                    {getStatusChip(order.status)}
                                                </div>

                                                <p className="text-gray-400 text-xs font-medium whitespace-normal leading-relaxed mt-0.5">
                                                    {order.details}
                                                </p>

                                                <div className="text-[10px] text-gray-500 font-mono font-medium">
                                                    {new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            {/* Actions (Right - Copy & Status) */}
                                            <div className="flex flex-col items-end gap-3 shrink-0">
                                                <div className="text-amber-400 font-black text-sm">
                                                    {order.amount ? `${order.amount} DH` : 'Payé'}
                                                </div>

                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all border border-white/5 shadow-lg"
                                                    aria-label="View QR code"
                                                >
                                                    <QrCode className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Edit Button (Pencil) */}
                                            {getIsModifiable(order) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingOrder(order);
                                                        let itemsList = [];
                                                        try {
                                                            itemsList = typeof order.rawItems === 'string' ? JSON.parse(order.rawItems) : order.rawItems;
                                                        } catch {
                                                            itemsList = [];
                                                        }
                                                        const metaItem = itemsList.find((i: any) => i.is_meta) || {};
                                                        setNewTableDetail(metaItem.location_detail || "");
                                                        setNewArrivalTime(metaItem.arrival_time || "");
                                                        setNewNotes(metaItem.customer_notes || "");
                                                    }}
                                                    className="absolute bottom-4 right-10 text-gray-600 hover:text-amber-500 transition-colors p-1 animate-in fade-in duration-200"
                                                    title="Modifier"
                                                    aria-label="Modify order"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                            {order.status !== 'cancelled' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelOrder(
                                                            order.id,
                                                            order.table || 'service_bookings',
                                                            order.scheduledAt,
                                                            order.deposit_amount,
                                                            order.deposit_paid
                                                        );
                                                    }}
                                                    className="absolute bottom-4 right-4 text-gray-600 hover:text-red-500 transition-colors p-1"
                                                    title="Annuler"
                                                    aria-label="Cancel order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* QR CODE MODAL - PREMIUM */}
                        {selectedOrder && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
                                <div className="bg-[#1E293B] border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl relative shadow-amber-900/20 overflow-hidden">
                                    {/* GlowFx */}
                                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors z-10"
                                        aria-label="Close QR code modal"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="mb-8 relative z-10">
                                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30 rotate-3">
                                            <QrCode className="w-8 h-8 text-black" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-1">Scanner le Code</h3>
                                        <p className="text-gray-400 text-sm font-medium">Présentez ce code à la caisse ou au serveur.</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-3xl mx-auto mb-8 aspect-square max-w-[240px] flex items-center justify-center shadow-inner relative z-10 group">
                                        <Image
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedOrder.code || 'UNKNOWN'}`}
                                            alt="Order QR"
                                            width={300}
                                            height={300}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Corner Accents */}
                                        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-black/20 rounded-tl-lg" />
                                        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-black/20 rounded-tr-lg" />
                                        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-black/20 rounded-bl-lg" />
                                        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-black/20 rounded-br-lg" />
                                    </div>

                                    {/* Order Details Breakdown */}
                                    <div className="mb-6 max-h-48 overflow-y-auto text-left bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3 custom-scrollbar text-xs relative z-10">
                                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-wider border-b border-white/5 pb-1.5 flex justify-between items-center">
                                            <span>Détails du Service</span>
                                            <span className="text-amber-500 font-black">{selectedOrder.type}</span>
                                        </div>
                                        {selectedOrder.type === 'Restaurant' ? (
                                            (() => {
                                                let itemsList = [];
                                                try {
                                                    itemsList = typeof selectedOrder.rawItems === 'string' ? JSON.parse(selectedOrder.rawItems) : selectedOrder.rawItems;
                                                } catch {
                                                    itemsList = [];
                                                }
                                                const foodItems = Array.isArray(itemsList) ? itemsList.filter((i: any) => !i.is_meta) : [];
                                                const metaItem = Array.isArray(itemsList) ? itemsList.find((i: any) => i.is_meta) : null;
                                                return (
                                                    <div className="space-y-2.5">
                                                        {foodItems.map((item: any, idx: number) => (
                                                            <div key={idx} className="space-y-0.5">
                                                                <div className="font-bold text-white flex justify-between">
                                                                    <span>x{item.quantity || 1} {item.name}</span>
                                                                    <span className="text-amber-500 font-bold">{(item.price || item.basePrice || 0) * (item.quantity || 1)} DH</span>
                                                                </div>
                                                                {item.meta && <div className="text-[10px] text-gray-400 leading-normal">{item.meta}</div>}
                                                            </div>
                                                        ))}
                                                        {metaItem && (
                                                            <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[10px] text-gray-400 font-semibold">
                                                                <div>Mode: <span className="text-white">{metaItem.location_type === 'on_way' ? 'À emporter' : 'Sur Place'}</span></div>
                                                                {metaItem.location_type === 'on_way' ? (
                                                                    <div>Heure d&apos;arrivée: <span className="text-white">{metaItem.arrival_time || 'Bientôt'}</span></div>
                                                                ) : (
                                                                    <div>
                                                                        Emplacement: <span className="text-white">
                                                                            {metaItem.on_site_location === 'pool' ? 'Piscine' : metaItem.on_site_location === 'room' ? 'Chambre' : 'Table'} N° {metaItem.location_detail || '?'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {metaItem.customer_notes && <div className="italic text-orange-400/80 mt-1">Note: {metaItem.customer_notes}</div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="font-bold text-white leading-snug">{selectedOrder.title}</div>
                                                <div className="text-gray-400 leading-relaxed text-[11px]">{selectedOrder.details}</div>
                                                {selectedOrder.amount && (
                                                    <div className="pt-2 border-t border-white/5 flex justify-between text-xs font-black text-white">
                                                        <span>Montant</span>
                                                        <span className="text-amber-500">{selectedOrder.amount} DH</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md relative z-10">
                                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">Code de Réservation</div>
                                        <div className="text-3xl font-mono font-black text-amber-500 tracking-widest drop-shadow-sm">
                                            {selectedOrder.code || '-----'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LANGUAGE SELECTOR */}
                        <div className="mt-8 px-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Langue / اللغة</h3>
                            <div className="flex w-full items-center">
                                <LanguageSwitcher variant="profile" />
                            </div>
                        </div>

                        {/* LOGOUT BUTTON */}
                        <div className="mt-8 mb-4 px-4 flex flex-col gap-3">
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                            >
                                <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Se Déconnecter
                            </button>
                        </div>



                    </div>
                ) : (
                    /* --- AUTH FORMS - PREMIUM --- */
                    <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto relative">
                        {/* Auth Background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

                        <div className="text-center space-y-3 mb-10 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10">
                            <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border border-white/10 mb-4 shadow-xl shadow-red-900/20">
                                <Crown className="w-8 h-8 text-amber-500" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                Golden <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">Park</span> <span className="text-amber-500">Station</span>
                            </h1>
                            <p className="text-gray-400 font-medium">L&apos;expérience premium commence ici.</p>
                        </div>

                        <div className="w-full bg-[#1E293B]/80 hover:bg-[#1E293B]/90 transition-colors border border-white/10 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            {step === 'phone' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Numéro de Téléphone</label>
                                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-2xl focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
                                            <Smartphone className="text-gray-500 w-5 h-5" />
                                            <span className="text-gray-400 font-bold text-lg">+212</span>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder="6 00 00 00 00"
                                                className="bg-transparent outline-none text-white font-bold w-full text-lg tracking-wider placeholder:tracking-normal placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSendOtp}
                                        disabled={isLoading || phone.length < 9}
                                        className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-black text-white shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : <>Continuer <ArrowRight className="w-5 h-5" /></>}
                                    </button>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[#1e293b] px-2 text-gray-500 font-bold">Ou continuer avec</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                setIsLoading(true);
                                                const callbackUrl = new URL('/api/auth/callback', window.location.origin);
                                                callbackUrl.searchParams.set('next', '/profile');

                                                supabase.auth.signInWithOAuth({
                                                    provider: 'google',
                                                    options: {
                                                        redirectTo: callbackUrl.toString(),
                                                    }
                                                });
                                            }}
                                            className="py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-[0.98] transition-all text-sm shadow-sm"
                                        >
                                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" width="20" height="20">
                                                <path fill="#EA4335" d="M12 5.04c1.66 0 3.12.57 4.3 1.7l3.21-3.21C17.56 1.76 14.99 1 12 1 7.37 1 3.4 3.66 1.52 7.57l3.92 3.04C6.39 7.6 8.96 5.04 12 5.04z" />
                                                <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.21-2.36H12v4.51h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.7-4.92 3.7-8.6z" />
                                                <path fill="#FBBC05" d="M5.44 14.61c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.52 6.99C.55 8.93 0 11.1 0 13.38c0 2.28.55 4.45 1.52 6.39l3.92-3.04z" />
                                                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.04 0-5.61-2.56-6.56-5.57l-3.92 3.04C3.4 20.34 7.37 23 12 23z" />
                                            </svg>
                                            Google
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsLoading(true);
                                                const callbackUrl = new URL('/api/auth/callback', window.location.origin);
                                                callbackUrl.searchParams.set('next', '/profile');

                                                supabase.auth.signInWithOAuth({
                                                    provider: 'facebook',
                                                    options: {
                                                        redirectTo: callbackUrl.toString(),
                                                    }
                                                });
                                            }}
                                            className="py-4 bg-[#1877F2] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#166FE5] active:scale-[0.98] transition-all text-sm shadow-sm"
                                        >
                                            <svg className="w-5 h-5 flex-shrink-0 fill-current" viewBox="0 0 24 24" width="20" height="20">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                            Facebook
                                        </button>
                                    </div>

                                    {/* E-mail / Gmail manually */}
                                    <button
                                        onClick={() => setStep('email')}
                                        className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm"
                                    >
                                        <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        E-mail / Gmail
                                    </button>
                                </div>
                            )}

                            {/* E-mail Input Step */}
                            {step === 'email' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-white mb-1">Connexion par E-mail</h2>
                                        <p className="text-sm text-gray-400">Saisissez votre adresse Gmail ou E-mail pour continuer.</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-2xl focus-within:border-amber-500/50 transition-colors">
                                        <Mail className="text-gray-500 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="votre.email@gmail.com"
                                            className="bg-transparent outline-none text-white font-bold w-full text-lg placeholder:text-gray-600"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={handleEmailLogin}
                                        disabled={isLoading || !email}
                                        className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-black text-white shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Envoyer le lien"}
                                    </button>
                                    <button onClick={() => setStep('phone')} className="text-xs text-gray-500 w-full text-center hover:text-white transition-colors">Retour au téléphone</button>
                                </div>
                            )}

                            {/* E-mail Sent Step */}
                            {step === 'email-sent' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10 text-center py-4">
                                    <div className="inline-block p-3 rounded-full bg-green-500/10 border border-green-500/20 mb-2">
                                        <Check className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Vérifiez votre boîte mail</h2>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Un lien de connexion magique a été envoyé à <span className="font-bold text-white">{email}</span>. 
                                        Veuillez cliquer sur le lien dans votre boîte de réception pour vous connecter.
                                    </p>
                                    <button
                                        onClick={() => setStep('phone')}
                                        className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-colors"
                                    >
                                        Retour à la connexion
                                    </button>
                                </div>
                            )}

                            {step === 'otp' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-white mb-1">Vérification</h2>
                                        <p className="text-sm text-gray-400">Code envoyé au +212 {phone}</p>
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-center text-white font-mono text-3xl tracking-[0.5em] focus:border-amber-500/50 transition-colors placeholder:text-gray-700"
                                    />
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isLoading || otp.length < 6}
                                        className="w-full py-4 bg-white text-black rounded-xl font-black shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Vérifier"}
                                    </button>
                                    <button onClick={() => setStep('phone')} className="text-xs text-gray-500 w-full text-center hover:text-white transition-colors">Modifier le numéro</button>
                                </div>
                            )}

                            {step === 'profile' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-white">Créer votre profil</h2>
                                        <p className="text-sm text-gray-400">Dites-nous comment vous appeler.</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-2xl focus-within:border-amber-500/50 transition-colors">
                                        <User className="text-gray-500" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            placeholder="Votre Nom Complet"
                                            className="bg-transparent outline-none text-white font-bold w-full"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isLoading || !fullName}
                                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl font-black shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Commencer"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>}>
            <ProfileContent />
        </Suspense>
    );
}
