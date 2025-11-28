import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            request.cookies.set(name, value)
                            response.cookies.set(name, value, options)
                        })
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Get user role to determine redirect
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            const role = profile?.role || 'client'
            const redirectMap: Record<string, string> = {
                client: '/client/dashboard',
                partner: '/partner/dashboard',
                admin: '/admin/dashboard',
            }

            const redirectUrl = redirectMap[role] || '/client/dashboard'
            return NextResponse.redirect(`${origin}${redirectUrl}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
