import { Suspense } from 'react'
import UpgradeContent from './UpgradeContent'

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradeContent />
    </Suspense>
  )
}
