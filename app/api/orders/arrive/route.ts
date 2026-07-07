import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAdminSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return null;
    return createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, tableCode } = body;

        if (!orderId || !tableCode) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const supabase = getAdminSupabase();
        if (!supabase) {
            return NextResponse.json({ error: 'DB config missing' }, { status: 500 });
        }

        // Fetch order to get items
        const { data: order, error: fetchErr } = await supabase
            .from('restaurant_orders')
            .select('items')
            .eq('id', orderId)
            .single();

        if (fetchErr || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update items JSON to set table_number in meta
        const items = order.items;
        if (Array.isArray(items)) {
            const metaIdx = items.findIndex((i: any) => i.is_meta);
            if (metaIdx !== -1) {
                items[metaIdx].table_number = tableCode;
                // Alternatively you can set location_detail or change type to dine_in if wanted, 
                // but user wants it to just alert the staff. The UI already checks table_number.
            }
        }

        // Update order with new items and maybe a "ping" timestamp or status change if you want it to jump in UI
        const { error: updateErr } = await supabase
            .from('restaurant_orders')
            .update({ 
                items,
                status: 'pending' // ensure it gets noticed if it was stuck elsewhere
            })
            .eq('id', orderId);

        if (updateErr) {
            throw updateErr;
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
