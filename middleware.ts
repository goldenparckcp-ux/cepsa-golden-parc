// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * JWT authentication middleware for all /admin/* and protected API routes.
 * Expects a `staff_token` HttpOnly cookie containing the JWT.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Publicly accessible routes that bypass auth
  if (
    url.pathname === '/login' ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/webhooks')
  ) {
    return NextResponse.next();
  }

  // Check for staff_token cookie
  const token = request.cookies.get('staff_token')?.value;

  if (!token) {
    if (url.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured in environment');
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    
    const response = NextResponse.next();
    response.headers.set('x-user-role', String(payload.role));
    response.headers.set('x-user-name', String(payload.name || ''));
    return response;
  } catch (err) {
    // Invalid/expired token
    if (url.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/admin-insights/:path*',
    '/api/bookings/:path*',
  ],
};
