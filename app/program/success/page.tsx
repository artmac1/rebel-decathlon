import Link from 'next/link'
import Image from 'next/image'

export default function ProgramSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex justify-center mb-6">
          <Image src="/saa-logo.png" alt="Successful Aging Academy" width={240} height={96} priority />
        </div>

        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl font-bold">✓</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re in!</h1>
        <p className="text-gray-500 text-sm mb-2">
          Your 6-week custom program is confirmed.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          We&apos;ll review your results and deliver your program to your email within 24 hours.
        </p>

        <Link
          href="/progress"
          className="block w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold rounded-xl px-4 py-4 text-base transition-colors"
        >
          View your results history →
        </Link>
      </div>
    </main>
  )
}
