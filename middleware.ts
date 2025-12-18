import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Public routes that don't need authentication
    const publicRoutes = ['/', '/login', '/signup', '/auth/callback']
    const isPublicRoute = publicRoutes.includes(path)

    // Protected routes by role
    const protectedRoutes = ['/admin', '/partner', '/client']
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

    // If user is not authenticated and trying to access protected route
    // BYPASS: If dev mode is enabled, skip this check
    const isDevBypass = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'

    if (isProtectedRoute && !user && !isDevBypass) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user is authenticated and trying to access login/signup
    if ((path === '/login' || path === '/signup') && user) {
        // Get user role to redirect to appropriate dashboard
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'client'
        const redirectMap: Record<string, string> = {
            client: '/client',
            partner: '/partner',
            admin: '/admin',
        }

        return NextResponse.redirect(new URL(redirectMap[role], request.url))
    }

    // Check role-based access
    if (user && isProtectedRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'client'

        // Admin can access everything
        if (role === 'admin') {
            return response
        }

        // Check if user is trying to access wrong dashboard
        if (path.startsWith('/client') && role !== 'client') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }

        if (path.startsWith('/partner') && role !== 'partner') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }

        // Only admin can access /admin
        if (path.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/partner/:path*',
        '/client/:path*',
        '/login',
        '/signup',
    ],
}
