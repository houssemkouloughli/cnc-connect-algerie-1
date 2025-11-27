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

    const path = request.nextUrl.pathname;

    // Simple protection: check if user is authenticated for protected routes
    // Role-based checks are handled in the respective layout files for better performance
    const protectedRoutes = ['/admin', '/partner', '/dashboard', '/client'];
    const isProtected = protectedRoutes.some(route => path.startsWith(route));

    if (isProtected && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect authenticated users from login/signup to dashboard
    // Role-specific redirects are handled in the login page after authentication
    if ((path === '/login' || path === '/signup') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/partner/:path*',
        '/dashboard/:path*',
        '/client/:path*',
        '/login',
        '/signup',
    ],
};

