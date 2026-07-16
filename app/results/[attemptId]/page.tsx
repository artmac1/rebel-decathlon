import { createServiceClient } from '@/lib/supabase'
import { ALL_EVENT_KEYS, EVENT_INSTRUCTIONS } from '@/lib/event-instructions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ─── Band labels (every 10-point range) ─────────────────────────────────────

type Band = { label: string; description: string; color: string; bgColor: string }

function getBand(total: number): Band {
  if (total >= 90) return {
    label: 'Iron Rebel',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    description: "The top of the mountain. You're not just beating your age — you're rewriting what it means.",
  }
  if (total >= 80) return {
    label: 'Rebel Legend',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: "This is elite-of-the-elite territory. Very few people ever see this number.",
  }
  if (total >= 70) return {
    label: 'Elite Warrior',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    description: "Top-tier conditioning. You're in rare company for this age bracket.",
  }
  if (total >= 60) return {
    label: 'Hardened Warrior',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: "You're outperforming most people your age — full stop.",
  }
  if (total >= 50) return {
    label: 'Seasoned Warrior',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 border-sky-200',
    description: "Solid, dependable strength across the board. You're doing this right.",
  }
  if (total >= 40) return {
    label: 'Battle-Ready Rebel',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
    description: "You're closing the gap fast. This is the stretch where real progress compounds.",
  }
  if (total >= 30) return {
    label: 'Steady Rebel',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: "Consistency is starting to show. Keep stacking days, not just workouts.",
  }
  if (total >= 20) return {
    label: 'Rising Rebel',
    color: 'text-green-500',
    bgColor: 'bg-green-50 border-green-200',
    description: "You're building ground under your feet. The next test will show it.",
  }
  if (total >= 10) return {
    label: 'Rebel in Training',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    description: "The engine's turning over. You've got a real baseline now — something to push against.",
  }
  return {
    label: 'Rebel Recruit',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 border-gray-200',
    description: "You showed up and put a number on the board. That's day one, not a verdict — every warrior starts exactly here.",
  }
}

// ─── Congratulation overlay (75+) ───────────────────────────────────────────

function getCongrats(total: number): string | null {
  if (total >= 90) return "A 90+ score is about as good as it gets on this test, at any age. You've built something most people spend a lifetime chasing and never reach. This is a number worth bragging about."
  if (total >= 80) return "An 80+ score puts you in elite company. This isn't luck or good genetics doing the talking — this is real, earned conditioning. Take a moment to be proud of this one."
  if (total >= 75) return "75 or better. Let that sink in for a second — you just crossed a line most people your age never even approach. Whatever you're doing, it's working."
  return null
}

// ─── Per-event functional framing (from spreadsheet context) ────────────────

const EVENT_WHY: Record<string, string> = {
  whr: "WHR is a stronger predictor of cardiovascular and metabolic disease risk than BMI — improving this number has direct, measurable health consequences.",
  pushup: "Upper-body pressing endurance is the foundation of the functional strength you need to push, lift, and control your own bodyweight every day.",
  squat: "Lower-body muscular endurance underpins every daily movement — getting up from the floor, climbing stairs, staying mobile for life.",
  hr: "Your step-test heart rate reflects aerobic capacity, one of the strongest single predictors of long-term health and survival.",
  situp: "Core endurance stabilizes the spine through every movement and keeps most people out of the chronic back-pain cycle.",
  sit_rise: "The ability to get up from and down to the floor without support is directly linked to longevity — research ties this score to overall lifespan.",
  balance: "Single-leg balance reflects the proprioception and neuromuscular control that prevent falls — which become the most dangerous physical risk as you age.",
  speed: "Walking speed is one of the most powerful longevity predictors in older adults — faster walkers consistently live longer, across every study.",
  arm_hang: "Grip strength and shoulder endurance are among the best objective proxies for overall functional strength and biological age.",
  flexibility: "Range of motion across these five patterns keeps your joints healthy and your movement quality high as the years compound.",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreBadge(points: number): string {
  if (points >= 8) return 'bg-green-100 text-green-700'
  if (points >= 6) return 'bg-blue-100 text-blue-700'
  if (points >= 4) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function fmtDelta(delta: number): string {
  if (delta > 0) return `+${delta}`
  if (delta < 0) return `${delta}`
  return '±0'
}

function deltaColor(delta: number): string {
  if (delta > 0) return 'text-green-600'
  if (delta < 0) return 'text-red-500'
  return 'text-gray-400'
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const supabase = createServiceClient()

  // Current attempt
  const { data: attempt } = await supabase
    .from('decathlon_attempts')
    .select('id, status, total_points, completed_at, participant_id, participants(first_name)')
    .eq('id', attemptId)
    .single()

  if (!attempt) notFound()

  // Current event results
  const { data: eventResults } = await supabase
    .from('event_results')
    .select('event_key, points_earned')
    .eq('attempt_id', attemptId)

  const resultsByKey = Object.fromEntries(
    (eventResults ?? []).map((r) => [r.event_key, Number(r.points_earned)])
  )

  // Most recent prior completed attempt for this participant
  const { data: priorAttempts } = await supabase
    .from('decathlon_attempts')
    .select('id, completed_at, total_points')
    .eq('participant_id', attempt.participant_id)
    .eq('status', 'completed')
    .neq('id', attemptId)
    .order('completed_at', { ascending: false })
    .limit(1)

  const priorAttempt = priorAttempts?.[0] ?? null

  let priorByKey: Record<string, number> = {}
  if (priorAttempt) {
    const { data: priorResults } = await supabase
      .from('event_results')
      .select('event_key, points_earned')
      .eq('attempt_id', priorAttempt.id)
    priorByKey = Object.fromEntries(
      (priorResults ?? []).map((r) => [r.event_key, Number(r.points_earned)])
    )
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const participants = attempt.participants as unknown as { first_name: string } | null
  const participantName = participants?.first_name ?? 'Participant'
  const total = Number(attempt.total_points ?? 0)
  const band = getBand(total)
  const congrats = getCongrats(total)

  const completedAt = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  const priorCompletedAt = priorAttempt?.completed_at
    ? new Date(priorAttempt.completed_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  // Build ordered score array
  type EventScore = { key: string; points: number; label: string }
  const scores: EventScore[] = ALL_EVENT_KEYS.map((key) => ({
    key,
    points: resultsByKey[key] ?? 0,
    label: EVENT_INSTRUCTIONS[key]?.displayName ?? key,
  }))

  // Focus analysis
  const minScore = Math.min(...scores.map((s) => s.points))
  const primaryFocus = scores.filter((s) => s.points === minScore)
  const secondaryFocus = scores.filter((s) => s.points <= 4 && s.points > minScore)
  const strengths = [...scores].sort((a, b) => b.points - a.points).slice(0, 2)

  // Prior total (for summary delta)
  const priorTotal = priorAttempt
    ? Number(priorAttempt.total_points ?? Object.values(priorByKey).reduce((s, p) => s + p, 0))
    : null
  const totalDelta = priorTotal !== null ? total - priorTotal : null

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">

        {/* Back link */}
        <Link
          href={`/test/${attemptId}`}
          className="text-sm text-gray-500 hover:text-gray-700 inline-block"
        >
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{participantName}&apos;s Results</h1>
          {completedAt && (
            <p className="text-gray-500 text-sm mt-1">Completed {completedAt}</p>
          )}
        </div>

        {/* ── Score card ── */}
        <div className={`border rounded-2xl px-5 py-8 text-center ${band.bgColor}`}>
          <p className="text-7xl font-bold text-gray-900 mb-1 tabular-nums">{total}</p>
          <p className="text-gray-500 text-sm mb-4">out of 100 points</p>
          <p className={`text-xl font-bold mb-2 ${band.color}`}>{band.label}</p>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
            {band.description}
          </p>
        </div>

        {/* ── Congratulation overlay ── */}
        {congrats && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-5">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
              Outstanding result
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">{congrats}</p>
          </div>
        )}

        {/* ── Focus-area analysis ── */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900">Where your next gains are hiding</h2>

          {/* Primary focus */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Primary focus{primaryFocus.length > 1 ? ' — tied' : ''}
            </p>
            <div className="space-y-3">
              {primaryFocus.map((event) => (
                <div key={event.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{event.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBadge(event.points)}`}>
                      {event.points} / 10
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{EVENT_WHY[event.key]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary focus */}
          {secondaryFocus.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Also worth attention
              </p>
              <div className="space-y-2">
                {secondaryFocus.map((event) => (
                  <div key={event.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{event.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBadge(event.points)}`}>
                      {event.points} / 10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Already winning
              </p>
              <div className="space-y-2">
                {strengths.map((event) => (
                  <div key={event.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{event.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBadge(event.points)}`}>
                      {event.points} / 10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Event breakdown ── */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Event breakdown</h2>
            {priorCompletedAt && (
              <span className="text-xs text-gray-400">vs. {priorCompletedAt}</span>
            )}
          </div>
          <ol className="space-y-3">
            {ALL_EVENT_KEYS.map((key, index) => {
              const points = resultsByKey[key]
              const hasResult = key in resultsByKey
              const label = EVENT_INSTRUCTIONS[key]?.displayName ?? key
              const prior = priorAttempt ? priorByKey[key] : undefined
              const delta = prior !== undefined && hasResult ? points - prior : null

              return (
                <li key={key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4 shrink-0 tabular-nums">{index + 1}</span>
                  <span className="text-sm text-gray-700 flex-1 min-w-0 leading-tight">{label}</span>
                  {delta !== null && (
                    <span className={`text-xs font-medium w-7 text-right tabular-nums shrink-0 ${deltaColor(delta)}`}>
                      {fmtDelta(delta)}
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${hasResult ? scoreBadge(points) : 'text-gray-300'}`}>
                    {hasResult ? `${points} / 10` : '—'}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        {/* ── Progress comparison summary ── */}
        {priorAttempt && totalDelta !== null && (
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Progress since last time</h2>
            <p className="text-xs text-gray-400 mb-4">Compared to {priorCompletedAt}</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-600">Total score</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 tabular-nums">{priorTotal} → {total}</span>
                <span className={`text-sm font-bold tabular-nums ${deltaColor(totalDelta)}`}>
                  {fmtDelta(totalDelta)} pts
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
