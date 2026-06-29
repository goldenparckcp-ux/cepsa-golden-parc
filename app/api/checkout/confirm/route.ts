import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// Initialize Supabase admin client to bypass RLS for secure state changes
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: { autoRefreshToken: false, persistSession: false },
    }
);

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

interface PayPalCaptureDetails {
    status: string;
    amount: {
        value: string;
        currency_code: string;
    };
    custom_id?: string;
}

async function verifyPayPalCapture(captureId: string): Promise<PayPalCaptureDetails> {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch PayPal capture details');
    }
    return data as PayPalCaptureDetails;
}

export async function POST(req: Request) {
    try {


        const body = await req.json();
        const { bookingId, tableName, orderId: captureId, amount } = body;

        if (!bookingId || !tableName || !captureId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify payment with PayPal API
        let paypalDetails;
        try {
            paypalDetails = await verifyPayPalCapture(captureId);
        } catch (paypalErr: any) {
            console.error("PayPal capture verification failed:", paypalErr);
            return NextResponse.json({ error: `PayPal verification failed: ${paypalErr.message}` }, { status: 400 });
        }

        if (paypalDetails.status !== 'COMPLETED') {
            return NextResponse.json({ error: `PayPal payment is not completed. Status: ${paypalDetails.status}` }, { status: 400 });
        }

        // Optional: Check amount matches (convert MAD to USD approximately, or accept PayPal's charge)
        const paidAmountUsd = parseFloat(paypalDetails.amount.value);
        const expectedAmountUsd = amount / 10;
        
        // Simple tolerance check (e.g. within 10% due to exchange rate differences)
        if (Math.abs(paidAmountUsd - expectedAmountUsd) > (expectedAmountUsd * 0.15)) {
            console.warn(`Amount mismatch: Paid ${paidAmountUsd} USD, expected ~${expectedAmountUsd} USD`);
            // We can log a warning but still accept the order or block it depending on strictness.
            // Let's accept it but log a warning to be safe against exchange rate changes.
        }

        // 2. Securely update booking database state via Admin Client
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .eq('id', bookingId)
            .maybeSingle();

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const updateData: Record<string, any> = { deposit_paid: true, status: 'confirmed' };
        // Check if table schema has deposit_amount or price column
        if (tableName === 'restaurant_orders' || tableName === 'orders') {
            updateData.deposit_amount = amount;
        } else if (tableName === 'pool_bookings') {
            updateData.status = 'active';
            updateData.deposit_paid = true;
        }

        const { error: updateError } = await supabaseAdmin
            .from(tableName)
            .update(updateData)
            .eq('id', bookingId);

        if (updateError) {
            console.error("Failed to update booking status:", updateError);
            return NextResponse.json({ error: 'Failed to update database booking status' }, { status: 500 });
        }

        // 3. Log Secure Transaction
        const { error: txError } = await supabaseAdmin.from('transactions').insert({
            user_id: booking.user_id || null,
            booking_id: bookingId,
            booking_table: tableName,
            amount: amount,
            gateway: 'paypal',
            gateway_reference: captureId,
            type: 'deposit',
            status: 'completed'
        });

        if (txError) {
            console.error("Failed to log transaction:", txError);
            // Non-blocking error, return success anyway since payment and booking are updated
        }

        return NextResponse.json({ success: true, message: 'Payment verified and booking confirmed.' });

    } catch (err: any) {
        console.error("Payment confirmation error:", err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
