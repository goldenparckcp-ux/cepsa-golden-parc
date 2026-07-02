// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { rateLimit } from '@/lib/rate-limit';

const ROUTE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth/login': { limit: 5, windowMs: 60000 },
  '/api/checkout': { limit: 10, windowMs: 60000 },
  '/api/checkout/confirm': { limit: 10, windowMs: 60000 },
  '/api/orders': { limit: 5, windowMs: 60000 },
  '/api/bookings/cancel': { limit: 5, windowMs: 60000 },
  '/api/chat': { limit: 10, windowMs: 60000 },
  '/api/admin-insights': { limit: 5, windowMs: 60000 },
  '/api/webhooks/paypal': { limit: 20, windowMs: 60000 },
};

/**
 * JWT authentication and global Edge-level rate limiting middleware.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Rate Limiting for all API routes at the Edge
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Find matching limit configuration or set defaults
    let config = ROUTE_LIMITS[pathname];
    if (!config) {
      if (pathname.startsWith('/api/admin/')) {
        config = { limit: 30, windowMs: 60000 };
      } else {
        config = { limit: 60, windowMs: 60000 };
      }
    }

    const rl = await rateLimit(ip, config.limit, config.windowMs);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }
  }

  // 2. Publicly accessible routes that bypass auth
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/checkout') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/temp-migrate')
  ) {
    return NextResponse.next();
  }

  // 3. Check for staff_token cookie
  const token = request.cookies.get('staff_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
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
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
