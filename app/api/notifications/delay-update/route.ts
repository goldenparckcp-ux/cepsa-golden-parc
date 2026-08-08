import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { bookingId, tableName, delayMinutes, customNotes } = body;

        if (!bookingId || !tableName || delayMinutes === undefined) {
            return NextResponse.json({ error: 'Missing required parameters (bookingId, tableName, delayMinutes)' }, { status: 400 });
        }

        const validTables = ['restaurant_orders', 'hotel_reservations', 'pool_bookings', 'service_bookings'];
        if (!validTables.includes(tableName)) {
            return NextResponse.json({ error: 'Table name invalid' }, { status: 400 });
        }

        // Fetch current record
        const { data: record, error: fetchErr } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .eq('id', bookingId)
            .maybeSingle();

        if (fetchErr || !record) {
            return NextResponse.json({ error: 'Booking or order not found' }, { status: 404 });
        }

        const currentDelay = Number(record.delay_minutes) || 0;
        const newDelay = currentDelay + Number(delayMinutes);

        // Compute new updated arrival timestamp
        const baseCreatedAt = record.created_at ? new Date(record.created_at) : new Date();
        const updatedArrival = new Date(baseCreatedAt.getTime() + (30 + newDelay) * 60000);

        const updatePayload: Record<string, any> = {
            delay_minutes: newDelay,
            updated_arrival_time: updatedArrival.toISOString(),
            updated_at: new Date().toISOString()
        };

        if (customNotes) {
            updatePayload.notes = record.notes ? `${record.notes} | Retard: ${customNotes}` : `Retard: ${customNotes}`;
        }

        // Update target booking table
        const { error: updateErr } = await supabaseAdmin
            .from(tableName)
            .update(updatePayload)
            .eq('id', bookingId);

        if (updateErr) {
            console.error(`Failed to update delay on ${tableName}:`, updateErr.message);
        }

        // Log confirmation notification for the client
        const clientNotif = {
            user_id: record.user_id || 'global',
            customer_phone: record.customer_phone,
            type: 'personal',
            title: '✅ Retard enregistré',
            message: `Votre retard de +${delayMinutes} min a été enregistré avec succès. Le staff (cuisine/réception) a été notifié en temps réel.`,
            booking_id: bookingId,
            booking_table: tableName,
            is_read: false,
            action_type: 'none'
        };

        try {
            await supabaseAdmin.from('notifications').insert(clientNotif);
        } catch {}

        return NextResponse.json({
            success: true,
            delayMinutes: newDelay,
            updatedArrivalTime: updatedArrival.toISOString(),
            message: `Retard de +${delayMinutes} min synchronisé avec succès en base de données.`
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
