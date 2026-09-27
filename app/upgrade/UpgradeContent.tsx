'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function UpgradeContent() {
  const searchParams = useSearchParams()
  const participantId = searchParams.get('pid')
  const cancelled = searchParams.get('cancelled')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    if (!participantId) return
    setLoading(true)
    setError(null)

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId }),
    })

    const result = await response.json()

    if (!response.ok || !result.url) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    window.location.href = result.url
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center mb-6">
          <Image src="/saa-logo.png" alt="Successful Aging Academy" width={280} height={112} priority />
        </div>

        {cancelled && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-sm text-amber-800">Payment was cancelled. You can try again whenever you&apos;re ready.</p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unlock Lifetime Access</h1>
        <p className="text-gray-500 text-sm mb-6">
          You&apos;ve completed your free assessment. To retest the full series and track your progress over time, upgrade to lifetime access.
        </p>

        <ul className="space-y-2 mb-8">
          {[
            'Unlimited full retests — forever',
            'Track your progress across every attempt',
            'See exactly where you improve over time',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5 shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || !participantId}
          className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-4 text-base transition-colors"
        >
          {loading ? 'Redirecting to checkout…' : 'Get lifetime access — $19'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">One-time payment. No subscription.</p>
      </div>
    </main>
  )
}
