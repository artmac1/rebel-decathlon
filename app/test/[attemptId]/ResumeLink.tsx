'use client'

import { useState, useEffect } from 'react'

export default function ResumeLink({ attemptId }: { attemptId: string }) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(`${window.location.origin}/test/${attemptId}`)
  }, [attemptId])

  async function handleCopy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-1">Save &amp; Come Back Later</h2>
      <p className="text-xs text-gray-500 mb-3">
        Your progress is saved automatically. Bookmark or copy this link to return and finish later.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-gray-50 truncate"
        />
        <button
          onClick={handleCopy}
          className="shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-lg px-3 py-2 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
