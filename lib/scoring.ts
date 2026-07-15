import scoringTablesData from './data/scoring-tables.json'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Breakpoint = { threshold: number | string; points: number }

type SimpleEvent = {
  event_key: string
  display_name: string
  gender_split: false
  age_split: false
  scoring_method?: never
  breakpoints: Breakpoint[]
}

type SitRiseEvent = {
  event_key: 'sit_rise'
  display_name: string
  gender_split: false
  age_split: false
  scoring_method: 'two_part_sum'
  breakpoints: Breakpoint[]
}

type FlexibilityEvent = {
  event_key: 'flexibility'
  display_name: string
  gender_split: false
  age_split: false
  scoring_method: 'bilateral_binary_sum'
  tests: Array<{ name: string; points_per_side: number }>
}

type AgeSplitEvent = {
  event_key: string
  display_name: string
  gender_split: false
  age_split: true
  bands: Record<string, Breakpoint[]>
}

type GenderSplitEvent = {
  event_key: string
  display_name: string
  gender_split: true
  age_split: false
  bands: Record<'male' | 'female', Breakpoint[]>
}

type GenderAgeSplitEvent = {
  event_key: string
  display_name: string
  gender_split: true
  age_split: true
  bands: Record<'male' | 'female', Record<string, Breakpoint[]>>
}

type EventDef =
  | SimpleEvent
  | SitRiseEvent
  | FlexibilityEvent
  | AgeSplitEvent
  | GenderSplitEvent
  | GenderAgeSplitEvent

const scoringTables = scoringTablesData as EventDef[]

export type RawInput = Record<string, unknown>

export type EventScore = {
  eventKey: string
  points: number
}

export type DecathlonResult = {
  breakdown: EventScore[]
  total: number
}

const ALL_EVENT_KEYS = [
  'whr', 'pushup', 'squat', 'hr', 'situp',
  'sit_rise', 'balance', 'speed', 'arm_hang', 'flexibility',
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * VLOOKUP-style step lookup: walk the breakpoints (which must be in ascending
 * numeric order), keep updating result as long as value >= threshold.
 * Returns the points for the last matching row.
 */
function vlookup(breakpoints: Breakpoint[], value: number): number {
  let result = 0
  for (const bp of breakpoints) {
    if (typeof bp.threshold !== 'number') continue
    if (value >= bp.threshold) {
      result = bp.points
    }
  }
  return result
}

/**
 * Find the age-band key whose range contains the given age.
 * Supports patterns like "50-59", "60-64", "70+", "90+".
 */
function resolveAgeBand(
  bands: Record<string, unknown>,
  age: number,
  eventKey: string,
): string {
  for (const key of Object.keys(bands)) {
    if (key.endsWith('+')) {
      const min = parseInt(key, 10)
      if (age >= min) return key
    } else {
      const [min, max] = key.split('-').map(Number)
      if (age >= min && age <= max) return key
    }
  }
  throw new Error(
    `Age ${age} does not match any band for event "${eventKey}". ` +
    `Available bands: ${Object.keys(bands).join(', ')}`
  )
}

function requireNumber(rawInput: RawInput, field: string, eventKey: string): number {
  if (!(field in rawInput) || rawInput[field] === undefined || rawInput[field] === null) {
    throw new Error(`Event "${eventKey}": missing required field "${field}" in rawInput`)
  }
  const val = rawInput[field]
  if (typeof val !== 'number') {
    throw new Error(
      `Event "${eventKey}": field "${field}" must be a number, got ${typeof val}`
    )
  }
  return val
}

function requireBoolean(rawInput: RawInput, field: string, eventKey: string): boolean {
  if (!(field in rawInput) || rawInput[field] === undefined || rawInput[field] === null) {
    throw new Error(`Event "flexibility": missing required field "${field}" in rawInput`)
  }
  const val = rawInput[field]
  if (typeof val !== 'boolean') {
    throw new Error(`Event "flexibility": field "${field}" must be a boolean, got ${typeof val}`)
  }
  return val
}

// ---------------------------------------------------------------------------
// Per-event value extraction
// ---------------------------------------------------------------------------

function extractValue(eventKey: string, rawInput: RawInput): number {
  switch (eventKey) {
    case 'whr': {
      // Accept pre-computed ratio or compute from waist + hips
      if ('ratio' in rawInput && rawInput.ratio !== undefined) {
        return requireNumber(rawInput, 'ratio', eventKey)
      }
      const waist = requireNumber(rawInput, 'waist', eventKey)
      const hips = requireNumber(rawInput, 'hips', eventKey)
      if (hips <= 0) throw new Error('Event "whr": hips must be greater than 0')
      // Round to 2 decimal places per sheet instructions ("with proper rounding")
      return Math.round((waist / hips) * 100) / 100
    }
    case 'pushup':
    case 'squat':
    case 'situp':
      return requireNumber(rawInput, 'reps', eventKey)
    case 'hr':
      return requireNumber(rawInput, 'bpm', eventKey)
    case 'balance':
    case 'arm_hang':
      return requireNumber(rawInput, 'seconds', eventKey)
    case 'speed':
      return requireNumber(rawInput, 'mph', eventKey)
    default:
      throw new Error(`No value extractor defined for event "${eventKey}"`)
  }
}

// ---------------------------------------------------------------------------
// Special event scorers
// ---------------------------------------------------------------------------

function scoreSitRise(rawInput: RawInput): number {
  const event = scoringTables.find(e => e.event_key === 'sit_rise')!
  const breakpoints = (event as SitRiseEvent).breakpoints

  // 'unable' maps to the 'z' sentinel → 0 pts
  const sittingPts = rawInput.sitting_unable === true
    ? 0
    : vlookup(breakpoints, requireNumber(rawInput, 'sitting_supports', 'sit_rise'))

  const risingPts = rawInput.rising_unable === true
    ? 0
    : vlookup(breakpoints, requireNumber(rawInput, 'rising_supports', 'sit_rise'))

  const sittingDeduct = rawInput.sitting_unsteady === true ? 0.5 : 0
  const risingDeduct = rawInput.rising_unsteady === true ? 0.5 : 0

  return Math.max(0, sittingPts - sittingDeduct) + Math.max(0, risingPts - risingDeduct)
}

const FLEXIBILITY_FIELDS = [
  'hamstring_right', 'hamstring_left',
  'piriformis_right', 'piriformis_left',
  'quadriceps_right', 'quadriceps_left',
  'hip_flexor_right', 'hip_flexor_left',
  'back_scratch_right', 'back_scratch_left',
] as const

function scoreFlexibility(rawInput: RawInput): number {
  let total = 0
  for (const field of FLEXIBILITY_FIELDS) {
    total += requireBoolean(rawInput, field, 'flexibility') ? 1 : 0
  }
  return total
}

// ---------------------------------------------------------------------------
// Main public API
// ---------------------------------------------------------------------------

/**
 * Score a single event.
 *
 * @throws if eventKey is unknown, required rawInput fields are missing,
 *         or age/gender don't match any defined band.
 */
export function scoreEvent(
  eventKey: string,
  rawInput: RawInput,
  age: number,
  gender: 'male' | 'female',
): number {
  const event = scoringTables.find(e => e.event_key === eventKey)
  if (!event) {
    throw new Error(
      `Unknown event key: "${eventKey}". Valid keys: ${ALL_EVENT_KEYS.join(', ')}`
    )
  }

  // Special scoring methods
  if (event.event_key === 'sit_rise') return scoreSitRise(rawInput)
  if (event.event_key === 'flexibility') return scoreFlexibility(rawInput)

  // Resolve breakpoints based on split type
  let breakpoints: Breakpoint[]

  if (event.gender_split && event.age_split) {
    // squat
    const e = event as GenderAgeSplitEvent
    const genderBands = e.bands[gender]
    if (!genderBands) {
      throw new Error(`Event "${eventKey}": no bands defined for gender "${gender}"`)
    }
    const band = resolveAgeBand(genderBands, age, eventKey)
    breakpoints = genderBands[band]
  } else if (event.gender_split && !event.age_split) {
    // whr, arm_hang
    const e = event as GenderSplitEvent
    const genderBreakpoints = e.bands[gender]
    if (!genderBreakpoints) {
      throw new Error(`Event "${eventKey}": no bands defined for gender "${gender}"`)
    }
    breakpoints = genderBreakpoints
  } else if (!event.gender_split && event.age_split) {
    // pushup, squat-like age-only, hr, situp, speed
    const e = event as AgeSplitEvent
    const band = resolveAgeBand(e.bands, age, eventKey)
    breakpoints = e.bands[band]
  } else {
    // balance
    const e = event as SimpleEvent
    breakpoints = e.breakpoints
  }

  return vlookup(breakpoints, extractValue(eventKey, rawInput))
}

/**
 * Score all 10 events and return per-event breakdown plus total.
 *
 * @throws if any event key is missing from allInputs, or if any individual
 *         scoreEvent call throws.
 */
export function scoreDecathlon(
  allInputs: Record<string, RawInput>,
  age: number,
  gender: 'male' | 'female',
): DecathlonResult {
  const breakdown: EventScore[] = []
  let total = 0

  for (const eventKey of ALL_EVENT_KEYS) {
    if (!(eventKey in allInputs)) {
      throw new Error(`scoreDecathlon: missing input for event "${eventKey}"`)
    }
    const points = scoreEvent(eventKey, allInputs[eventKey], age, gender)
    breakdown.push({ eventKey, points })
    total += points
  }

  return { breakdown, total }
}
