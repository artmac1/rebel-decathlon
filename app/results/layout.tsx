import type { Metadata } from 'next'

// Results URLs contain UUIDs and are not meant to be indexed
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
