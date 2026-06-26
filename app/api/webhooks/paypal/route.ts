import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
    // Rate limiting (20 requests per minute)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rl = rateLimit(ip, 20, 60000);
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json();

    // Basic webhook verification - check event type is expected
    const allowedEventTypes = ['PAYMENT.CAPTURE.COMPLETED', 'CHECKOUT.ORDER.APPROVED', 'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REFUNDED'];
    if (!body.event_type || !allowedEventTypes.includes(body.event_type)) {
        return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Verify the webhook has required fields
    if (!body.resource || !body.resource.id) {
        return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const bookingId = body.resource?.purchase_units?.[0]?.custom_id || body.resource?.custom_id;
    const captureId = body.resource?.id;
    const amount = body.resource?.amount?.value || body.resource?.purchase_units?.[0]?.amount?.value;

    if (bookingId) {
        // 1. Update Profile (Deposit Paid)
        const { error: updateError } = await supabase
            .from('service_bookings')
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
            amount: parseFloat(amount),
            gateway: 'paypal',
            gateway_reference: captureId,
            type: 'deposit',
            status: 'completed'
        });
    }

    return NextResponse.json({ received: true });
}
