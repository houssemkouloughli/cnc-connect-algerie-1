import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user to check role
      const { data: { user } } = await supabase.auth.getUser()
      
      // Create profile if doesn't exist
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email,
                email: user.email,
                role: 'user',
                created_at: new Date().toISOString(),
              }
            ])
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const proto = request.headers.get('x-forwarded-proto')
      const host = forwardedHost || request.nextUrl.host
      const protocol = proto || 'https'
      
      return NextResponse.redirect(`${protocol}://${host}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${request.nextUrl.origin}/auth/auth-code-error`)
}
