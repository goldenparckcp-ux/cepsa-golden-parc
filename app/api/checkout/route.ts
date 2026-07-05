import { NextResponse } from 'next/server';
import { createPayPalOrder, calculateArboun } from '@/lib/payment';
import { supabase } from '@/lib/supabase';
import { generateCmiHash } from '@/lib/cmi';
import { CheckoutSchema } from '@/lib/validations';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // 2. Validate input using Zod
        const parseResult = CheckoutSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
              { error: 'Données invalides', details: parseResult.error.flatten().fieldErrors }, 
              { status: 400 }
            );
        }

        const { bookingId, amount, serviceType, gateway, paymentType } = parseResult.data;

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
        
        if (gateway === 'cmi') {
            const cmiClientId = process.env.CMI_CLIENT_ID || 'dummy_client_id';
            const cmiStoreKey = process.env.CMI_STORE_KEY || 'dummy_store_key';
            const reqUrl = new URL(req.url);
            const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
            
            const cmiParams: Record<string, string> = {
                clientid: cmiClientId,
                amount: finalAmount.toFixed(2),
                oid: bookingId,
                okUrl: `${baseUrl}/api/checkout/cmi-return`,
                failUrl: `${baseUrl}/api/checkout/cmi-return`,
                callbackUrl: `${baseUrl}/api/webhooks/cmi`,
                TranType: "PreAuth",
                currency: "504", // 504 is MAD
                storetype: "3D_PAY_HOSTING",
                hashAlgorithm: "ver3",
                lang: "fr",
            };
            
            const hash = generateCmiHash(cmiParams, cmiStoreKey);
            cmiParams['HASH'] = hash;
            
            return NextResponse.json({
                cmi_params: cmiParams,
                amount: finalAmount,
                gateway_url: process.env.CMI_GATEWAY_URL || 'https://testpayment.cmi.co.ma/fim/est3Dgate'
            });
        }

        return NextResponse.json({ error: 'Invalid Gateway' }, { status: 400 });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Checkout Error:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
