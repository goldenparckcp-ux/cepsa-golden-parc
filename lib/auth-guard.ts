import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Verifies the staff JWT token from the request cookies.
 * Use this as a SECOND layer of defense inside each API route handler.
 * The middleware is the first layer.
 * 
 * Returns the decoded payload if valid, or a NextResponse error if not.
 */
export async function verifyStaffAuth(): Promise<
  { success: true; payload: { role: string; name: string } } |
  { success: false; response: NextResponse }
> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('staff_token')?.value;

    if (!token) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Unauthorized — no token' }, { status: 401 }),
      };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET is not configured');
      return {
        success: false,
        response: NextResponse.json({ error: 'Server configuration error' }, { status: 500 }),
      };
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    return {
      success: true,
      payload: {
        role: String(payload.role || 'unknown'),
        name: String(payload.name || 'unknown'),
      },
    };
  } catch (err) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
    };
  }
}
