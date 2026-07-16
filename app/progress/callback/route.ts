import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Supabase redirects here after the user clicks the magic-link email.
// We exchange the PKCE code for a session and redirect to /progress.
//
// IMPORTANT: Do NOT import or call createAuthBrowserClient anywhere in this
// file. The SSR browser client auto-consumes the ?code= param before this
// route handler can exchange it, breaking the auth flow.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}/progress`)
    }
  }

  // No code param or exchange failed — send back to /progress (shows email form)
  return NextResponse.redirect(`${origin}/progress`)
}
