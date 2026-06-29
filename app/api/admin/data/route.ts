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

export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;



    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Missing Supabase server credentials.' },
        { status: 500 },
      );
    }

    // Fetch all necessary admin data securely
    const [
      { data: orders, error: ordersErr },
      { data: reservations, error: resErr },
      { data: poolBookings, error: poolErr },
      { data: serviceBookings, error: servErr },
      { data: users, error: usersErr },
    ] = await Promise.all([
      supabase.from("restaurant_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("hotel_reservations").select("*").order("created_at", { ascending: false }),
      supabase.from("pool_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("service_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*")
    ]);

    if (ordersErr) console.error("Orders Error:", ordersErr);
    if (resErr) console.error("Res Error:", resErr);

    return NextResponse.json({
      orders: orders || [],
      reservations: reservations || [],
      poolBookings: poolBookings || [],
      serviceBookings: serviceBookings || [],
      users: users || [],
    });

  } catch (error: any) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
