import { createServiceClient } from '@/lib/supabase'
import { upsertGhlContact } from '@/lib/ghl'

export async function POST(request: Request) {
  const body = await request.json()
  const { first_name, email, age, gender } = body

  if (!first_name || !email || !age || !gender) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (gender !== 'male' && gender !== 'female') {
    return Response.json({ error: 'gender must be "male" or "female"' }, { status: 400 })
  }
  if (typeof age !== 'number' || age < 18 || age > 120) {
    return Response.json({ error: 'age must be a number between 18 and 120' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Upsert participant by email — update name/age/gender if returning participant
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .upsert(
      { first_name, email, gender, age },
      { onConflict: 'email' }
    )
    .select('id, has_paid')
    .single()

  if (participantError) {
    return Response.json({ error: participantError.message }, { status: 500 })
  }

  // Resume an existing in_progress attempt rather than creating a duplicate
  const { data: existingAttempt } = await supabase
    .from('decathlon_attempts')
    .select('id')
    .eq('participant_id', participant.id)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (existingAttempt) {
    const resumeUrl = `${new URL(request.url).origin}/test/${existingAttempt.id}`
    await upsertGhlContact({
      firstName: first_name,
      email,
      tags: ['decathlon-started'],
      customFields: [{ key: 'decathlon_resume_url', field_value: resumeUrl }],
    })
    return Response.json({ participantId: participant.id, attemptId: existingAttempt.id })
  }

  // No in_progress attempt — check if they've completed one before (requires payment to retest)
  const { data: completedAttempt } = await supabase
    .from('decathlon_attempts')
    .select('id')
    .eq('participant_id', participant.id)
    .eq('status', 'completed')
    .limit(1)
    .maybeSingle()

  if (completedAttempt && !participant.has_paid) {
    return Response.json(
      { requiresPayment: true, participantId: participant.id },
      { status: 402 }
    )
  }

  // No completed attempt, or participant has paid — create new attempt
  const { data: newAttempt, error: attemptError } = await supabase
    .from('decathlon_attempts')
    .insert({ participant_id: participant.id, age_at_test: age, gender })
    .select('id')
    .single()

  if (attemptError) {
    return Response.json({ error: attemptError.message }, { status: 500 })
  }

  const resumeUrl = `${new URL(request.url).origin}/test/${newAttempt.id}`
  await upsertGhlContact({
    firstName: first_name,
    email,
    tags: ['decathlon-started'],
    customFields: [{ key: 'decathlon_resume_url', field_value: resumeUrl }],
  })

  return Response.json({ participantId: participant.id, attemptId: newAttempt.id })
}
