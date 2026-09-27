import Link from 'next/link'
import Image from 'next/image'

export default function UpgradeSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex justify-center mb-6">
          <Image src="/saa-logo.png" alt="Successful Aging Academy" width={280} height={112} priority />
        </div>

        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl font-bold">✓</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Lifetime access unlocked. Go back and register to start your new assessment — your progress will be tracked across every attempt.
        </p>

        <Link
          href="/start"
          className="block w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold rounded-xl px-4 py-4 text-base transition-colors"
        >
          Start new assessment →
        </Link>
      </div>
    </main>
  )
}
