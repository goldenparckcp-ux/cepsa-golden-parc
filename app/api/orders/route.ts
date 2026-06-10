import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type OrderItem = {
  name: string;
  quantity: number;
  price?: number;
  totalPrice?: number;
  image?: string;
  customizations?: Record<string, unknown>;
  prep_time?: string;
  time_slot?: string;
  date?: string;
};

type CreateOrderBody = {
  customer_phone: string;
  total: number;
  items: OrderItem[];
  notes?: string;
  status: string;
  service_type: 'dine_in' | 'pre_order';
  table_number?: string;
  arrival_time?: string;
};

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
    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Missing Supabase server credentials (SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 500 },
      );
    }

    const body = (await req.json()) as Partial<CreateOrderBody>;
    if (!body.customer_phone || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const notes = body.notes || '';
    const status = body.status || 'pending';
    const serviceType = body.service_type || 'pre_order';

    // 1) Separate items by type (simple heuristics, same as client logic)
    const foodItems: OrderItem[] = [];
    const serviceItems: OrderItem[] = [];
    const hotelItems: OrderItem[] = [];
    const poolItems: OrderItem[] = [];

    let foodTotal = 0;

    for (const item of body.items) {
      const name = String(item.name || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const qty = item.quantity || 1;

      if (name.includes('lavage') || name.includes('wash') || name.includes('vapeur')) {
        serviceItems.push(item);
        continue;
      }
      if (name.includes('hotel') || name.includes('chambre') || name.includes('room') || name.includes('nuit')) {
        hotelItems.push(item);
        continue;
      }
      if (name.includes('pool') || name.includes('piscine') || name.includes('baignade')) {
        poolItems.push(item);
        continue;
      }

      foodTotal += (item.price ?? item.totalPrice ?? 0) * qty;
      foodItems.push(item);
    }

    let mainOrderId: string | null = null;

    // 2) Food order (orders + order_items)
    if (foodItems.length > 0) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            created_at: new Date().toISOString(),
            status,
            total_amount: foodTotal,
            customer_phone: body.customer_phone,
            notes,
            service_type: serviceType,
            table_number: body.table_number,
            arrival_time: body.arrival_time,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;
      mainOrderId = order.id;

      const orderItems = foodItems.map((it) => ({
        order_id: order.id,
        item_name: it.name,
        quantity: it.quantity || 1,
        price: it.price ?? it.totalPrice ?? 0,
        image_url: it.image,
        customizations: it.customizations || {},
        prep_time: it.prep_time || '15 min',
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    }

    // 3) Service bookings (lavage)
    for (const it of serviceItems) {
      const qty = it.quantity || 1;
      for (let i = 0; i < qty; i++) {
        const { error } = await supabase.from('service_bookings').insert({
          service_type: 'lavage',
          service_name: it.name,
          customer_phone: body.customer_phone,
          vehicle_info: 'Non spécifié (Via Panier)',
          scheduled_at: it.date || new Date().toISOString(),
          time_slot: it.time_slot || null,
          status: 'scheduled',
          notes: notes ? `Panier: ${notes}` : undefined,
          total_price: it.price ?? it.totalPrice ?? 0,
        });
        if (error) throw error;
      }
    }

    // 4) Pool bookings (minimal)
    for (const it of poolItems) {
      const { error } = await supabase.from('pool_bookings').insert({
        customer_phone: body.customer_phone,
        total_price: it.price ?? it.totalPrice ?? 0,
        status: 'active',
      });
      if (error) throw error;
    }

    // 5) Hotel reservations (minimal)
    for (const it of hotelItems) {
      const { error } = await supabase.from('hotel_reservations').insert({
        customer_phone: body.customer_phone,
        total_price: it.price ?? it.totalPrice ?? 0,
        room_type: it.name || 'standard',
        status: 'pending',
      });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true, order_id: mainOrderId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

