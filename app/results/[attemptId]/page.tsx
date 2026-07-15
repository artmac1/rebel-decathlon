import { createServiceClient } from '@/lib/supabase'
import { ALL_EVENT_KEYS, EVENT_INSTRUCTIONS } from '@/lib/event-instructions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function getTier(total: number): { label: string; color: string } {
  if (total >= 90) return { label: 'Excellent', color: 'text-green-600' }
  if (total >= 75) return { label: 'Good', color: 'text-blue-600' }
  if (total >= 60) return { label: 'Average', color: 'text-amber-600' }
  if (total >= 40) return { label: 'Fair', color: 'text-orange-600' }
  return { label: 'Poor', color: 'text-red-600' }
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const supabase = createServiceClient()

  const { data: attempt } = await supabase
    .from('decathlon_attempts')
    .select('id, status, total_points, completed_at, participants(first_name)')
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
  const total = attempt.total_points ?? 0
  const tier = getTier(total)
  const completedAt = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <Link
          href={`/test/${attemptId}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
        >
          ← Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{participantName}&apos;s Results</h1>
          {completedAt && (
            <p className="text-gray-500 text-sm mt-1">Completed {completedAt}</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-8 mb-6 text-center">
          <p className="text-6xl font-bold text-gray-900 mb-1">{total}</p>
          <p className="text-gray-400 text-sm mb-3">out of 100 points</p>
          <span className={`text-sm font-semibold ${tier.color}`}>{tier.label}</span>
        </div>

        <ol className="space-y-2">
          {ALL_EVENT_KEYS.map((key, index) => {
            const points = resultsByKey[key]
            const label = EVENT_INSTRUCTIONS[key]?.displayName ?? key
            const hasResult = key in resultsByKey

            return (
              <li key={key}>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}. {label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {hasResult ? `${points} pts` : '—'}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </main>
  )
}
