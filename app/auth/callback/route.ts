import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as 'signup' | 'magiclink' | 'recovery' | 'invite' | 'email' | null
    const next = searchParams.get('next') ?? '/profile'

    // Securely determine the correct public URL for production redirection on Vercel
    const host = request.headers.get('host') || origin.replace(/^https?:\/\//, '')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    const absoluteOrigin = `${proto}://${host}`

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.delete({ name, ...options })
                },
            },
        }
    )

    // Handle PKCE code exchange flow
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const targetUrl = new URL(next, absoluteOrigin)
            targetUrl.searchParams.set('session_loaded', '1')
            return NextResponse.redirect(targetUrl.toString())
        }
        const errorUrl = new URL('/auth/auth-code-error', absoluteOrigin)
        errorUrl.searchParams.set('error', error.message || 'unknown_error')
        if (error.status) errorUrl.searchParams.set('status', String(error.status))
        return NextResponse.redirect(errorUrl.toString())
    }

    // Handle email confirmation token_hash flow (magic link / signup confirmation)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (!error) {
            const targetUrl = new URL(next, absoluteOrigin)
            targetUrl.searchParams.set('session_loaded', '1')
            return NextResponse.redirect(targetUrl.toString())
        }
        const errorUrl = new URL('/auth/auth-code-error', absoluteOrigin)
        errorUrl.searchParams.set('error', error.message || 'token_verification_failed')
        return NextResponse.redirect(errorUrl.toString())
    }

    // No code or token — redirect to error
    return NextResponse.redirect(`${absoluteOrigin}/auth/auth-code-error?error=no_code_provided`)
}
