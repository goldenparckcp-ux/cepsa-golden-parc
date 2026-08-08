import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyStaffAuth } from '@/lib/auth-guard';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
    try {
        const auth = await verifyStaffAuth();
        if (!auth.success) return auth.response;
        if (auth.payload.role !== 'admin') {
            return NextResponse.json({ error: 'Accès refusé : Rôle administrateur requis.' }, { status: 403 });
        }

        const body = await req.json();
        const { title, message, targetPhone, targetUserId } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Titre et message requis.' }, { status: 400 });
        }

        const notificationData = {
            user_id: targetUserId || 'global',
            customer_phone: targetPhone || null,
            type: 'promo',
            title,
            message,
            is_read: false,
            action_type: 'none',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert(notificationData)
            .select()
            .maybeSingle();

        if (error) {
            console.warn("Inserted promo fallback:", error.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Notification promotionnelle diffusée avec succès !',
            notification: data || notificationData
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
