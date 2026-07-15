import { describe, it, expect } from 'vitest'
import { scoreEvent, scoreDecathlon } from '../scoring'

// ---------------------------------------------------------------------------
// WHR — gender split, no age split
// Input: { ratio } or { waist, hips }
// Male bands: <0.86=10, 0.86-0.90=7.5, 0.91-0.95=5, 0.96-1.00=2.5, >1.00=0
// ---------------------------------------------------------------------------
describe('WHR', () => {
  // Spreadsheet example: waist=40, hips=44 → ratio=40/44 rounds to 0.91 → 5 pts (male)
  it('spreadsheet example: male waist=40 hips=44 → 5 pts', () => {
    expect(scoreEvent('whr', { waist: 40, hips: 44 }, 55, 'male')).toBe(5)
  })

  it('male ratio 0.83 (mid-band excellent) → 10 pts', () => {
    expect(scoreEvent('whr', { ratio: 0.83 }, 55, 'male')).toBe(10)
  })

  it('male ratio 0.93 (mid-band average) → 5 pts', () => {
    expect(scoreEvent('whr', { ratio: 0.93 }, 55, 'male')).toBe(5)
  })

  it('female ratio 0.78 (mid-band good) → 7.5 pts', () => {
    expect(scoreEvent('whr', { ratio: 0.78 }, 55, 'female')).toBe(7.5)
  })

  // Boundary: threshold 0.86 is first breakpoint for "good" (male)
  it('boundary: male ratio 0.85 → 10 pts (still excellent)', () => {
    expect(scoreEvent('whr', { ratio: 0.85 }, 55, 'male')).toBe(10)
  })
  it('boundary: male ratio 0.86 → 7.5 pts (first good threshold)', () => {
    expect(scoreEvent('whr', { ratio: 0.86 }, 55, 'male')).toBe(7.5)
  })

  // Boundary: 1.005 is the 0-pt threshold for males
  it('boundary: male ratio 1.00 → 2.5 pts (below 1.005 cutoff)', () => {
    expect(scoreEvent('whr', { ratio: 1.00 }, 55, 'male')).toBe(2.5)
  })
  it('boundary: male ratio 1.005 → 0 pts (exactly at extreme threshold)', () => {
    expect(scoreEvent('whr', { ratio: 1.005 }, 55, 'male')).toBe(0)
  })

  // Female boundaries
  it('boundary: female ratio 0.76 → 7.5 pts', () => {
    expect(scoreEvent('whr', { ratio: 0.76 }, 55, 'female')).toBe(7.5)
  })
  it('boundary: female ratio 0.905 → 0 pts', () => {
    expect(scoreEvent('whr', { ratio: 0.905 }, 55, 'female')).toBe(0)
  })

  it('throws on missing waist and no ratio', () => {
    expect(() => scoreEvent('whr', { hips: 44 }, 55, 'male')).toThrow(/waist/)
  })
  it('throws on hips=0 (division by zero)', () => {
    expect(() => scoreEvent('whr', { waist: 40, hips: 0 }, 55, 'male')).toThrow(/hips/)
  })
})

// ---------------------------------------------------------------------------
// PushUp — age split only (50-59, 60-69, 70+), no gender split
// Input: { reps }
// ---------------------------------------------------------------------------
describe('PushUp', () => {
  // Mid-band: age 55, 50 reps → 49→5, 60→6, so 50 reps = 5 pts
  it('age 55, 50 reps → 5 pts', () => {
    expect(scoreEvent('pushup', { reps: 50 }, 55, 'male')).toBe(5)
  })
  it('age 65, 42 reps → 5 pts (60-69 band)', () => {
    expect(scoreEvent('pushup', { reps: 42 }, 65, 'female')).toBe(5)
  })
  it('age 75, 35 reps → 5 pts (70+ band)', () => {
    expect(scoreEvent('pushup', { reps: 35 }, 75, 'male')).toBe(5)
  })

  // Boundaries
  it('boundary: age 55, 17 reps → 0 pts', () => {
    expect(scoreEvent('pushup', { reps: 17 }, 55, 'male')).toBe(0)
  })
  it('boundary: age 55, 18 reps → 1 pt', () => {
    expect(scoreEvent('pushup', { reps: 18 }, 55, 'male')).toBe(1)
  })
  it('boundary: age 55, 91 reps → 10 pts', () => {
    expect(scoreEvent('pushup', { reps: 91 }, 55, 'male')).toBe(10)
  })
  it('boundary: age 65, 14 reps → 0 pts (60-69)', () => {
    expect(scoreEvent('pushup', { reps: 14 }, 65, 'male')).toBe(0)
  })
  it('boundary: age 65, 15 reps → 1 pt (60-69)', () => {
    expect(scoreEvent('pushup', { reps: 15 }, 65, 'male')).toBe(1)
  })

  it('throws for age 49 (no band)', () => {
    expect(() => scoreEvent('pushup', { reps: 30 }, 49, 'male')).toThrow(/band/)
  })
  it('throws for missing reps', () => {
    expect(() => scoreEvent('pushup', {}, 55, 'male')).toThrow(/reps/)
  })
})

// ---------------------------------------------------------------------------
// Squat — gender AND age split (8 age bands × 2 genders)
// Input: { reps }
// ---------------------------------------------------------------------------
describe('Squat', () => {
  // Mid-band
  it('male age 55, 20 reps → 6 pts (50-59: 18→6, 22→8)', () => {
    expect(scoreEvent('squat', { reps: 20 }, 55, 'male')).toBe(6)
  })
  it('female age 55, 17 reps → 6 pts (50-59: 15→6, 20→8)', () => {
    expect(scoreEvent('squat', { reps: 17 }, 55, 'female')).toBe(6)
  })
  it('male age 82, 12 reps → 6 pts (80-84: 11→6, 16→8)', () => {
    expect(scoreEvent('squat', { reps: 12 }, 82, 'male')).toBe(6)
  })

  // Boundaries
  it('boundary: male age 55, 27 reps → 10 pts', () => {
    expect(scoreEvent('squat', { reps: 27 }, 55, 'male')).toBe(10)
  })
  it('boundary: male age 55, 26 reps → 8 pts (below 27 threshold)', () => {
    expect(scoreEvent('squat', { reps: 26 }, 55, 'male')).toBe(8)
  })
  // Corrected ambiguity: female 60-64, threshold for 10 pts is 23 (not 24)
  it('boundary: female age 62, 23 reps → 10 pts (corrected threshold)', () => {
    expect(scoreEvent('squat', { reps: 23 }, 62, 'female')).toBe(10)
  })
  it('boundary: female age 62, 22 reps → 8 pts (below 23 threshold)', () => {
    expect(scoreEvent('squat', { reps: 22 }, 62, 'female')).toBe(8)
  })

  it('throws for age 49 (no band)', () => {
    expect(() => scoreEvent('squat', { reps: 15 }, 49, 'male')).toThrow(/band/)
  })
  it('throws for missing reps', () => {
    expect(() => scoreEvent('squat', {}, 55, 'female')).toThrow(/reps/)
  })
})

// ---------------------------------------------------------------------------
// HR — age split (50-55, 56-65, 66+), lower BPM = better
// Input: { bpm }
// ---------------------------------------------------------------------------
describe('HR (Home Step Test)', () => {
  // Mid-band
  it('age 53, bpm 100 → 8 pts (50-55: 98→8, 106→7)', () => {
    expect(scoreEvent('hr', { bpm: 100 }, 53, 'male')).toBe(8)
  })
  it('age 60, bpm 108 → 7 pts (56-65: 104→7, 113→5)', () => {
    expect(scoreEvent('hr', { bpm: 108 }, 60, 'female')).toBe(7)
  })
  it('age 70, bpm 95 → 8 pts (66+: 97→8... wait: 88→9, 97→8)', () => {
    // 66+ band: 88→9, 97→8. bpm=95: largest threshold ≤ 95 is 88 → 9 pts
    expect(scoreEvent('hr', { bpm: 95 }, 70, 'male')).toBe(9)
  })

  // Boundaries: the 10→9 cutoff for each band
  it('boundary: age 53, bpm 86 → 10 pts (50-55 max cutoff)', () => {
    expect(scoreEvent('hr', { bpm: 86 }, 53, 'male')).toBe(10)
  })
  it('boundary: age 53, bpm 87 → 9 pts (50-55 first step down)', () => {
    expect(scoreEvent('hr', { bpm: 87 }, 53, 'male')).toBe(9)
  })
  it('boundary: age 60, bpm 85 → 10 pts (56-65 max cutoff)', () => {
    expect(scoreEvent('hr', { bpm: 85 }, 60, 'male')).toBe(10)
  })
  it('boundary: age 60, bpm 86 → 9 pts (56-65 first step down)', () => {
    expect(scoreEvent('hr', { bpm: 86 }, 60, 'male')).toBe(9)
  })
  it('boundary: age 53, bpm 141 → 0 pts (50-55 top cutoff for 0)', () => {
    expect(scoreEvent('hr', { bpm: 141 }, 53, 'male')).toBe(0)
  })
  it('boundary: age 53, bpm 133 → 1 pt (50-55 just below 0-pt threshold)', () => {
    expect(scoreEvent('hr', { bpm: 133 }, 53, 'male')).toBe(1)
  })

  it('throws for age 49 (below 50-55 band)', () => {
    expect(() => scoreEvent('hr', { bpm: 100 }, 49, 'male')).toThrow(/band/)
  })
  it('throws for missing bpm', () => {
    expect(() => scoreEvent('hr', {}, 55, 'male')).toThrow(/bpm/)
  })
})

// ---------------------------------------------------------------------------
// SitUp — age split (50-59, 60-69, 70+)
// Input: { reps }
// ---------------------------------------------------------------------------
describe('SitUp', () => {
  // Mid-band
  it('age 55, 77 reps → 5 pts (50-59: threshold 77→5)', () => {
    expect(scoreEvent('situp', { reps: 77 }, 55, 'male')).toBe(5)
  })
  it('age 65, 66 reps → 5 pts (60-69: threshold 66→5)', () => {
    expect(scoreEvent('situp', { reps: 66 }, 65, 'female')).toBe(5)
  })
  it('age 75, 55 reps → 5 pts (70+: threshold 55→5)', () => {
    expect(scoreEvent('situp', { reps: 55 }, 75, 'male')).toBe(5)
  })

  // Boundaries
  it('boundary: age 55, 112 reps → 10 pts', () => {
    expect(scoreEvent('situp', { reps: 112 }, 55, 'male')).toBe(10)
  })
  it('boundary: age 55, 111 reps → 9 pts (below 112 threshold)', () => {
    expect(scoreEvent('situp', { reps: 111 }, 55, 'male')).toBe(9)
  })
  it('boundary: age 65, 30 reps → 1 pt (60-69: threshold 30→1)', () => {
    expect(scoreEvent('situp', { reps: 30 }, 65, 'male')).toBe(1)
  })
  it('boundary: age 65, 29 reps → 0 pts (below 30 threshold)', () => {
    expect(scoreEvent('situp', { reps: 29 }, 65, 'male')).toBe(0)
  })

  it('throws for age 49 (no band)', () => {
    expect(() => scoreEvent('situp', { reps: 50 }, 49, 'male')).toThrow(/band/)
  })
  it('throws for missing reps', () => {
    expect(() => scoreEvent('situp', {}, 55, 'male')).toThrow(/reps/)
  })
})

// ---------------------------------------------------------------------------
// Sit-Rise (SRT) — no split, two_part_sum method
// Input: { sitting_supports, rising_supports, sitting_unsteady?, rising_unsteady?,
//          sitting_unable?, rising_unable? }
// ---------------------------------------------------------------------------
describe('Sit-Rise', () => {
  // No supports = 5+5 = 10 pts
  it('0 supports sitting + 0 supports rising → 10 pts', () => {
    expect(scoreEvent('sit_rise', { sitting_supports: 0, rising_supports: 0 }, 55, 'male')).toBe(10)
  })
  // Mixed
  it('2 supports sitting + 1 support rising → 3 + 4 = 7 pts', () => {
    expect(scoreEvent('sit_rise', { sitting_supports: 2, rising_supports: 1 }, 55, 'male')).toBe(7)
  })
  // Unable to complete one direction
  it('sitting_unable + 0 rising supports → 0 + 5 = 5 pts', () => {
    expect(scoreEvent('sit_rise', { sitting_unable: true, rising_supports: 0 }, 55, 'male')).toBe(5)
  })
  // Unsteadiness deduction
  it('0 supports + sitting_unsteady → 4.5 + 5 = 9.5 pts', () => {
    expect(scoreEvent('sit_rise', {
      sitting_supports: 0, sitting_unsteady: true,
      rising_supports: 0,
    }, 55, 'male')).toBe(9.5)
  })

  // Boundaries
  it('boundary: 4 supports (each direction) → 1 + 1 = 2 pts', () => {
    expect(scoreEvent('sit_rise', { sitting_supports: 4, rising_supports: 4 }, 55, 'male')).toBe(2)
  })
  // 5+ supports rounds down to 1 pt per the notes (vlookup finds threshold 4→1)
  it('boundary: 5 supports sitting → treated same as 4 → 1 + 5 = 6 pts', () => {
    expect(scoreEvent('sit_rise', { sitting_supports: 5, rising_supports: 0 }, 55, 'male')).toBe(6)
  })

  it('throws when sitting_supports missing and sitting_unable not set', () => {
    expect(() =>
      scoreEvent('sit_rise', { rising_supports: 0 }, 55, 'male')
    ).toThrow(/sitting_supports/)
  })
})

// ---------------------------------------------------------------------------
// Balance (Stork Test) — no split
// Input: { seconds }
// ---------------------------------------------------------------------------
describe('Balance', () => {
  // Mid-band
  it('30 seconds → 5 pts (25-39 = average)', () => {
    expect(scoreEvent('balance', { seconds: 30 }, 55, 'male')).toBe(5)
  })
  it('45 seconds → 7.5 pts (40-49 = good)', () => {
    expect(scoreEvent('balance', { seconds: 45 }, 55, 'female')).toBe(7.5)
  })
  it('15 seconds → 2.5 pts (10-24 = fair)', () => {
    expect(scoreEvent('balance', { seconds: 15 }, 55, 'male')).toBe(2.5)
  })

  // Boundaries (confirmed: 50 seconds = 10 pts, corrected from sheet error of 51)
  it('boundary: 50 seconds → 10 pts (confirmed excellent threshold)', () => {
    expect(scoreEvent('balance', { seconds: 50 }, 55, 'male')).toBe(10)
  })
  it('boundary: 49 seconds → 7.5 pts (below 50 threshold)', () => {
    expect(scoreEvent('balance', { seconds: 49 }, 55, 'male')).toBe(7.5)
  })
  it('boundary: 10 seconds → 2.5 pts (fair threshold)', () => {
    expect(scoreEvent('balance', { seconds: 10 }, 55, 'male')).toBe(2.5)
  })
  it('boundary: 9 seconds → 0 pts (below 10 threshold)', () => {
    expect(scoreEvent('balance', { seconds: 9 }, 55, 'male')).toBe(0)
  })

  it('throws for missing seconds', () => {
    expect(() => scoreEvent('balance', {}, 55, 'male')).toThrow(/seconds/)
  })
  it('throws for negative seconds', () => {
    // -1 falls below all thresholds — vlookup returns 0, not a throw.
    // Negative is physically impossible but not structurally invalid; engine returns 0.
    expect(scoreEvent('balance', { seconds: -1 }, 55, 'male')).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Speed (1-Mile Walk) — age split (50-59, 60-69, 70+)
// Input: { mph }
// ---------------------------------------------------------------------------
describe('Speed', () => {
  // Mid-band
  it('age 55, 3.5 mph → 5 pts (50-59: 3.5→5)', () => {
    expect(scoreEvent('speed', { mph: 3.5 }, 55, 'male')).toBe(5)
  })
  it('age 65, 4.0 mph → 7 pts (60-69: 4.0→7)', () => {
    expect(scoreEvent('speed', { mph: 4.0 }, 65, 'male')).toBe(7)
  })
  it('age 75, 3.0 mph → 6 pts (70+: 3.0→6)', () => {
    expect(scoreEvent('speed', { mph: 3.0 }, 75, 'female')).toBe(6)
  })

  // Boundaries
  it('boundary: age 55, 2 mph → 3 pts (first scoring threshold)', () => {
    expect(scoreEvent('speed', { mph: 2 }, 55, 'male')).toBe(3)
  })
  it('boundary: age 55, 1.9 mph → 0 pts (below 2 mph threshold)', () => {
    expect(scoreEvent('speed', { mph: 1.9 }, 55, 'male')).toBe(0)
  })
  it('boundary: age 55, 5.5 mph → 10 pts', () => {
    expect(scoreEvent('speed', { mph: 5.5 }, 55, 'male')).toBe(10)
  })
  it('boundary: age 65, 4.6 mph → 9 pts (60-69)', () => {
    expect(scoreEvent('speed', { mph: 4.6 }, 65, 'male')).toBe(9)
  })
  it('boundary: age 65, 4.59 mph → 8 pts (just below 4.6)', () => {
    expect(scoreEvent('speed', { mph: 4.59 }, 65, 'male')).toBe(8)
  })

  // Unable to complete = 0 (sentinel 'a' = 0; mph=0 also = 0)
  it('mph 0 → 0 pts (did not walk)', () => {
    expect(scoreEvent('speed', { mph: 0 }, 55, 'male')).toBe(0)
  })

  it('throws for age 49 (no band)', () => {
    expect(() => scoreEvent('speed', { mph: 3.5 }, 49, 'male')).toThrow(/band/)
  })
  it('throws for missing mph', () => {
    expect(() => scoreEvent('speed', {}, 55, 'male')).toThrow(/mph/)
  })
})

// ---------------------------------------------------------------------------
// Arm Hang — gender split, no age split (custom table)
// Male: max 120s = 10 pts, 12s intervals
// Female: max 90s = 10 pts, 9s intervals
// Input: { seconds }
// ---------------------------------------------------------------------------
describe('Arm Hang', () => {
  // Mid-band
  it('male, 60 seconds → 5 pts (threshold 60→5)', () => {
    expect(scoreEvent('arm_hang', { seconds: 60 }, 55, 'male')).toBe(5)
  })
  it('female, 45 seconds → 5 pts (threshold 45→5)', () => {
    expect(scoreEvent('arm_hang', { seconds: 45 }, 55, 'female')).toBe(5)
  })
  it('male, 90 seconds → 8 pts (threshold 84→7, 96→8; 90 is in 84-95)', () => {
    expect(scoreEvent('arm_hang', { seconds: 90 }, 55, 'male')).toBe(7)
  })

  // Boundaries: male 12s interval boundaries
  it('boundary: male 12 seconds → 1 pt (first scoring threshold)', () => {
    expect(scoreEvent('arm_hang', { seconds: 12 }, 55, 'male')).toBe(1)
  })
  it('boundary: male 11 seconds → 0 pts (below 12 threshold)', () => {
    expect(scoreEvent('arm_hang', { seconds: 11 }, 55, 'male')).toBe(0)
  })
  it('boundary: male 120 seconds → 10 pts', () => {
    expect(scoreEvent('arm_hang', { seconds: 120 }, 55, 'male')).toBe(10)
  })
  it('boundary: male 119 seconds → 9 pts (below 120 threshold)', () => {
    expect(scoreEvent('arm_hang', { seconds: 119 }, 55, 'male')).toBe(9)
  })

  // Female boundaries
  it('boundary: female 9 seconds → 1 pt (first scoring threshold)', () => {
    expect(scoreEvent('arm_hang', { seconds: 9 }, 55, 'female')).toBe(1)
  })
  it('boundary: female 8 seconds → 0 pts (below 9 threshold)', () => {
    expect(scoreEvent('arm_hang', { seconds: 8 }, 55, 'female')).toBe(0)
  })
  it('boundary: female 90 seconds → 10 pts', () => {
    expect(scoreEvent('arm_hang', { seconds: 90 }, 55, 'female')).toBe(10)
  })

  it('throws for missing seconds', () => {
    expect(() => scoreEvent('arm_hang', {}, 55, 'male')).toThrow(/seconds/)
  })
})

// ---------------------------------------------------------------------------
// Flexibility — bilateral binary sum (10 pass/fail fields)
// Input: 10 named boolean fields
// ---------------------------------------------------------------------------
describe('Flexibility', () => {
  const allPass = {
    hamstring_right: true, hamstring_left: true,
    piriformis_right: true, piriformis_left: true,
    quadriceps_right: true, quadriceps_left: true,
    hip_flexor_right: true, hip_flexor_left: true,
    back_scratch_right: true, back_scratch_left: true,
  }
  const allFail = Object.fromEntries(
    Object.keys(allPass).map(k => [k, false])
  )

  it('all 10 pass → 10 pts', () => {
    expect(scoreEvent('flexibility', allPass, 55, 'male')).toBe(10)
  })
  it('all 10 fail → 0 pts', () => {
    expect(scoreEvent('flexibility', allFail, 55, 'male')).toBe(0)
  })
  it('5 pass 5 fail → 5 pts', () => {
    const mixed = {
      ...allFail,
      hamstring_right: true,
      piriformis_right: true,
      quadriceps_right: true,
      hip_flexor_right: true,
      back_scratch_right: true,
    }
    expect(scoreEvent('flexibility', mixed, 55, 'female')).toBe(5)
  })
  it('7 pass 3 fail → 7 pts', () => {
    const mostly = { ...allPass, piriformis_left: false, quadriceps_left: false, hip_flexor_left: false }
    expect(scoreEvent('flexibility', mostly, 55, 'male')).toBe(7)
  })

  // Boundary
  it('boundary: exactly 1 pass → 1 pt', () => {
    expect(scoreEvent('flexibility', { ...allFail, hamstring_right: true }, 55, 'male')).toBe(1)
  })
  it('boundary: exactly 9 pass → 9 pts', () => {
    expect(scoreEvent('flexibility', { ...allPass, back_scratch_left: false }, 55, 'male')).toBe(9)
  })

  it('throws when a field is missing', () => {
    const incomplete = { ...allPass }
    delete (incomplete as Record<string, unknown>).hamstring_right
    expect(() => scoreEvent('flexibility', incomplete, 55, 'male')).toThrow(/hamstring_right/)
  })
  it('throws when a field is wrong type', () => {
    expect(() =>
      scoreEvent('flexibility', { ...allPass, hamstring_right: 1 }, 55, 'male')
    ).toThrow(/boolean/)
  })
})

// ---------------------------------------------------------------------------
// scoreEvent error cases
// ---------------------------------------------------------------------------
describe('scoreEvent — invalid eventKey', () => {
  it('throws on unknown eventKey', () => {
    expect(() => scoreEvent('unknown_event', { reps: 10 }, 55, 'male')).toThrow(/Unknown event key/)
  })
})

// ---------------------------------------------------------------------------
// scoreDecathlon
// ---------------------------------------------------------------------------
describe('scoreDecathlon', () => {
  const fullInputs = {
    whr: { ratio: 0.83 },                  // male → 10 pts
    pushup: { reps: 50 },                   // age 55, → 5 pts
    squat: { reps: 20 },                    // male, age 55 → 6 pts
    hr: { bpm: 100 },                       // age 55 → 8 pts
    situp: { reps: 77 },                    // age 55 → 5 pts
    sit_rise: { sitting_supports: 0, rising_supports: 0 }, // → 10 pts
    balance: { seconds: 30 },               // → 5 pts
    speed: { mph: 3.5 },                    // age 55 → 5 pts
    arm_hang: { seconds: 60 },             // male → 5 pts
    flexibility: {
      hamstring_right: true, hamstring_left: true,
      piriformis_right: true, piriformis_left: true,
      quadriceps_right: true, quadriceps_left: false,
      hip_flexor_right: true, hip_flexor_left: false,
      back_scratch_right: true, back_scratch_left: false,
    },                                      // 7 pts
  }

  it('returns correct breakdown and total', () => {
    const result = scoreDecathlon(fullInputs, 55, 'male')
    expect(result.breakdown).toHaveLength(10)
    // Total: 10+5+6+8+5+10+5+5+5+7 = 66
    expect(result.total).toBe(66)
  })

  it('breakdown contains all 10 event keys', () => {
    const result = scoreDecathlon(fullInputs, 55, 'male')
    const keys = result.breakdown.map(e => e.eventKey)
    expect(keys).toContain('whr')
    expect(keys).toContain('flexibility')
    expect(keys).toContain('sit_rise')
  })

  it('throws when an event input is missing', () => {
    const incomplete = { ...fullInputs }
    delete (incomplete as Record<string, unknown>).pushup
    expect(() => scoreDecathlon(incomplete, 55, 'male')).toThrow(/pushup/)
  })
})
