import { createAuthServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import EmailForm from './EmailForm'
import SignOut from './SignOut'

function scoreBadge(total: number): string {
  if (total >= 80) return 'bg-purple-100 text-purple-700'
  if (total >= 60) return 'bg-blue-100 text-blue-700'
  if (total >= 40) return 'bg-teal-100 text-teal-700'
  return 'bg-gray-100 text-gray-600'
}

function bandLabel(total: number): string {
  if (total >= 90) return 'Iron Rebel'
  if (total >= 80) return 'Rebel Legend'
  if (total >= 70) return 'Elite Warrior'
  if (total >= 60) return 'Hardened Warrior'
  if (total >= 50) return 'Seasoned Warrior'
  if (total >= 40) return 'Battle-Ready Rebel'
  if (total >= 30) return 'Steady Rebel'
  if (total >= 20) return 'Rising Rebel'
  if (total >= 10) return 'Rebel in Training'
  return 'Rebel Recruit'
}

export default async function ProgressPage() {
  // Validate the session server-side — getUser() hits Supabase to verify
  // the token rather than trusting the cookie value alone.
  const authClient = await createAuthServerClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user?.email) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-5">
          <div className="flex justify-center">
            <Image src="/saa-icon.png" alt="Successful Aging Academy" width={48} height={48} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your progress</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email to see your test history.
            </p>
          </div>
          <EmailForm />
        </div>
      </main>
    )
  }

  // Use service client to read data — the user is already verified above.
  // RLS SELECT policies also allow the authenticated user to read their own
  // rows directly, but the service client keeps the data-fetch pattern
  // consistent with the rest of the app.
  const supabase = createServiceClient()

  const { data: participant } = await supabase
    .from('participants')
    .select('id, first_name')
    .eq('email', user.email)
    .single()

  const attempts =
    participant
      ? (
          await supabase
            .from('decathlon_attempts')
            .select('id, total_points, completed_at')
            .eq('participant_id', participant.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
        ).data ?? []
      : []

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Image src="/saa-icon.png" alt="Successful Aging Academy" width={40} height={40} className="mb-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              {participant ? `${participant.first_name}'s progress` : 'Your progress'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
          </div>
          <SignOut />
        </div>

        {/* No results yet */}
        {attempts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-8 text-center">
            <p className="text-gray-500 text-sm">
              {participant
                ? 'No completed tests yet. Finish a test to see your results here.'
                : "We don't have any results for this email address."}
            </p>
            <Link
              href="/start"
              className="inline-block mt-4 text-sm font-semibold text-gray-900 underline"
            >
              Take the Rebel Decathlon
            </Link>
          </div>
        )}

        {/* Attempt history */}
        {attempts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {attempts.map((attempt, index) => {
              const total = Number(attempt.total_points ?? 0)
              const date = attempt.completed_at
                ? new Date(attempt.completed_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Unknown date'

              const prevTotal =
                index < attempts.length - 1
                  ? Number(attempts[index + 1].total_points ?? 0)
                  : null
              const delta = prevTotal !== null ? total - prevTotal : null

              return (
                <Link
                  key={attempt.id}
                  href={`/results/${attempt.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{date}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{bandLabel(total)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {delta !== null && (
                      <span
                        className={`text-xs font-medium tabular-nums ${
                          delta > 0
                            ? 'text-green-600'
                            : delta < 0
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta === 0 ? '±0' : delta}
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${scoreBadge(total)}`}
                    >
                      {total} / 100
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
