import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const getProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

export const getMenuItems = async (category?: string) => {
    let query = supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const createOrder = async (orderData: {
    customer_phone: string;
    total: number;
    items: any[];
    notes?: string;
    status: string;
    service_type: 'dine_in' | 'pre_order';
    table_number?: string;
    arrival_time?: string;
}) => {

    // 1. Separate Items
    const foodItems: any[] = [];
    const serviceItems: any[] = [];
    const hotelItems: any[] = [];
    const poolItems: any[] = [];

    orderData.items.forEach(item => {
        // Normalize: Mécanique -> mecanique
        const name = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (name.includes('lavage') || name.includes('wash') || name.includes('vapeur') || name.includes('mecanique') || name.includes('vidange')) {
            serviceItems.push(item);
        } else if (name.includes('hotel') || name.includes('chambre') || name.includes('room') || name.includes('nuit')) {
            hotelItems.push(item);
        } else if (name.includes('pool') || name.includes('piscine') || name.includes('baignade')) {
            poolItems.push(item);
        } else {
            foodItems.push(item);
        }
    });

    let mainOrder = null;

    // 2. Handle Food Orders
    if (foodItems.length > 0) {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                created_at: new Date().toISOString(),
                status: orderData.status,
                total_amount: foodItems.reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0), // Calc total for food only
                customer_phone: orderData.customer_phone,
                notes: orderData.notes,
                service_type: orderData.service_type,
                table_number: orderData.table_number,
                arrival_time: orderData.arrival_time
            }])
            .select()
            .single();

        if (orderError) throw orderError;
        mainOrder = order;

        const orderItems = foodItems.map((item) => ({
            order_id: order.id,
            item_name: item.name,
            quantity: item.quantity || 1,
            price: item.price || item.totalPrice,
            image_url: item.image,
            customizations: item.customizations || {},
            prep_time: item.prep_time || "15 min"
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;
    }

    // 3. Handle Service Bookings (Lavage/Mecanique)
    if (serviceItems.length > 0) {
        // Create a booking for each item * quantity
        for (const item of serviceItems) {
            const qty = item.quantity || 1;
            const normName = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            for (let i = 0; i < qty; i++) {
                await supabase.from('service_bookings').insert({
                    service_type: normName.includes('mecanic') || normName.includes('vidange') ? 'mecanique' : 'lavage',
                    service_name: item.name,
                    customer_phone: orderData.customer_phone,
                    vehicle_info: "Non spécifié (Via Panier)",
                    scheduled_at: new Date().toISOString(),
                    status: 'scheduled',
                    notes: orderData.notes ? `Panier: ${orderData.notes}` : undefined
                });
            }
        }
    }

    // 4. Handle Hotel Reservations
    if (hotelItems.length > 0) {
        for (const item of hotelItems) {
            const qty = item.quantity || 1;
            for (let i = 0; i < qty; i++) {
                await supabase.from('hotel_reservations').insert({
                    room_number: "?",
                    room_type: item.name,
                    customer_phone: orderData.customer_phone,
                    check_in_at: new Date().toISOString(),
                    duration_label: "Overnight",
                    price: item.price,
                    status: 'reserved'
                });
            }
        }
    }

    // 5. Handle Pool Bookings
    if (poolItems.length > 0) {
        for (const item of poolItems) {
            const qty = item.quantity || 1;
            // One booking per line item (aggregating qty as visitors)
            await supabase.from('pool_bookings').insert({
                booking_number: Math.floor(Math.random() * 10000), // Simple placeholder if serial fails
                pool_type: item.name,
                visitors_count: qty,
                customer_phone: orderData.customer_phone,
                scheduled_at: new Date().toISOString(),
                status: 'active',
                total_amount: item.price * qty
            });
        }
    }

    return mainOrder || { id: 'multi-service', status: 'success' };
};

export const getActiveOrders = async (userId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getWalletBalance = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance, partial_payment_enabled')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

export const getWalletTransactions = async (userId: string, limit = 10) => {
    const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
};

export const createPoolBooking = async (bookingData: {
    user_id: string;
    spot_id: string;
    spot_type: string;
    date: string;
    time_slot: string;
    price: number;
}) => {
    const { data, error } = await supabase
        .from('pool_bookings')
        .insert([bookingData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getHotelBooking = async (userId: string) => {
    const { data, error } = await supabase
        .from('hotel_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

    if (error) throw error;
    return data;
};

// Real-time subscription for order updates
export const subscribeToOrderUpdates = (orderId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`order-${orderId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`,
            },
            callback
        )
        .subscribe();
};
