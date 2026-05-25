import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
    apiVersion: '2026-02-25.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Webhook Error:', message);
        return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const session = event.data.object as Stripe.PaymentIntent;
        const bookingId = session.metadata.bookingId;

        // 1. Update Profile (Deposit Paid)
        const { error: updateError } = await supabase
            .from('service_bookings') // Note: We should ideally have a generic table mapping or check multiple tables
            .update({ deposit_paid: true, status: 'confirmed' })
            .eq('id', bookingId);

        if (updateError) {
            // Try other tables if not in service_bookings
            await supabase.from('hotel_reservations').update({ deposit_paid: true, status: 'confirmed' }).eq('id', bookingId);
            await supabase.from('pool_bookings').update({ deposit_paid: true, status: 'active' }).eq('id', bookingId);
        }

        // 2. Log in Transactions table
        await supabase.from('transactions').insert({
            booking_id: bookingId,
            amount: session.amount / 100,
            gateway: 'stripe',
            gateway_reference: session.id,
            type: 'deposit',
            status: 'completed'
        });
    }

    return NextResponse.json({ received: true });
}
