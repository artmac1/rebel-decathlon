'use client'

import { useRouter } from 'next/navigation'
import { createAuthBrowserClient } from '@/lib/supabase'

export default function SignOut() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createAuthBrowserClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-gray-400 hover:text-gray-600 underline"
    >
      Sign out
    </button>
  )
}
