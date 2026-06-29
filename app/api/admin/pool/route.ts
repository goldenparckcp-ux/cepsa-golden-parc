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

const PoolBookingUpdateSchema = z.object({
  status: z.enum(['pending', 'active', 'completed', 'cancelled', 'checked_in']).optional(),
  checked_in_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// GET all pool bookings
export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;



    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const { data, error } = await supabase
      .from("pool_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH a pool booking (update status, etc.)
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

    const parsedUpdates = PoolBookingUpdateSchema.safeParse(updates);
    if (!parsedUpdates.success) {
      return NextResponse.json({ error: 'Invalid update payload', details: parsedUpdates.error.flatten().fieldErrors }, { status: 400 });
    }

    const { error } = await supabase
      .from("pool_bookings")
      .update(parsedUpdates.data)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
