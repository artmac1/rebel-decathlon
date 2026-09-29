// ─── Program registry ─────────────────────────────────────────────────────────
//
// Each program targets a cluster of related decathlon events.
// The selector picks the program whose targetEvents best overlap the
// participant's 3 worst scores. Ties go to the first match in the list.
//
// TODO: Add your programs below. When ready, replace the empty PROGRAMS array
// with real entries. The FALLBACK_PROGRAM is shown until programs are added.
//
// Example entry:
// {
//   id: 'mobility-foundation',
//   name: 'Mobility & Longevity Foundation',
//   tagline: '6 weeks to move better, hurt less, and live longer',
//   description: 'Focuses on joint range of motion, fall-prevention balance work, and floor-to-stand mechanics.',
//   targetEvents: ['flexibility', 'sit_rise', 'balance'],
// },

export type Program = {
  id: string
  name: string
  tagline: string
  description: string
  // Decathlon event keys this program primarily addresses.
  // Must match keys in lib/event-instructions.ts (whr, pushup, squat, hr, situp, sit_rise, balance, speed, arm_hang, flexibility)
  targetEvents: string[]
}

export const PROGRAMS: Program[] = [
  // Add programs here
]

// Shown when PROGRAMS is empty or no program covers the weak events.
export const FALLBACK_PROGRAM: Program = {
  id: 'custom-6-week',
  name: 'Custom 6-Week Program',
  tagline: 'Built around your 3 biggest opportunities',
  description:
    'A structured 6-week training plan targeting your lowest-scoring areas — designed to move the needle on the metrics that matter most for your longevity and performance.',
  targetEvents: [],
}

// Returns the program whose targetEvents overlap most with the given weak event keys.
// Falls back to FALLBACK_PROGRAM when PROGRAMS is empty or no overlap exists.
export function selectProgram(worstEventKeys: string[]): Program {
  if (PROGRAMS.length === 0) return FALLBACK_PROGRAM

  let best: Program = FALLBACK_PROGRAM
  let bestOverlap = -1

  for (const program of PROGRAMS) {
    const overlap = program.targetEvents.filter((key) =>
      worstEventKeys.includes(key)
    ).length
    if (overlap > bestOverlap) {
      bestOverlap = overlap
      best = program
    }
  }

  return bestOverlap > 0 ? best : FALLBACK_PROGRAM
}
