import { NextResponse } from 'next/server';
import { createPayPalOrder, calculateArboun } from '@/lib/payment';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { bookingId, amount, serviceType, gateway, paymentType } = await req.json();

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

        let finalAmount = amount || 0;
        if (dbTotalPrice) {
            if (paymentType === 'full_discounted') {
                finalAmount = Math.round(dbTotalPrice * 0.90);
            } else if (paymentType === 'deposit') {
                finalAmount = calculateArboun(dbTotalPrice, serviceType);
            } else if (paymentType === 'full') {
                finalAmount = dbTotalPrice;
            } else {
                // Retrocompatibility fallback
                finalAmount = calculateArboun(dbTotalPrice, serviceType);
            }
        }

        if (gateway === 'paypal') {
            const order = await createPayPalOrder(bookingId, finalAmount);
            return NextResponse.json({
                order_id: order.id,
                amount: finalAmount,
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
