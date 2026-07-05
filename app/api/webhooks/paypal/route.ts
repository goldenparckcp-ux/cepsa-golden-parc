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

async function verifyPayPalWebhookSignature(req: Request, body: any): Promise<boolean> {
    const authAlgo = req.headers.get('paypal-auth-algo');
    const certUrl = req.headers.get('paypal-cert-url');
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionSig = req.headers.get('paypal-transmission-sig');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // Reject verification if webhook ID is not configured
    if (!webhookId) {
        console.error("PAYPAL_WEBHOOK_ID is not configured. Rejecting webhook.");
        return false; 
    }
    
    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
        console.error("Missing PayPal Webhook verification headers");
        return false;
    }

    try {
        const accessToken = await getPayPalAccessToken();
        const response = await fetch('https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                auth_algo: authAlgo,
                cert_url: certUrl,
                transmission_id: transmissionId,
                transmission_sig: transmissionSig,
                transmission_time: transmissionTime,
                webhook_id: webhookId,
                webhook_event: body
            })
        });

        const data = await response.json();
        return response.ok && data.verification_status === 'SUCCESS';
    } catch (err) {
        console.error("PayPal webhook verification error:", err);
        return false;
    }
}

export async function POST(req: Request) {


    const rawBodyText = await req.text();
    let body;
    try {
        body = JSON.parse(rawBodyText);
    } catch (err) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // 1. Verify webhook request signature with PayPal
    const isVerified = await verifyPayPalWebhookSignature(req, body);
    if (!isVerified) {
        console.error("PayPal Webhook signature verification FAILED!");
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

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
        // 2. Securely Update Database (Deposit Paid) via Admin Client
        const { error: updateError } = await supabaseAdmin
            .from('service_bookings')
            .update({ deposit_paid: true, status: 'confirmed' })
            .eq('id', bookingId);

        if (updateError) {
            // Try other tables if not in service_bookings
            await supabaseAdmin.from('hotel_reservations').update({ deposit_paid: true, status: 'confirmed' }).eq('id', bookingId);
            await supabaseAdmin.from('pool_bookings').update({ deposit_paid: true, status: 'active' }).eq('id', bookingId);
            await supabaseAdmin.from('restaurant_orders').update({ deposit_paid: true, status: 'confirmed' }).eq('id', bookingId);
        }

        // 3. Log Securely in Transactions table
        await supabaseAdmin.from('transactions').insert({
            user_id: body.resource?.custom_id ? null : undefined, // Will be resolved by triggers/defaults if needed
            booking_id: bookingId,
            amount: parseFloat(amount) * 10, // Assuming Paypal USD, MAD amount is roughly 10x
            gateway: 'paypal',
            gateway_reference: captureId,
            type: 'deposit',
            status: 'completed'
        });
    }

    return NextResponse.json({ received: true });
}
