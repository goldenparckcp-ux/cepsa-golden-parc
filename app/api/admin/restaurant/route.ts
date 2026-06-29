import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyStaffAuth } from '@/lib/auth-guard';


export const dynamic = 'force-dynamic';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

import { z } from 'zod';

const RestaurantOrderUpdateSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).optional(),
  deposit_paid: z.boolean().optional(),
  deposit_amount: z.number().optional(),
  updated_at: z.string().optional(),
  completed_at: z.string().optional(),
});

// GET all restaurant orders
export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;



    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("order_number");

    let query = supabase.from("restaurant_orders").select("*");

    if (orderNumber) {
      query = query.eq("order_number", orderNumber);
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH a restaurant order (update status, etc.)
export async function PATCH(request: Request) {
  try {
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;



    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing id or updates in body.' }, { status: 400 });
    }

    const parsedUpdates = RestaurantOrderUpdateSchema.safeParse(updates);
    if (!parsedUpdates.success) {
      return NextResponse.json({ error: 'Invalid update payload', details: parsedUpdates.error.flatten().fieldErrors }, { status: 400 });
    }

    const { error } = await supabase
      .from("restaurant_orders")
      .update(parsedUpdates.data)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
