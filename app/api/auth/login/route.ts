import { NextResponse } from 'next/server';

import { LoginSchema } from '@/lib/validations';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  try {


    // 2. Parse & Validate input
    const body = await request.json();
    const parseResult = LoginSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Format du code PIN invalide', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pin } = parseResult.data;

    const supabaseAdmin = getAdminSupabase();
    if (!supabaseAdmin) {
      console.error('CRITICAL: Supabase admin client not initialized');
    }

    // 3. Verify against Supabase using Admin Client (RLS-secure)
    let staffMember = null;
    let dbError = null;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('staff')
        .select('*')
        .eq('pin_hash', pin)
        .maybeSingle();
      staffMember = data;
      dbError = error;
    }

    // Handling legacy hardcoded fallbacks for safety if Supabase fails or not configured
    let resolvedRole = null;
    let resolvedName = null;

    if (!dbError && staffMember) {
      resolvedRole = staffMember.role;
      resolvedName = staffMember.name || 'Personnel';
    } else {
      // Fallback logic
      const pinAdmin = process.env.PIN_ADMIN || "7777";
      const pinHotel = process.env.PIN_HOTEL || "1111";
      const pinKitchen = process.env.PIN_KITCHEN || "2222";
      const pinServices = process.env.PIN_SERVICES || "3333";
      const pinCaisse = process.env.PIN_CAISSE || "4444";

      if (pin === pinAdmin) {
        resolvedRole = 'admin';
        resolvedName = 'Directeur';
      } else if (pin === pinHotel) {
        resolvedRole = 'hotel';
        resolvedName = 'Réceptionniste';
      } else if (pin === pinKitchen) {
        resolvedRole = 'kitchen';
        resolvedName = 'Chef Ahmed';
      } else if (pin === pinServices) {
        resolvedRole = 'services';
        resolvedName = 'Service Manager';
      } else if (pin === pinCaisse) {
        resolvedRole = 'caisse';
        resolvedName = 'Caisse Principale';
      }
    }

    if (!resolvedRole) {
      return NextResponse.json(
        { error: 'Code PIN incorrect ou accès refusé.' },
        { status: 401 }
      );
    }

    // 4. Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const alg = 'HS256';
    const jwt = await new SignJWT({ role: resolvedRole, name: resolvedName })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(new TextEncoder().encode(secret));

    // 5. Set Cookie & Return Success
    const response = NextResponse.json({ success: true, role: resolvedRole, name: resolvedName });
    
    // Cookie options
    response.cookies.set('staff_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch (err) {
    console.error('Login API Error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
