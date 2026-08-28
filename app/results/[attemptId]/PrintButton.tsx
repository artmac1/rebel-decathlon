'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      Print results
    </button>
  )
}
