import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
);

function parseScheduledTime(item: any, tableName: string): Date {
    const delayMins = Number(item.delay_minutes) || 0;
    let date = new Date(item.created_at || Date.now());

    if (tableName === 'restaurant_orders') {
        const meta = Array.isArray(item.items) ? item.items.find((i: any) => i.is_meta) : null;
        const arrivalTime = (meta?.arrival_time || "30 min").toLowerCase().trim();
        
        if (arrivalTime.includes("min")) {
            const mins = parseInt(arrivalTime.replace(/[^0-9]/g, "")) || 30;
            date.setMinutes(date.getMinutes() + mins);
        } else if (arrivalTime.includes("h")) {
            const parts = arrivalTime.split("h");
            const hours = parseInt(parts[0].replace(/[^0-9]/g, "")) || 0;
            const mins = parts[1] ? (parseInt(parts[1].replace(/[^0-9]/g, "")) || 0) : 0;
            if (hours >= 8) {
                date.setHours(hours, mins, 0, 0);
            } else {
                date.setMinutes(date.getMinutes() + (hours * 60 + mins));
            }
        } else {
            date.setMinutes(date.getMinutes() + 30);
        }
    } else if (tableName === 'hotel_reservations') {
        const checkIn = item.check_in_time || item.check_in_at || item.check_in;
        if (checkIn) {
            const checkInStr = String(checkIn);
            date = checkInStr.includes('T') ? new Date(checkInStr) : new Date(`${checkInStr}T14:00:00`);
        }
    } else if (tableName === 'pool_bookings') {
        if (item.booking_date) {
            let timePart = "09:00:00";
            if (item.time_slot) {
                const parts = item.time_slot.split(' - ');
                if (parts[0] && parts[0].includes(':')) {
                    timePart = parts[0].trim().length === 5 ? `${parts[0].trim()}:00` : parts[0].trim();
                }
            }
            date = new Date(`${item.booking_date}T${timePart}`);
        }
    } else if (tableName === 'service_bookings') {
        const datePart = item.scheduled_date || (item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
        let timePart = "09:00:00";
        if (item.time_slot) {
            const parts = item.time_slot.split(' - ');
            if (parts[0] && parts[0].includes(':')) {
                timePart = parts[0].trim().length === 5 ? `${parts[0].trim()}:00` : parts[0].trim();
            }
        }
        date = new Date(`${datePart}T${timePart}`);
    }

    // Apply delay offset
    if (delayMins > 0) {
        date.setMinutes(date.getMinutes() + delayMins);
    }

    return date;
}

export async function GET(req: Request) {
    try {
        const generatedNotifications: any[] = [];
        const now = new Date();

        // 1. Scan Restaurant Orders
        const { data: orders } = await supabaseAdmin
            .from('restaurant_orders')
            .select('*')
            .in('status', ['pending', 'preparing', 'ready', 'confirmed']);

        if (orders) {
            for (const order of orders) {
                const meta = Array.isArray(order.items) ? order.items.find((i: any) => i.is_meta) : null;
                const isSurTable = meta?.location_type === 'on_site' || meta?.location_type === 'sur_table';
                const scheduledTime = parseScheduledTime(order, 'restaurant_orders');
                const diffMins = Math.floor((scheduledTime.getTime() - now.getTime()) / 60000);
                const orderNum = order.order_number || order.id.slice(0, 6);

                // Type 3: 50-Min Cancellation Warning (5 min before 45-min cutoff)
                if (!isSurTable && diffMins <= 52 && diffMins >= 44 && !order.notified_cancel_50m) {
                    const notif = {
                        user_id: order.user_id || 'global',
                        customer_phone: order.customer_phone,
                        type: 'cancellation_warning',
                        title: '⏱️ Rappel Annulation : Il vous reste 5 min',
                        message: `Il vous reste 5 minutes pour annuler sans frais votre commande #${orderNum} (Limite de 45 min avant l'arrivée).`,
                        booking_id: order.id,
                        booking_table: 'restaurant_orders',
                        action_type: 'cancel_prompt',
                        is_read: false,
                        metadata: { order_number: orderNum, remaining_cancel_mins: 5 }
                    };

                    generatedNotifications.push(notif);
                    try {
                        await supabaseAdmin.from('notifications').insert(notif);
                        await supabaseAdmin.from('restaurant_orders').update({ notified_cancel_50m: true }).eq('id', order.id);
                    } catch {}
                }

                // Type 4: 30-Min Arrival & Delay Check
                if (diffMins <= 35 && diffMins >= 15 && !order.notified_arrival_30m) {
                    const notif = {
                        user_id: order.user_id || 'global',
                        customer_phone: order.customer_phone,
                        type: 'arrival_check',
                        title: "🚗 Confirmation d'arrivée (~30 min)",
                        message: `Arriverez-vous à l'heure prévue (~30 min) pour votre commande #${orderNum} ou serez-vous en retard ?`,
                        booking_id: order.id,
                        booking_table: 'restaurant_orders',
                        action_type: 'delay_prompt',
                        is_read: false,
                        metadata: { order_number: orderNum, scheduled_time: scheduledTime.toISOString() }
                    };

                    generatedNotifications.push(notif);
                    try {
                        await supabaseAdmin.from('notifications').insert(notif);
                        await supabaseAdmin.from('restaurant_orders').update({ notified_arrival_30m: true }).eq('id', order.id);
                    } catch {}
                }
            }
        }

        // 2. Scan Hotel Reservations
        const { data: hotelRes } = await supabaseAdmin
            .from('hotel_reservations')
            .select('*')
            .in('status', ['reserved', 'confirmed']);

        if (hotelRes) {
            for (const res of hotelRes) {
                const scheduledTime = parseScheduledTime(res, 'hotel_reservations');
                const diffMins = Math.floor((scheduledTime.getTime() - now.getTime()) / 60000);
                const resNum = res.reservation_id || res.id.slice(0, 6);

                if (diffMins <= 52 && diffMins >= 44 && !res.notified_cancel_50m) {
                    const notif = {
                        user_id: res.user_id || 'global',
                        customer_phone: res.customer_phone,
                        type: 'cancellation_warning',
                        title: '⏱️ Rappel Annulation : Il vous reste 5 min',
                        message: `Il vous reste 5 minutes pour annuler votre réservation hôtel #${resNum} sans frais.`,
                        booking_id: res.id,
                        booking_table: 'hotel_reservations',
                        action_type: 'cancel_prompt',
                        is_read: false,
                        metadata: { reservation_id: resNum }
                    };
                    generatedNotifications.push(notif);
                    try {
                        await supabaseAdmin.from('notifications').insert(notif);
                        await supabaseAdmin.from('hotel_reservations').update({ notified_cancel_50m: true }).eq('id', res.id);
                    } catch {}
                }

                if (diffMins <= 35 && diffMins >= 15 && !res.notified_arrival_30m) {
                    const notif = {
                        user_id: res.user_id || 'global',
                        customer_phone: res.customer_phone,
                        type: 'arrival_check',
                        title: "🚗 Confirmation Check-in Hôtel (~30 min)",
                        message: `Arriverez-vous à l'heure prévue pour votre séjour hôtel #${resNum} ou signalez un retard pour conserver votre chambre ?`,
                        booking_id: res.id,
                        booking_table: 'hotel_reservations',
                        action_type: 'delay_prompt',
                        is_read: false,
                        metadata: { reservation_id: resNum }
                    };
                    generatedNotifications.push(notif);
                    try {
                        await supabaseAdmin.from('notifications').insert(notif);
                        await supabaseAdmin.from('hotel_reservations').update({ notified_arrival_30m: true }).eq('id', res.id);
                    } catch {}
                }
            }
        }

        return NextResponse.json({ success: true, count: generatedNotifications.length, generated: generatedNotifications });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
