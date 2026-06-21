// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * JWT authentication middleware for all /admin/* routes.
 * It expects a `staff_token` cookie containing the JWT.
 * If the token is missing or invalid, the user is redirected to the admin login page.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Publicly accessible admin pages (e.g., login) should bypass auth.
  if (url.pathname.startsWith('/admin/login') || url.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check for staff_token cookie
  const token = request.cookies.get('staff_token')?.value;

  if (!token) {
    if (url.pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT secret not defined');
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    
    // Create response and set headers if needed
    const response = NextResponse.next();
    response.headers.set('x-user-role', String(payload.role));
    return response;
  } catch (err) {
    // Invalid token – redirect to login or return 401
    if (url.pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  // Apply only to admin routes and admin APIs
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
