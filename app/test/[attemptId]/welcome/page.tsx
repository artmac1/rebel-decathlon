import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Art: replace 'TODO' with your Vimeo intro video ID after uploading
// e.g. if your Vimeo URL is https://vimeo.com/123456789, set this to '123456789'
const INTRO_VIMEO_ID = '1224648737'

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
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <Image src="/saa-logo.png" alt="Successful Aging Academy" width={300} height={120} priority />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Welcome to the Rebel Decathlon
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Watch this short intro before you begin.
        </p>

        <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${INTRO_VIMEO_ID}`}
            title="Rebel Decathlon introduction"
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>

        <Link
          href={`/test/${attemptId}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
        >
          Continue to Assessment
        </Link>
      </div>
    </main>
  )
}
