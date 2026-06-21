// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * JWT authentication middleware for all /admin/* routes.
 * It expects an `Authorization: Bearer <token>` header.
 * If the token is missing or invalid, the user is redirected to the admin login page.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Publicly accessible admin pages (e.g., login) should bypass auth.
  if (url.pathname.startsWith('/admin/login') || url.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT secret not defined');
    const payload = jwt.verify(token, secret) as { role: string };
    // expose role downstream if needed
    request.headers.set('x-user-role', payload.role);
    return NextResponse.next();
  } catch (err) {
    // Invalid token – redirect to login
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  // Apply only to admin routes
  matcher: '/admin/:path*',
};
