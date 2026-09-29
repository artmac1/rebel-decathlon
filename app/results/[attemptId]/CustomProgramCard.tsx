'use client'

import { useState } from 'react'
import type { Program } from '@/lib/programs'

type WeakEvent = {
  key: string
  label: string
  points: number
}

type Props = {
  program: Program
  bottom3: WeakEvent[]
  attemptId: string
  participantId: string
}

export default function CustomProgramCard({ program, bottom3, attemptId, participantId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          participantId,
          weakEvents: bottom3.map((e) => e.key).join(','),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError('Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        6-Week Custom Program
      </p>
      <h2 className="text-base font-bold text-gray-900 mb-1">{program.name}</h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{program.description}</p>

      {/* The 3 weak events this program targets */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 mb-2">Your program targets:</p>
        {bottom3.map((event) => (
          <div key={event.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{event.label}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 tabular-nums">
              {event.points} / 10
            </span>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3">{error}</p>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 px-4 py-4 text-base font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Redirecting…' : 'Get my program — $47'}
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">
        One-time payment · Delivered to your email within 24 hours
      </p>
    </div>
  )
}
