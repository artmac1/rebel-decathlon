import { createServiceClient } from '@/lib/supabase'
import { ALL_EVENT_KEYS, EVENT_INSTRUCTIONS } from '@/lib/event-instructions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EventForm from './EventForm'

export default async function EventPage({
  params,
}: {
  params: Promise<{ attemptId: string; eventKey: string }>
}) {
  const { attemptId, eventKey } = await params

  // Validate eventKey before hitting the database
  if (!(ALL_EVENT_KEYS as readonly string[]).includes(eventKey)) notFound()

  const supabase = createServiceClient()

  const { data: attempt } = await supabase
    .from('decathlon_attempts')
    .select('status')
    .eq('id', attemptId)
    .single()

  if (!attempt) notFound()

  const instruction = EVENT_INSTRUCTIONS[eventKey]
  const eventIndex = ALL_EVENT_KEYS.indexOf(eventKey as typeof ALL_EVENT_KEYS[number])

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
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Event {eventIndex + 1} of {ALL_EVENT_KEYS.length}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{instruction.displayName}</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Instructions</h2>
          <ol className="space-y-2">
            {instruction.instructions.map((step, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-400 font-medium shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {instruction.note && (
            <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              {instruction.note}
            </p>
          )}
          {instruction.videoUrl && (
            <a
              href={instruction.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-blue-600 underline"
            >
              Watch demonstration video
            </a>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Enter your result</h2>
          <EventForm attemptId={attemptId} eventKey={eventKey} />
        </div>
      </div>
    </main>
  )
}
