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

  // 0. Maintenance Mode Redirection
  let maintenanceConfig = {
    global: false,
    restaurant: false,
    pool: false,
    lubrifiants: false,
    hotel: false,
    admin: false,
    staff: false
  };
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    try {
      const res = await fetch(`${redisUrl}/get/site_maintenance_config`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
            try { maintenanceConfig = { ...maintenanceConfig, ...JSON.parse(data.result) }; } catch(e){}
        } else {
            // Migration fallback
            const oldRes = await fetch(`${redisUrl}/get/site_maintenance_mode`, { headers: { Authorization: `Bearer ${redisToken}` }});
            if (oldRes.ok) {
                const oldData = await oldRes.json();
                if (oldData.result === 'true') maintenanceConfig.global = true;
            }
        }
      }
    } catch (e) {
      console.warn("Failed to check maintenance mode in Redis", e);
    }
  }
  
  const isBypass = 
    pathname === '/maintenance' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/dev-control') ||
    pathname.startsWith('/api/dev-control') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico');
      
  if (!isBypass) {
    let block = false;
    if (maintenanceConfig.global) block = true;
    else if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && maintenanceConfig.admin) block = true;
    else if (pathname.startsWith('/staff') && maintenanceConfig.staff) block = true;
    else if (maintenanceConfig.client && !pathname.startsWith('/admin') && !pathname.startsWith('/staff')) block = true;

    if (block) {
      url.pathname = '/maintenance';
      return NextResponse.redirect(url);
    }
  }

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
    (!pathname.startsWith('/admin') && !pathname.startsWith('/api/') && !pathname.startsWith('/staff')) || 
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/checkout') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/temp-migrate') ||
    pathname.startsWith('/api/dev-control')
  ) {
    return NextResponse.next();
  }

  // 3. Check for staff_token cookie
  const token = request.cookies.get('staff_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // If they are exactly on /admin or /staff, allow them to see the client-side login form
    if (pathname === '/admin' || pathname === '/staff') {
      return NextResponse.next();
    }
    
    // Otherwise, redirect to the respective login page
    url.pathname = pathname.startsWith('/staff') ? '/staff' : '/admin';
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
    
    // If they are exactly on /admin or /staff, clear cookie and show login form
    if (pathname === '/admin' || pathname === '/staff') {
      const response = NextResponse.next();
      response.cookies.delete('staff_token');
      return response;
    }
    
    url.pathname = pathname.startsWith('/staff') ? '/staff' : '/admin';
    const response = NextResponse.redirect(url);
    response.cookies.delete('staff_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, icon.png, apple-icon.png (icon files)
     * - vercel.svg, next.svg, globe.svg (vector files)
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|icon.png|apple-icon.png|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg).*)',
  ],
};
