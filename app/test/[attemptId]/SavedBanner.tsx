'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function SavedBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('saved') === '1') {
      setVisible(true)
      router.replace(pathname, { scroll: false })
      const timer = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router, pathname])

  if (!visible) return null

  return (
    <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
      <span className="text-green-500 text-lg">✓</span>
      <p className="text-sm text-green-800 font-medium">Progress saved</p>
    </div>
  )
}
