import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { userId, updates } = await req.json();

        if (!userId || !updates) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseKey) {
            return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, profile: data });
    } catch (err: any) {
        console.error("Profile update error:", err);
        return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
    }
}
