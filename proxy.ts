import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Refresh the Supabase session on every /progress request so the auth
// cookie stays valid. Must use the low-level createServerClient here
// (not our createAuthServerClient helper) because we need access to
// both request and response cookies at the same time.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies into both the forwarded request and the response
          // so server components and the browser both see the refreshed token.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Calling getUser() triggers the token refresh — never use getSession() here.
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: ['/progress/:path*'],
}
