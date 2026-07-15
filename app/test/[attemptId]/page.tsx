import { Suspense } from 'react'
import { createServiceClient } from '@/lib/supabase'
import { ALL_EVENT_KEYS, EVENT_INSTRUCTIONS } from '@/lib/event-instructions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SavedBanner from './SavedBanner'
import ResumeLink from './ResumeLink'

export default async function AttemptDashboard({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const supabase = createServiceClient()

  const { data: attempt } = await supabase
    .from('decathlon_attempts')
    .select('id, status, total_points, participants(first_name)')
    .eq('id', attemptId)
    .single()

  if (!attempt) notFound()

  const { data: eventResults } = await supabase
    .from('event_results')
    .select('event_key, points_earned')
    .eq('attempt_id', attemptId)

  const resultsByKey = Object.fromEntries(
    (eventResults ?? []).map((r) => [r.event_key, r.points_earned])
  )

  const participants = attempt.participants as unknown as { first_name: string } | null
  const participantName = participants?.first_name ?? 'Participant'
  const completedCount = Object.keys(resultsByKey).length
  const isComplete = attempt.status === 'completed'

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <Suspense fallback={null}>
          <SavedBanner />
        </Suspense>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{participantName}&apos;s Assessment</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isComplete
              ? `Complete — ${attempt.total_points} / 100 points`
              : `${completedCount} of 10 events done`}
          </p>
        </div>

        <ol className="space-y-2">
          {ALL_EVENT_KEYS.map((key, index) => {
            const done = key in resultsByKey
            const points = resultsByKey[key]
            const label = EVENT_INSTRUCTIONS[key]?.displayName ?? key

            return (
              <li key={key}>
                {done ? (
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-green-500 text-lg">✓</span>
                      <span className="text-sm font-medium text-gray-700">
                        {index + 1}. {label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{points} pts</span>
                  </div>
                ) : (
                  <Link
                    href={`/test/${attemptId}/${key}`}
                    className="flex items-center justify-between bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl px-4 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 text-lg">○</span>
                      <span className="text-sm font-medium text-gray-700">
                        {index + 1}. {label}
                      </span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Start →</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ol>

        {isComplete && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl px-4 py-4 text-center">
            <p className="text-green-800 font-semibold">Assessment complete!</p>
            <p className="text-green-700 text-sm mt-1">
              Total score: <strong>{attempt.total_points} / 100</strong>
            </p>
            <Link
              href={`/results/${attemptId}`}
              className="mt-3 inline-block text-sm text-green-700 underline"
            >
              View full results
            </Link>
          </div>
        )}

        {!isComplete && <ResumeLink attemptId={attemptId} />}
      </div>
    </main>
  )
}
