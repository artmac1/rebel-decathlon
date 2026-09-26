'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  attemptId: string
  eventKey: string
}

// ---------------------------------------------------------------------------
// Field-group helpers
// ---------------------------------------------------------------------------

function NumberField({
  name,
  label,
  min,
  max,
  step,
  required = true,
}: {
  name: string
  label: string
  min?: number
  max?: number
  step?: number
  required?: boolean
}) {
  // Use "decimal" for fields that allow fractions (step < 1), "numeric" for whole numbers.
  // This ensures iOS shows the number pad instead of the full keyboard.
  const inputMode = step && step < 1 ? 'decimal' : 'numeric'

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function CheckboxField({ name, label }: { name: string; label: string }) {
  // Larger touch target — wraps the whole row so the label area is also tappable.
  return (
    <label className="flex items-center gap-3 cursor-pointer py-1.5">
      <input type="checkbox" name={name} className="h-5 w-5 rounded border-gray-300 text-blue-600 shrink-0" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

// ---------------------------------------------------------------------------
// Per-event form fields
// ---------------------------------------------------------------------------

function WhrFields() {
  return (
    <>
      <NumberField name="waist" label="Waist circumference (inches)" min={10} max={80} step={0.1} />
      <NumberField name="hips" label="Hip circumference (inches)" min={10} max={80} step={0.1} />
    </>
  )
}

function RepsFields() {
  return <NumberField name="reps" label="Repetitions completed" min={0} max={300} />
}

function HrFields() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Immediately after stepping</p>
        <NumberField
          name="bpm"
          label="Heart rate (beats per minute — 15-second count × 4)"
          min={20}
          max={250}
        />
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">After 2 minutes of quiet rest</p>
        <p className="text-xs text-gray-500">Sit quietly for exactly 2 minutes, then measure heart rate again.</p>
        <NumberField
          name="recovery_bpm"
          label="Recovery heart rate (beats per minute — 15-second count × 4)"
          min={20}
          max={250}
        />
      </div>
    </div>
  )
}

function SecondsFields({ label }: { label: string }) {
  return <NumberField name="seconds" label={label} min={0} max={600} />
}

function SpeedFields() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Enter the time it took you to complete the 1-mile walk.</p>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="walk_minutes" className="block text-sm font-medium text-gray-700 mb-1">
            Minutes
          </label>
          <input
            id="walk_minutes"
            name="walk_minutes"
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="walk_seconds" className="block text-sm font-medium text-gray-700 mb-1">
            Seconds
          </label>
          <input
            id="walk_seconds"
            name="walk_seconds"
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

function SitRiseFields() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Sitting (lowering to floor)</p>
        <CheckboxField name="sitting_unable" label="Unable to complete" />
        <NumberField
          name="sitting_supports"
          label="Number of supports used"
          min={0}
          max={10}
          required={false}
        />
        <CheckboxField name="sitting_unsteady" label="Unsteady (−0.5 pts)" />
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Rising (standing back up)</p>
        <CheckboxField name="rising_unable" label="Unable to complete" />
        <NumberField
          name="rising_supports"
          label="Number of supports used"
          min={0}
          max={10}
          required={false}
        />
        <CheckboxField name="rising_unsteady" label="Unsteady (−0.5 pts)" />
      </div>
    </div>
  )
}

const FLEXIBILITY_FIELDS: Array<{ name: string; label: string }> = [
  { name: 'hamstring_right', label: 'Sagittal Hamstring — Right' },
  { name: 'hamstring_left', label: 'Sagittal Hamstring — Left' },
  { name: 'piriformis_right', label: 'Piriformis (Hip Rotation) — Right' },
  { name: 'piriformis_left', label: 'Piriformis (Hip Rotation) — Left' },
  { name: 'quadriceps_right', label: 'Quadriceps — Right' },
  { name: 'quadriceps_left', label: 'Quadriceps — Left' },
  { name: 'hip_flexor_right', label: 'Hip Flexor (Thomas Test) — Right' },
  { name: 'hip_flexor_left', label: 'Hip Flexor (Thomas Test) — Left' },
  { name: 'back_scratch_right', label: 'Back Scratch — Right' },
  { name: 'back_scratch_left', label: 'Back Scratch — Left' },
]

function FlexibilityFields() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">
        Check each side that meets the target range of motion (1 point per side).
      </p>
      {FLEXIBILITY_FIELDS.map(({ name, label }) => (
        <CheckboxField key={name} name={name} label={label} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// rawInput builders
// ---------------------------------------------------------------------------

function buildRawInput(eventKey: string, form: HTMLFormElement): Record<string, unknown> {
  const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)

  switch (eventKey) {
    case 'whr':
      return {
        waist: parseFloat(get('waist')!.value),
        hips: parseFloat(get('hips')!.value),
      }
    case 'pushup':
    case 'squat':
    case 'situp':
      return { reps: parseInt(get('reps')!.value, 10) }
    case 'hr':
      return {
        bpm: parseInt(get('bpm')!.value, 10),
        recovery_bpm: parseInt(get('recovery_bpm')!.value, 10),
      }
    case 'balance':
      return { seconds: parseFloat(get('seconds')!.value) }
    case 'arm_hang':
      return { seconds: parseFloat(get('seconds')!.value) }
    case 'speed': {
      const mins = parseInt(get('walk_minutes')!.value, 10) || 0
      const secs = parseInt(get('walk_seconds')!.value, 10) || 0
      return { seconds: mins * 60 + secs }
    }
    case 'sit_rise': {
      const sittingUnable = (get('sitting_unable') as HTMLInputElement)?.checked ?? false
      const risingUnable = (get('rising_unable') as HTMLInputElement)?.checked ?? false
      const sittingUnsteady = (get('sitting_unsteady') as HTMLInputElement)?.checked ?? false
      const risingUnsteady = (get('rising_unsteady') as HTMLInputElement)?.checked ?? false
      const sittingSupportsRaw = get('sitting_supports')?.value
      const risingSupportsRaw = get('rising_supports')?.value
      return {
        sitting_unable: sittingUnable,
        sitting_supports: sittingUnable ? 0 : parseInt(sittingSupportsRaw ?? '0', 10),
        sitting_unsteady: sittingUnsteady,
        rising_unable: risingUnable,
        rising_supports: risingUnable ? 0 : parseInt(risingSupportsRaw ?? '0', 10),
        rising_unsteady: risingUnsteady,
      }
    }
    case 'flexibility': {
      const result: Record<string, boolean> = {}
      for (const { name } of FLEXIBILITY_FIELDS) {
        result[name] = (form.elements.namedItem(name) as HTMLInputElement)?.checked ?? false
      }
      return result
    }
    default:
      return {}
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EventForm({ attemptId, eventKey }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [scored, setScored] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    let rawInput: Record<string, unknown>
    try {
      rawInput = buildRawInput(eventKey, e.currentTarget)
    } catch {
      setError('Could not read form values. Please check your entries.')
      setSubmitting(false)
      return
    }

    const response = await fetch(`/api/attempts/${attemptId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventKey, rawInput }),
    })

    const result = await response.json()

    if (!response.ok) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    setScored(result.points)

    // Brief pause so the user sees their score before navigating
    setTimeout(() => {
      router.push(`/test/${attemptId}?saved=1`)
    }, 1500)
  }

  if (scored !== null) {
    return (
      <div className="text-center py-8">
        <p className="text-5xl font-bold text-blue-600 mb-2">{scored}</p>
        <p className="text-gray-500 text-sm">points earned</p>
        <p className="text-gray-400 text-xs mt-4">Returning to dashboard…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {eventKey === 'whr' && <WhrFields />}
      {(eventKey === 'pushup' || eventKey === 'squat' || eventKey === 'situp') && <RepsFields />}
      {eventKey === 'hr' && <HrFields />}
      {eventKey === 'balance' && <SecondsFields label="Hold time (seconds)" />}
      {eventKey === 'arm_hang' && <SecondsFields label="Hang time (seconds)" />}
      {eventKey === 'speed' && <SpeedFields />}
      {eventKey === 'sit_rise' && <SitRiseFields />}
      {eventKey === 'flexibility' && <FlexibilityFields />}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-4 text-base transition-colors"
      >
        {submitting ? 'Saving…' : 'Submit Result'}
      </button>
    </form>
  )
}
