import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    const body = await req.json();

    // Verify Event Type
    if (body.event_type !== 'CHECKOUT.ORDER.APPROVED' && body.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
        return NextResponse.json({ received: true });
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
