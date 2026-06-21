import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { LoginSchema } from '@/lib/validations';
import { supabase } from '@/lib/supabase';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = rateLimit(ip, 5, 60000); // 5 attempts per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer dans une minute.' },
        { status: 429 }
      );
    }

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

    // 3. Verify against Supabase
    const { data: staffMember, error } = await supabase
      .from('staff')
      .select('*')
      .eq('pin_hash', pin)
      .single();

    // Handling legacy hardcoded fallbacks for safety if Supabase fails or not configured
    let resolvedRole = null;
    let resolvedName = null;

    if (!error && staffMember) {
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
      } else if ([pinHotel, pinKitchen, pinServices, pinCaisse].includes(pin)) {
        return NextResponse.json(
          { error: 'Accès Admin réservé. Veuillez utiliser le portail Staff.' },
          { status: 403 }
        );
      }
    }

    if (!resolvedRole) {
      return NextResponse.json(
        { error: 'Code PIN incorrect ou accès refusé.' },
        { status: 401 }
      );
    }

    // 4. Generate JWT
    const secret = process.env.JWT_SECRET || 'temporary_secret_for_demo_12345';
    
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
