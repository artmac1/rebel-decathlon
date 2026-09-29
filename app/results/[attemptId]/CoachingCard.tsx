// Art: replace 'TODO' with your Vimeo coaching overview video ID after uploading.
// e.g. if your Vimeo URL is https://vimeo.com/987654321, set this to '987654321'
const COACHING_VIMEO_ID = 'TODO'

type Props = {
  bookingUrl: string
}

export default function CoachingCard({ bookingUrl }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5 space-y-4">

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          1-on-1 Coaching
        </p>
        <h2 className="text-base font-bold text-gray-900">
          Ready to stop guessing and start progressing?
        </h2>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        Your results are a roadmap — but having an experienced coach in your corner is
        what turns a roadmap into real, consistent progress. If you&apos;re serious
        about moving the needle and want structured accountability from someone who&apos;s
        been coaching high-performers for 30+ years, let&apos;s talk.
      </p>

      {/* Coaching overview video */}
      {COACHING_VIMEO_ID !== 'TODO' ? (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${COACHING_VIMEO_ID}`}
            title="How Art's coaching program works"
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        /* Placeholder shown until the video is uploaded */
        <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center">
          <p className="text-xs text-gray-400 text-center px-6">
            Video coming soon — Art will add a coaching overview here.
          </p>
        </div>
      )}

      <div>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-4 text-base font-semibold text-white text-center transition-colors"
        >
          Book a free strategy call →
        </a>
        <p className="text-xs text-gray-400 text-center mt-2">
          30 minutes · No obligation · Just clarity on where you go from here
        </p>
      </div>

    </div>
  )
}
