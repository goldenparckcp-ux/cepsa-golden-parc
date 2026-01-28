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

    // --- RISK CONTROL (PRO MODE) ---
    // "Concierge Strategy": Never block money. 
    // If order is High Risk/High Value, accept it but flag for manual verification ("Pending Call").

    const RISK_LIMITS = { MAX_FOOD: 500, MAX_HOTEL_NIGHTS: 3 };
    let currentFoodTotal = 0;

    // Auto-Safety Flags
    let requiresConcierge = false;
    let internalNotes = orderData.notes || ""; // Preserve user notes

    // 1. Scan Items & Calc Totals
    orderData.items.forEach(item => {
        const name = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const qty = item.quantity || 1;

        if (name.includes('lavage') || name.includes('wash') || name.includes('vapeur') || name.includes('mecanique') || name.includes('vidange')) {
            serviceItems.push(item);
        } else if (name.includes('hotel') || name.includes('chambre') || name.includes('room') || name.includes('nuit')) {
            // Check Duration: If > 3 nights OR > 2 rooms -> Flag for concierge
            if (qty > RISK_LIMITS.MAX_HOTEL_NIGHTS || qty > 2) {
                requiresConcierge = true;
                internalNotes += " [SYSTEM: Séjour long/complexe -> Vérifier]";
            }
            hotelItems.push(item);
        } else if (name.includes('pool') || name.includes('piscine') || name.includes('baignade')) {
            poolItems.push(item);
        } else {
            // Food Check
            currentFoodTotal += (item.price || 0) * qty;
            foodItems.push(item);
        }
    });

    // 2. Financial Safety Check
    if (currentFoodTotal > RISK_LIMITS.MAX_FOOD) {
        requiresConcierge = true;
        internalNotes += ` [SYSTEM: Montant élevé (${currentFoodTotal}DH) -> Appeler Client]`;
    }

    // 3. Determine Final Status
    // If it requires concierge, force 'pending_verification'. Otherwise use requested status.
    const finalStatus = requiresConcierge ? 'pending_verification' : orderData.status;
    // -------------------------------

    let mainOrder = null;

    // 2. Handle Food Orders
    if (foodItems.length > 0) {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                created_at: new Date().toISOString(),
                status: finalStatus, // Use PRO status
                total_amount: currentFoodTotal,
                customer_phone: orderData.customer_phone,
                notes: internalNotes, // Includes risk warnings
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
    // 3. Handle Service Bookings (Lavage/Mecanique)
    if (serviceItems.length > 0) {
        // --- CHECK 1: Prevent Same-User Overlap (Anti-Spam) ---
        const typesInCart = new Set(serviceItems.map(item => {
            const norm = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return (norm.includes('mecanic') || norm.includes('vidange')) ? 'mecanique' : 'lavage';
        }));

        for (const type of Array.from(typesInCart)) {
            const { data: existing } = await supabase
                .from('service_bookings')
                .select('id')
                .eq('customer_phone', orderData.customer_phone)
                .eq('service_type', type)
                .in('status', ['scheduled', 'pending', 'processing'])
                .limit(1);

            if (existing && existing.length > 0) {
                const label = type === 'mecanique' ? 'Mécanique' : 'Lavage';
                throw new Error(`⚠️ Vous avez déjà un service ${label} en cours. Veuillez attendre sa finalisation.`);
            }
        }

        // --- CHECK 2: Capacity Assessment (Availability) ---
        const LIMITS: Record<string, number> = { 'mecanique': 2, 'lavage': 4 };

        for (const item of serviceItems) {
            // Only check if a specific slot is requested
            if (item.time_slot && item.date) {
                const normName = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const type = (normName.includes('mecanic') || normName.includes('vidange')) ? 'mecanique' : 'lavage';

                // Count active bookings for this slot
                const { count, error } = await supabase
                    .from('service_bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('service_type', type)
                    .eq('scheduled_at', item.date) // Assuming item.date is the day YYYY-MM-DD
                    .eq('time_slot', item.time_slot)
                    .in('status', ['scheduled', 'confirmed']);

                if (error) console.error("Availability Check Error:", error);

                const max = LIMITS[type] || 3;
                if ((count || 0) >= max) {
                    throw new Error(`⚠️ Le créneau de ${item.time_slot} pour ${type} est complet. Veuillez en choisir un autre.`);
                }
            }
        }
        // ------------------------------------------------

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
                    scheduled_at: item.date || new Date().toISOString(),
                    time_slot: item.time_slot || null,
                    status: 'scheduled',
                    notes: orderData.notes ? `Panier: ${orderData.notes}` : undefined
                });
            }
        }
    }

    // 4. Handle Hotel Reservations
    if (hotelItems.length > 0) {
        // --- CHECK 1: Anti-Spam (Same User) ---
        const { data: existingHotel } = await supabase
            .from('hotel_reservations')
            .select('id')
            .eq('customer_phone', orderData.customer_phone)
            .in('status', ['reserved', 'confirmed', 'active'])
            .limit(1);

        if (existingHotel && existingHotel.length > 0) {
            throw new Error("⚠️ Vous avez déjà une réservation d'hôtel active. Veuillez contacter la réception pour modifier.");
        }

        // --- CHECK 2: Room Availability ---
        for (const item of hotelItems) {
            const checkInDate = item.date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const nameLower = item.name.toLowerCase();

            // Define Limits based on Room Type
            let maxLimit = 5; // Default (Individuel/Standard)
            if (nameLower.includes('famil')) maxLimit = 2;
            else if (nameLower.includes('couple') || nameLower.includes('suite')) maxLimit = 3;

            const { count } = await supabase
                .from('hotel_reservations')
                .select('*', { count: 'exact', head: true })
                .ilike('room_type', `%${item.name}%`)
                .gte('check_in_at', `${checkInDate}T00:00:00`)
                .lt('check_in_at', `${checkInDate}T23:59:59`)
                .in('status', ['reserved', 'confirmed']);

            if ((count || 0) >= maxLimit) {
                throw new Error(`⚠️ Désolé, ce type de chambre est complet (Max ${maxLimit}) pour le ${checkInDate}.`);
            }
        }
        // ----------------------------------

        for (const item of hotelItems) {
            const qty = item.quantity || 1;
            for (let i = 0; i < qty; i++) {
                await supabase.from('hotel_reservations').insert({
                    room_number: "?",
                    room_type: item.name,
                    customer_phone: orderData.customer_phone,
                    check_in_at: item.date ? `${item.date}T14:00:00` : new Date().toISOString(),
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
