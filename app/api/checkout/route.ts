import { NextResponse } from 'next/server';
import { createStripeDeposit, createPayPalOrder, calculateArboun } from '@/lib/payment';

export async function POST(req: Request) {
    try {
        const { bookingId, amount, serviceType, gateway } = await req.json();

        if (!bookingId || !gateway) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
        }

        // Logic: Calculate the Deposit if not provided
        const depositAmount = amount || calculateArboun(100, serviceType);

        if (gateway === 'stripe') {
            const intent = await createStripeDeposit(bookingId, depositAmount);
            return NextResponse.json({
                client_secret: intent.client_secret,
                amount: intent.amount / 100,
                id: intent.id
            });
        }

        if (gateway === 'paypal') {
            const order = await createPayPalOrder(bookingId, depositAmount);
            return NextResponse.json({
                order_id: order.id,
                amount: depositAmount,
                links: order.links
            });
        }

        return NextResponse.json({ error: 'Invalid Gateway' }, { status: 400 });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Checkout Error:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
