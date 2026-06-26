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

const ALLOWED_TABLES = [
  "restaurant_items",
  "restaurant_categories",
  "lubricant_items",
  "fuel_prices",
  "qr_locations",
  "service_bookings",
  "profiles"
];

export async function POST(request: Request) {
  try {
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rl = rateLimit(ip, 30, 60000);
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const body = await request.json();
    const { action, table, payload, match, order } = body;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed for generic API access' }, { status: 403 });
    }

    let query: any = supabase.from(table);

    switch (action) {
      case 'select':
        query = query.select(payload?.columns || '*');
        if (match) {
          query = query.match(match);
        }
        if (order) {
           query = query.order(order.column, { ascending: order.ascending });
        }
        if (body.single) {
           query = query.maybeSingle();
        }
        break;
      case 'insert':
        query = query.insert(payload);
        if (payload?.select) query = query.select();
        break;
      case 'update':
        if (!match) throw new Error("Match criteria required for update");
        query = query.update(payload).match(match);
        break;
      case 'delete':
        if (!match) throw new Error("Match criteria required for delete");
        query = query.delete().match(match);
        break;
      default:
        throw new Error("Invalid action");
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
