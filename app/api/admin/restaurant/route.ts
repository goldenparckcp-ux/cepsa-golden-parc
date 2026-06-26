import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyStaffAuth } from '@/lib/auth-guard';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET all restaurant orders
export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rl = rateLimit(ip, 30, 60000);
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const { data, error } = await supabase
      .from("restaurant_orders")
      .select("*")
      .order("created_at", { ascending: false });

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

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rl = rateLimit(ip, 30, 60000);
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing id or updates in body.' }, { status: 400 });
    }

    const { error } = await supabase
      .from("restaurant_orders")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
