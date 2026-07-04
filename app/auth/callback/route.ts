import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/profile'

    // Securely determine the correct public URL for production redirection on Vercel
    const host = request.headers.get('host') || origin.replace(/^https?:\/\//, '')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    const absoluteOrigin = `${proto}://${host}`

    if (code) {
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
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Append a dynamic query param to force refresh or session detection on redirect
            const targetUrl = new URL(next, absoluteOrigin)
            targetUrl.searchParams.set('session_loaded', '1')
            return NextResponse.redirect(targetUrl.toString())
        }
        // Pass error details to error page
        const errorUrl = new URL('/auth/auth-code-error', absoluteOrigin)
        errorUrl.searchParams.set('error', error.message || 'unknown_error')
        if (error.status) errorUrl.searchParams.set('status', String(error.status))
        return NextResponse.redirect(errorUrl.toString())
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${absoluteOrigin}/auth/auth-code-error?error=no_code_provided`)
}
