'use client'

import { useState } from 'react'
import { sendResultsEmail, type EmailPayload } from './actions'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function EmailResultsForm({ payload }: { payload: EmailPayload }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const result = await sendResultsEmail(email, payload)

    if ('success' in result) {
      setStatus('success')
    } else {
      setErrorMessage(result.error)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
        <p className="text-sm font-semibold text-gray-900 mb-1">Check your inbox!</p>
        <p className="text-sm text-gray-500">Your results are on their way to {email}.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Get a copy of your results</h2>
      <p className="text-xs text-gray-500 mb-4">
        We&apos;ll email you your score and full event breakdown.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'sending'}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'sending' || !email}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {status === 'sending' ? 'Sending…' : 'Send my results'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-2">{errorMessage}</p>
      )}
    </div>
  )
}
