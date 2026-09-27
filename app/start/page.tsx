'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function StartPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const form = event.currentTarget
    const data = {
      first_name: (form.elements.namedItem('first_name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      age: parseInt((form.elements.namedItem('age') as HTMLInputElement).value, 10),
      gender: (form.elements.namedItem('gender') as HTMLSelectElement).value,
    }

    let response: Response
    let result: { error?: string; attemptId?: string; requiresPayment?: boolean; participantId?: string }
    try {
      response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      result = await response.json()
    } catch (err) {
      setError(`Network or server error: ${err}`)
      setSubmitting(false)
      return
    }

    // Returning user who hasn't paid — redirect to upgrade page
    if (response.status === 402 && result.requiresPayment) {
      router.push(`/upgrade?pid=${result.participantId}`)
      return
    }

    if (!response.ok) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    router.push(`/test/${result.attemptId!}/welcome`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center mb-6">
          <Image src="/saa-logo.png" alt="Successful Aging Academy" width={280} height={112} priority />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Rebel Decathlon</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Enter your details to begin your 10-event fitness assessment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              autoComplete="given-name"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              inputMode="numeric"
              required
              min={18}
              max={120}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-4 text-base transition-colors"
          >
            {submitting ? 'Starting…' : 'Start Assessment'}
          </button>
        </form>
      </div>
    </main>
  )
}
