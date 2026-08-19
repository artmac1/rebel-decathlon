import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Art: replace 'TODO' with your Vimeo intro video ID after uploading
// e.g. if your Vimeo URL is https://vimeo.com/123456789, set this to '123456789'
const INTRO_VIMEO_ID = 'TODO'

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const supabase = createServiceClient()

  const { data: attempt } = await supabase
    .from('decathlon_attempts')
    .select('status')
    .eq('id', attemptId)
    .single()

  if (!attempt) notFound()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Welcome to the Rebel Decathlon
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Watch this short intro before you begin.
        </p>

        {INTRO_VIMEO_ID !== 'TODO' && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-black">
            <iframe
              src={`https://player.vimeo.com/video/${INTRO_VIMEO_ID}`}
              title="Rebel Decathlon introduction"
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <Link
          href={`/test/${attemptId}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors mb-3"
        >
          Continue to Assessment
        </Link>

        <Link
          href={`/test/${attemptId}`}
          className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        >
          Skip
        </Link>
      </div>
    </main>
  )
}
