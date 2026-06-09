import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Supabase admin client to bypass RLS for secure state changes
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-02-25.clover' as Stripe.StripeConfig['apiVersion'],
});

async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal Credentials");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || 'Failed to get PayPal access token');
    }
    return data.access_token;
}

async function refundPayPalCapture(captureId: string, amountUsd: number): Promise<unknown> {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            amount: {
                value: amountUsd.toFixed(2),
                currency_code: 'USD'
            }
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data) || 'Failed to refund PayPal capture');
    }
    return data;
}

interface BookingData {
    check_in?: string;
    booking_date?: string;
    time_slot?: string;
    scheduled_date?: string;
    created_at?: string;
    scheduled_at?: string;
    status?: string;
    deposit_paid?: boolean;
    deposit_amount?: number | string;
    price?: number | string;
    user_id?: string;
}

function parseScheduledTime(booking: BookingData, tableName: string): Date {
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
            let refundErrorMessage = null;

            // 2. Refund directly to bank account if deposit was paid
            if (depositPaid && depositAmount > 0 && userId) {
                refundAmount = Math.max(0, depositAmount - 10); // Deduct 10 MAD processing fee
                
                if (refundAmount > 0) {
                    // Find the payment transaction to get the gateway capture ID
                    const { data: tx } = await supabaseAdmin
                        .from('transactions')
                        .select('*')
                        .eq('booking_id', bookingId)
                        .eq('status', 'completed')
                        .or('type.eq.deposit,type.eq.recharge')
                        .maybeSingle();

                    if (tx && tx.gateway_reference) {
                        try {
                            if (tx.gateway === 'paypal') {
                                // Convert refund amount in MAD to USD (10 MAD = 1 USD)
                                const usdRefund = refundAmount / 10;
                                await refundPayPalCapture(tx.gateway_reference, usdRefund);
                            } else if (tx.gateway === 'stripe') {
                                await stripe.refunds.create({
                                    charge: tx.gateway_reference,
                                    amount: Math.round(refundAmount * 100) // cents
                                });
                            }

                            // Log refund transaction in the database
                            await supabaseAdmin.from('transactions').insert({
                                user_id: userId,
                                booking_id: bookingId,
                                booking_table: tableName,
                                amount: refundAmount,
                                gateway: tx.gateway,
                                gateway_reference: tx.gateway_reference,
                                type: 'refund',
                                status: 'completed'
                            });

                            refunded = true;
                        } catch (err) {
                            console.error("Gateway refund failed:", err);
                            refundErrorMessage = err instanceof Error ? err.message : String(err);
                        }
                    } else {
                        console.error("No transaction reference found for booking:", bookingId);
                        refundErrorMessage = "Aucune référence de transaction bancaire trouvée pour effectuer le remboursement.";
                    }
                }
            }

            return NextResponse.json({
                success: true,
                refunded,
                refundAmount,
                message: refunded 
                    ? `Réservation annulée. Un remboursement de ${refundAmount} DH (frais de 10 DH déduits) a été recrédité sur votre compte bancaire.`
                    : refundErrorMessage 
                        ? `Réservation annulée mais le remboursement automatique a échoué : ${refundErrorMessage}`
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
