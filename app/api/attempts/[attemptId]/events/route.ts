import { createServiceClient } from '@/lib/supabase'
import { scoreEvent } from '@/lib/scoring'
import { ALL_EVENT_KEYS } from '@/lib/event-instructions'
import { upsertGhlContact } from '@/lib/ghl'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params
  const { eventKey, rawInput } = await request.json()

  if (!eventKey || !rawInput) {
    return Response.json({ error: 'Missing eventKey or rawInput' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Fetch attempt to get age + gender for scoring, and participant for GHL sync
  const { data: attempt, error: attemptError } = await supabase
    .from('decathlon_attempts')
    .select('age_at_test, gender, status, participants(first_name, email)')
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    return Response.json({ error: 'Attempt not found' }, { status: 404 })
  }

  // Seal completed attempts — no further submissions allowed
  if (attempt.status === 'completed') {
    return Response.json(
      { error: 'This assessment is complete. Start a new attempt to retest.' },
      { status: 403 }
    )
  }

  // Check retake limit for this event (max 2 submissions: initial + one retake)
  const { data: existingResult } = await supabase
    .from('event_results')
    .select('submission_count')
    .eq('attempt_id', attemptId)
    .eq('event_key', eventKey)
    .maybeSingle()

  if (existingResult && (existingResult.submission_count ?? 1) >= 2) {
    return Response.json(
      { error: 'Retake limit reached for this event.' },
      { status: 403 }
    )
  }

  const wasAlreadyComplete = false

  // Score the event — throws if eventKey is unknown or rawInput is malformed
  let points: number
  try {
    points = scoreEvent(
      eventKey,
      rawInput,
      attempt.age_at_test,
      attempt.gender as 'male' | 'female'
    )
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 400 })
  }

  // Save result, incrementing submission_count so retake limits are enforced
  const newSubmissionCount = existingResult ? (existingResult.submission_count ?? 1) + 1 : 1
  const { error: upsertError } = await supabase
    .from('event_results')
    .upsert(
      {
        attempt_id: attemptId,
        event_key: eventKey,
        raw_input: rawInput,
        points_earned: points,
        completed_at: new Date().toISOString(),
        submission_count: newSubmissionCount,
      },
      { onConflict: 'attempt_id,event_key' }
    )

  if (upsertError) {
    return Response.json({ error: upsertError.message }, { status: 500 })
  }

  // Fetch all completed event keys for this attempt
  const { data: doneResults } = await supabase
    .from('event_results')
    .select('event_key, points_earned')
    .eq('attempt_id', attemptId)

  const doneKeys = new Set(doneResults?.map((r) => r.event_key) ?? [])
  const completedEvents = doneKeys.size
  const isComplete = completedEvents >= 10

  if (isComplete) {
    const total = doneResults?.reduce((sum, r) => sum + Number(r.points_earned), 0) ?? 0
    const updateData: Record<string, unknown> = { status: 'completed', total_points: total }
    if (!wasAlreadyComplete) updateData.completed_at = new Date().toISOString()
    await supabase.from('decathlon_attempts').update(updateData).eq('id', attemptId)

    // Only sync GHL on first completion, not on retakes
    const participant = attempt.participants as unknown as { first_name: string; email: string } | null
    if (!wasAlreadyComplete && participant?.email) {
      await upsertGhlContact({
        firstName: participant.first_name,
        email: participant.email,
        tags: ['decathlon-completed'],
        removeTags: ['decathlon-started'],
        customFields: [{ key: 'decathlon_total_score', field_value: total }],
      })
    }
  }

  const nextEventKey = ALL_EVENT_KEYS.find((k) => !doneKeys.has(k)) ?? null

  return Response.json({ points, completedEvents, isComplete, nextEventKey })
}
