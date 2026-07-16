import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as ssrBrowserClient } from '@supabase/ssr'

// ── Existing clients (used by API routes and non-auth client components) ─────

// Plain browser client — anon key, no cookie handling
// Used by EventForm and other non-auth client components
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Service role client — bypasses RLS, server-side API routes only
// Never import this in client components
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── SSR-aware browser client for /progress auth flow ─────────────────────────
// Safe to import in client components — no next/headers dependency.
// For the server-side counterpart (createAuthServerClient), import from
// @/lib/supabase-server (server components and route handlers only).

// Auth-aware browser client — cookie-backed, for client components in /progress
export function createAuthBrowserClient() {
  return ssrBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
