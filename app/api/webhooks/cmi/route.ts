import { NextResponse } from 'next/server';
import { validateCmiHash } from '@/lib/cmi';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const params: Record<string, string> = {};
        
        formData.forEach((value, key) => {
            params[key] = value.toString();
        });

        const storeKey = process.env.CMI_STORE_KEY || 'dummy_store_key';
        const providedHash = params['HASH'];
        
        if (!providedHash || !validateCmiHash(params, storeKey, providedHash)) {
            console.error("Invalid CMI Hash received in Webhook");
            return new NextResponse("Invalid Hash", { status: 400 });
        }

        const bookingId = params['oid'];
        const responseCode = params['ProcReturnCode'];
        const amount = params['amount'];

        if (responseCode === '00') {
            // Payment Success
            // Update database to mark order as confirmed/paid
            // 1. Check hotel_reservations
            const { data: hotel } = await supabase.from('hotel_reservations').select('id').eq('id', bookingId).maybeSingle();
            if (hotel) {
                await supabase.from('hotel_reservations').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', bookingId);
            } else {
                const { data: pool } = await supabase.from('pool_bookings').select('id').eq('id', bookingId).maybeSingle();
                if (pool) {
                    await supabase.from('pool_bookings').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', bookingId);
                } else {
                    const { data: resto } = await supabase.from('restaurant_orders').select('id').eq('id', bookingId).maybeSingle();
                    if (resto) {
                        await supabase.from('restaurant_orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', bookingId);
                    }
                }
            }

            return new NextResponse("ACTION=POSTAUTH", { status: 200, headers: { 'Content-Type': 'text/plain' } });
        } else {
            // Payment Failed
            console.warn(`CMI Payment Failed for ${bookingId} with code ${responseCode}`);
            return new NextResponse("APPROVED", { status: 200, headers: { 'Content-Type': 'text/plain' } }); // CMI expects APPROVED to acknowledge receipt even on fail
        }
    } catch (err) {
        console.error("CMI Webhook error:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
