import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
}

const supabaseAdmin = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export async function GET(request: Request) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'hotel', 'services', 'pool'
    let table = '';

    if (type === 'hotel') table = 'hotel_reservations';
    else if (type === 'services') table = 'service_bookings';
    else if (type === 'pool') table = 'pool_bookings';
    else return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    // Fetch all data for the table, sorted by created_at descending (newest first)
    // We fetch ALL because client-side filtering is easier for now given the complex UI filters
    const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PUT(request: Request) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { id, type, ...updates } = body;

    let table = '';
    if (type === 'hotel') table = 'hotel_reservations';
    else if (type === 'services') table = 'service_bookings';
    else if (type === 'pool') table = 'pool_bookings';
    else return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    const { error } = await supabaseAdmin
        .from(table)
        .update(updates)
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
