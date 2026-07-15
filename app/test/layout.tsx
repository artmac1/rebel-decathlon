import type { Metadata } from 'next'

// Assessment URLs contain UUIDs and are not meant to be indexed
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
