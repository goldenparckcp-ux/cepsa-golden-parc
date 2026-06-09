import { NextResponse } from 'next/server';
import { createStripeDeposit, createPayPalOrder, calculateArboun } from '@/lib/payment';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { bookingId, amount, serviceType, gateway } = await req.json();

        if (!bookingId || !gateway) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
        }

        // Fetch total price f database for security verification
        let dbTotalPrice = 0;
        
        try {
            const { data: hotel } = await supabase.from('hotel_reservations').select('total_price').eq('id', bookingId).maybeSingle();
            if (hotel?.total_price) {
                dbTotalPrice = hotel.total_price;
            } else {
                const { data: pool } = await supabase.from('pool_bookings').select('total_price').eq('id', bookingId).maybeSingle();
                if (pool?.total_price) {
                    dbTotalPrice = pool.total_price;
                } else {
                    const { data: service } = await supabase.from('service_bookings').select('price').eq('id', bookingId).maybeSingle();
                    if (service?.price) {
                        dbTotalPrice = service.price;
                    } else {
                        const { data: resto } = await supabase.from('restaurant_orders').select('total_price').eq('id', bookingId).maybeSingle();
                        if (resto?.total_price) {
                            dbTotalPrice = resto.total_price;
                        }
                    }
                }
            }
        } catch (dbErr) {
            console.warn("DB price fetch warning:", dbErr);
        }

        const totalOrder = dbTotalPrice || amount || 0;
        const depositAmount = calculateArboun(totalOrder, serviceType);

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
