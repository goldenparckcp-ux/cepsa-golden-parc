import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        // 1. Get the current authenticated user session
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: any) {
                    cookieStore.delete({ name, ...options });
                },
            },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
        }

        const userId = user.id;

        // 2. Initialize Supabase Admin client to delete the user
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // 3. Delete user data across all tables to comply with GDPR
        await supabaseAdmin.from('service_bookings').delete().eq('user_id', userId);
        await supabaseAdmin.from('pool_bookings').delete().eq('user_id', userId);
        await supabaseAdmin.from('restaurant_orders').delete().eq('user_id', userId);
        await supabaseAdmin.from('hotel_reservations').delete().eq('user_id', userId);
        await supabaseAdmin.from('orders').delete().eq('user_id', userId);
        await supabaseAdmin.from('profiles').delete().eq('id', userId);

        // 4. Delete the user from Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error("GDPR deleteUser Auth error:", deleteError);
            return NextResponse.json({ error: 'Erreur lors de la suppression de votre compte.' }, { status: 500 });
        }

        // 5. Sign out user session
        await supabase.auth.signOut();

        return NextResponse.json({ success: true, message: 'Votre compte et toutes vos données personnelles ont été supprimés avec succès.' });

    } catch (err: any) {
        console.error("GDPR account deletion error:", err);
        return NextResponse.json({ error: err.message || 'Erreur serveur interne' }, { status: 500 });
    }
}
