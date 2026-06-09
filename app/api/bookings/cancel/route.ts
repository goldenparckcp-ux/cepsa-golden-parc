import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client to bypass RLS for secure state changes
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function parseScheduledTime(booking: any, tableName: string): Date {
    if (tableName === 'hotel_reservations') {
        if (booking.check_in) {
            // Assume standard check-in at 14:00 local time
            return new Date(`${booking.check_in}T14:00:00`);
        }
    } else if (tableName === 'pool_bookings') {
        if (booking.booking_date) {
            let timePart = "09:00:00";
            if (booking.time_slot) {
                const parts = booking.time_slot.split(' - ');
                if (parts.length > 0 && parts[0].includes(':')) {
                    const cleanTime = parts[0].trim();
                    timePart = cleanTime.length === 5 ? `${cleanTime}:00` : cleanTime;
                }
            }
            return new Date(`${booking.booking_date}T${timePart}`);
        }
    } else if (tableName === 'service_bookings') {
        const datePart = booking.scheduled_date || booking.booking_date || (booking.created_at ? booking.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
        let timePart = "09:00:00";
        if (booking.time_slot) {
            const parts = booking.time_slot.split(' - ');
            if (parts.length > 0 && parts[0].includes(':')) {
                const cleanTime = parts[0].trim();
                timePart = cleanTime.length === 5 ? `${cleanTime}:00` : cleanTime;
            }
        }
        return new Date(`${datePart}T${timePart}`);
    }
    return booking.scheduled_at ? new Date(booking.scheduled_at) : new Date(booking.created_at || Date.now());
}

export async function POST(req: Request) {
    try {
        const { bookingId, tableName: passedTableName } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
        }

        // Determine correct table name
        let tableName = passedTableName;
        let booking = null;

        if (tableName) {
            const { data } = await supabaseAdmin.from(tableName).select('*').eq('id', bookingId).maybeSingle();
            booking = data;
        } else {
            // Scan tables to find booking
            const tables = ['hotel_reservations', 'pool_bookings', 'service_bookings', 'restaurant_orders'];
            for (const t of tables) {
                const { data } = await supabaseAdmin.from(t).select('*').eq('id', bookingId).maybeSingle();
                if (data) {
                    booking = data;
                    tableName = t;
                    break;
                }
            }
        }

        if (!booking || !tableName) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // If already cancelled or forfeited
        if (booking.status === 'cancelled' || booking.status === 'forfeited') {
            return NextResponse.json({ success: true, message: 'Réservation déjà annulée.' });
        }

        // Calculate time difference
        const scheduledTime = parseScheduledTime(booking, tableName);
        const now = new Date();
        const diffMs = scheduledTime.getTime() - now.getTime();
        const diffMins = diffMs / 60000;

        const depositPaid = booking.deposit_paid === true;
        const depositAmount = parseFloat(booking.deposit_amount || booking.price || 0);
        const userId = booking.user_id;

        if (diffMins > 45) {
            // --- REFUND ROUTE ---
            // 1. Cancel the booking
            const { error: cancelError } = await supabaseAdmin
                .from(tableName)
                .update({ status: 'cancelled' })
                .eq('id', bookingId);

            if (cancelError) throw cancelError;

            let refunded = false;
            let refundAmount = 0;

            // 2. Refund to User Local Wallet if deposit was paid
            if (depositPaid && depositAmount > 0 && userId) {
                refundAmount = Math.max(0, depositAmount - 10); // Deduct 10 MAD processing fee
                
                if (refundAmount > 0) {
                    // Get current balance
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('wallet_balance')
                        .eq('id', userId)
                        .maybeSingle();
                    
                    const newBalance = (profile?.wallet_balance || 0) + refundAmount;

                    // Update wallet
                    await supabaseAdmin
                        .from('profiles')
                        .update({ wallet_balance: newBalance })
                        .eq('id', userId);

                    // Log wallet transaction
                    await supabaseAdmin.from('wallet_transactions').insert({
                        user_id: userId,
                        amount: refundAmount,
                        type: 'refund',
                        description: `Remboursement Annulation #${booking.booking_number || bookingId.slice(0, 5)}`,
                        status: 'completed'
                    });

                    // Log in transactions table
                    await supabaseAdmin.from('transactions').insert({
                        user_id: userId,
                        booking_id: bookingId,
                        booking_table: tableName,
                        amount: refundAmount,
                        gateway: 'wallet',
                        type: 'refund',
                        status: 'completed'
                    });

                    refunded = true;
                }
            }

            return NextResponse.json({
                success: true,
                refunded,
                refundAmount,
                message: refunded 
                    ? `Réservation annulée. Un remboursement de ${refundAmount} DH (frais de 10 DH déduits) a été crédité sur votre Wallet.`
                    : 'Réservation annulée avec succès.'
            });

        } else {
            // --- NO-SHOW / FORFEIT ROUTE ---
            // Lock deposit, status becomes FORFEITED
            const { error: forfeitError } = await supabaseAdmin
                .from(tableName)
                .update({ status: 'forfeited' })
                .eq('id', bookingId);

            if (forfeitError) throw forfeitError;

            return NextResponse.json({
                success: true,
                refunded: false,
                refundAmount: 0,
                message: 'Réservation annulée à moins de 45min. Le dépôt est conservé (Non remboursable).'
            });
        }

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Cancellation Endpoint Error:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
