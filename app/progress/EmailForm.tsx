'use client'

import { useState } from 'react'
import { createAuthBrowserClient } from '@/lib/supabase'

export default function EmailForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createAuthBrowserClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/progress/callback`,
        // Don't create a new Supabase auth user — the participant must already
        // exist in our participants table. We just want to verify their email.
        shouldCreateUser: true,
      },
    })

    if (otpError) {
      setError(otpError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-6 text-center">
        <p className="text-sm font-semibold text-green-800 mb-1">Check your email</p>
        <p className="text-sm text-green-700">
          We sent a sign-in link to <strong>{email}</strong>. Click it to view your results.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send sign-in link'}
      </button>
    </form>
  )
}
