import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Fallback in-memory store for global/promo notifications if Supabase table is pending
const systemNotificationCache: any[] = [
    {
        id: 'promo-welcome-1',
        created_at: new Date().toISOString(),
        user_id: 'global',
        type: 'promo',
        title: '🎉 Offre de Bienvenue Golden Parc',
        message: 'Bénéficiez de 5% de remise exceptionnelle pour tout paiement par carte bancaire en ligne !',
        is_read: false,
        action_type: 'none'
    }
];

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const phone = searchParams.get('phone');

        let notifications: any[] = [];

        try {
            // Attempt to query Supabase notifications table
            let query = supabaseAdmin.from('notifications').select('*').order('created_at', { ascending: false });

            if (userId || phone) {
                const filters: string[] = ['user_id.eq.global', 'type.eq.promo'];
                if (userId) filters.push(`user_id.eq.${userId}`);
                if (phone) filters.push(`customer_phone.eq.${phone}`);
                query = query.or(filters.join(','));
            }

            const { data, error } = await query;
            if (!error && data) {
                notifications = data;
            } else {
                notifications = [...systemNotificationCache];
            }
        } catch {
            notifications = [...systemNotificationCache];
        }

        return NextResponse.json({ success: true, notifications });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message, notifications: systemNotificationCache }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, id, userId, phone, notification } = body;

        if (action === 'mark_read' && id) {
            try {
                await supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', id);
            } catch {}
            const cached = systemNotificationCache.find(n => n.id === id);
            if (cached) cached.is_read = true;
            return NextResponse.json({ success: true, message: 'Notification marquée comme lue' });
        }

        if (action === 'mark_all_read') {
            try {
                if (userId || phone) {
                    await supabaseAdmin.from('notifications')
                        .update({ is_read: true })
                        .or(`user_id.eq.${userId},customer_phone.eq.${phone},user_id.eq.global`);
                }
            } catch {}
            systemNotificationCache.forEach(n => n.is_read = true);
            return NextResponse.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
        }

        if (action === 'create' && notification) {
            const newNotif = {
                id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                created_at: new Date().toISOString(),
                user_id: notification.userId || 'global',
                customer_phone: notification.phone || null,
                type: notification.type || 'personal',
                title: notification.title,
                message: notification.message,
                booking_id: notification.bookingId || null,
                booking_table: notification.bookingTable || null,
                is_read: false,
                action_type: notification.actionType || 'none',
                metadata: notification.metadata || {}
            };

            try {
                const { error } = await supabaseAdmin.from('notifications').insert(newNotif);
                if (error) {
                    systemNotificationCache.unshift(newNotif);
                }
            } catch {
                systemNotificationCache.unshift(newNotif);
            }

            return NextResponse.json({ success: true, notification: newNotif });
        }

        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
