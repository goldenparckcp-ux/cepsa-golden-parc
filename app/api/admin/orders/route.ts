import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BaseOrder {
    id: string;
    created_at: string;
    status: string;
    service_type: string;
    customer_phone?: string;
    notes?: string;
    total_amount: number;
    table_number?: string;
    arrival_time?: string;
}

interface Item {
    name: string;
    quantity: number;
    image?: string;
    customizations?: Record<string, unknown>;
}

interface UnifiedOrder extends BaseOrder {
    items: Item[];
    source: 'new' | 'legacy';
}

interface LegacyItem {
    name?: string;
    quantity: number;
    image?: string;
    customizations?: Record<string, unknown>;
    is_meta?: boolean;
    type?: string;
    table_number?: string;
    arrival_time?: string;
}

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase Environment Variables (Service Key)' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const allOrders: UnifiedOrder[] = [];

        // 1. Fetch NEW Orders (Relational 'orders' + 'order_items')
        const { data: ordersData, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .in('status', ['pending', 'preparing', 'ready', 'pending_verification'])
            .order('created_at', { ascending: true });

        if (ordersError) {
            console.error("Error fetching new orders:", ordersError);
        }

        if (ordersData && ordersData.length > 0) {
            const orderIds = ordersData.map((o) => o.id);
            const { data: itemsData } = await supabaseAdmin
                .from('order_items')
                .select('*')
                .in('order_id', orderIds);

            const unifiedNewOrders: UnifiedOrder[] = ordersData.map((order) => ({
                id: order.id,
                created_at: order.created_at,
                status: order.status,
                service_type: order.service_type,
                table_number: order.table_number,
                arrival_time: order.arrival_time,
                customer_phone: order.customer_phone,
                notes: order.notes,
                total_amount: order.total_amount,
                items: itemsData ? itemsData.filter((i) => i.order_id === order.id).map((i) => ({
                    name: i.item_name,
                    quantity: i.quantity,
                    image: i.image_url,
                    customizations: i.customizations
                })) : [],
                source: 'new'
            }));
            allOrders.push(...unifiedNewOrders);
        }

        // 2. Fetch LEGACY Orders ('restaurant_orders' - JSONB items)
        const { data: legacyData, error: legacyError } = await supabaseAdmin
            .from('restaurant_orders')
            .select('*')
            .in('status', ['pending', 'preparing', 'ready', 'pending_verification'])
            .order('created_at', { ascending: true });

        if (legacyError) {
            console.error("Error fetching legacy orders:", legacyError);
        }

        if (legacyData && legacyData.length > 0) {
            const unifiedLegacyOrders: UnifiedOrder[] = legacyData.map((order) => {
                const legacyItems = (order.items || []) as LegacyItem[];
                return {
                    id: order.id,
                    created_at: order.created_at,
                    status: order.status,
                    service_type: order.service_type || (legacyItems.find((i) => i.is_meta && i.type === 'dine_in') ? 'dine_in' : 'pre_order'),
                    table_number: order.table_number || (legacyItems.find((i) => i.is_meta && i.type === 'dine_in')?.table_number),
                    arrival_time: order.arrival_time || (legacyItems.find((i) => i.is_meta && i.type === 'takeout')?.arrival_time),
                    customer_phone: order.customer_phone,
                    notes: order.notes,
                    total_amount: order.total_amount || 0,
                    // Filter out meta items from legacy JSON structure
                    items: legacyItems.filter((i) => !i.is_meta).map((i) => ({
                        name: i.name || 'Sans nom',
                        quantity: i.quantity,
                        image: i.image,
                        customizations: i.customizations
                    })),
                    source: 'legacy'
                };
            });
            allOrders.push(...unifiedLegacyOrders);
        }

        // Sort Combined
        allOrders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        return NextResponse.json(allOrders);

    } catch (error) {
        console.error("API Error (GET):", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, status, source } = await request.json();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase Environment Variables' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const table = source === 'legacy' ? 'restaurant_orders' : 'orders';

        const { error } = await supabaseAdmin
            .from(table)
            .update({ status })
            .eq('id', id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Error (PUT):", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
