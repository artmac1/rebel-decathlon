import { createServerClient as ssrServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Auth-aware server client — reads/writes session cookies.
// Import this ONLY in server components and route handlers.
// Never import in client components ('use client') — next/headers is server-only.
// Always call getUser() (not getSession()) to validate the token server-side.
export async function createAuthServerClient() {
  const cookieStore = await cookies()
  return ssrServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — proxy handles the refresh
          }
        },
      },
    }
  )
}
