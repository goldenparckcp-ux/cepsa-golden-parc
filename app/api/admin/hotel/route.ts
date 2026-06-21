import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET all hotel reservations
export async function GET() {
  try {
    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const { data, error } = await supabase
      .from("hotel_reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH a reservation (update status, room, etc.)
export async function PATCH(request: Request) {
  try {
    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing id or updates in body.' }, { status: 400 });
    }

    const { error } = await supabase
      .from("hotel_reservations")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
