# Video Additions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Vimeo demo video to each of the 10 event pages, and add a Welcome page with an intro video that new participants see before reaching the test dashboard.

**Architecture:** Three focused changes — (1) update the event instructions data to carry Vimeo IDs, (2) render an iframe embed on each event page, (3) create a new Welcome server component and update the post-registration redirect to point there. No new dependencies; Vimeo embeds are plain iframes.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase (service client for DB validation), Vitest for unit tests.

---

## File Map

| File | Change |
|---|---|
| `lib/event-instructions.ts` | Rename `videoUrl` → `vimeoId` on type; populate all 10 events |
| `lib/__tests__/event-instructions.test.ts` | New — verify all 10 events have a `vimeoId` |
| `app/test/[attemptId]/[eventKey]/page.tsx` | Replace old video link with Vimeo iframe above instructions card |
| `app/test/[attemptId]/welcome/page.tsx` | New — intro video page with Continue + Skip |
| `app/start/page.tsx` | Change redirect from `/test/${attemptId}` → `/test/${attemptId}/welcome` |

---

## Task 1: Add vimeoId to event-instructions.ts

**Files:**
- Modify: `lib/event-instructions.ts`
- Create: `lib/__tests__/event-instructions.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/event-instructions.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { EVENT_INSTRUCTIONS, ALL_EVENT_KEYS } from '../event-instructions'

describe('EVENT_INSTRUCTIONS', () => {
  it('every event has a vimeoId defined as a non-empty string', () => {
    for (const key of ALL_EVENT_KEYS) {
      const entry = EVENT_INSTRUCTIONS[key]
      expect(
        entry.vimeoId,
        `${key} is missing vimeoId`
      ).toBeDefined()
      expect(
        typeof entry.vimeoId,
        `${key}.vimeoId should be a string`
      ).toBe('string')
      expect(
        entry.vimeoId!.length,
        `${key}.vimeoId should not be empty`
      ).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd C:\Users\Owner\.claude\Projects\Rebel-Decathlon\rebel-decathlon
npm test
```

Expected: FAIL — `vimeoId` does not exist on `EventInstruction`.

- [ ] **Step 3: Update lib/event-instructions.ts**

Replace the entire file with the following. The `videoUrl` field is renamed to `vimeoId` and stores only the numeric Vimeo video ID (e.g. `'123456789'`). All 10 events get `vimeoId: 'TODO'` — Art replaces each `'TODO'` with the real Vimeo ID after uploading the videos.

```typescript
// Instructional text sourced directly from Rebel-Decathlon-Scoring-SAA-New.xlsx
// One entry per event_key matching scoring-tables.json

export type EventInstruction = {
  displayName: string
  instructions: string[]
  note?: string
  vimeoId?: string
}

export const EVENT_INSTRUCTIONS: Record<string, EventInstruction> = {
  whr: {
    displayName: 'Waist-to-Hip Ratio',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Using a non-stretching, cloth tape measure, determine a waist and hip circumference as described below. Divide the waist measurement by the hip measurement to calculate the ratio.',
      'The waist is most conveniently measured at the smallest circumference of the natural waist, usually just above the belly button.',
      'The hip circumference is measured at the widest part of the buttocks or hip.',
      'Example: A male with a waist of 40″ and a hip of 44″ has a ratio of 0.91 (with proper rounding). This falls into the "Average" category and is worth 5 points.',
    ],
    note: 'WHR has been found to be a more efficient predictor of mortality in older people than waist circumference or BMI.',
  },

  pushup: {
    displayName: 'Push-Up Challenge (4 minutes)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Execute as many repetitions as possible in a 4-minute time period. Rests are allowed, but the clock does NOT stop.',
      'Place a pad or soft object underneath the torso, not more than 3 inches high. A repetition is NOT counted unless the torso touches the pad.',
      'Males perform a standard push-up. Females perform a modified push-up with the knees in contact with the ground.',
      'Hands must be in line with the shoulders and the neck cannot poke forward. Look for the elbows to reach a 90-degree angle at the bottom.',
    ],
    note: 'Please see the instructional video for complete technical guidance.',
  },

  squat: {
    displayName: 'Chair Squat Test (30 seconds)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Stand with feet approximately shoulder-width apart, with the back of the legs in contact with a standard-height chair (roughly 17 inches high).',
      'Fold your arms across the chest. Sit in the chair and immediately return to a standing position as quickly as possible.',
      'Count the total number of complete repetitions in 30 seconds.',
      'If the individual cannot return to a standing position without assistance or additional support, record a score of 0.',
    ],
    note: 'This test examines muscular endurance of the lower body and daily functional ability.',
  },

  hr: {
    displayName: 'Home Step Test (Heart Rate)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Step up and down, one foot at a time, onto a 12″ step or bench for 3 minutes. (Individuals over age 70 should use an 8″ step; if over 80 the test can be limited to 2:30.)',
      'Maintain a steady four-beat cycle — approximately 22 to 24 steps per minute. Use a metronome app to keep the pace.',
      'On finishing the test, immediately count the number of heartbeats for 15 seconds using the carotid pulse or a heart rate monitor.',
      'Multiply that 15-second count by 4 to get beats per minute, then use the age-appropriate table to find your score.',
    ],
    note: 'IMPORTANT: This test should only be given to individuals cleared for exercise. Terminate immediately if dizziness or light-headedness occurs.',
  },

  situp: {
    displayName: 'Sit-Up Challenge (3 minutes)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Lie on your back on a firm but padded surface. Bend your elbows so your arms rest on your torso with fists underneath the chin — this is the start and end position.',
      'When the clock starts, bend your knees and raise your torso to form a "V" shape. Grab your shins, then return to the supine position. That is one repetition.',
      'Rests are allowed, but the clock does NOT stop.',
      'Execute as many repetitions as possible in 3 minutes.',
    ],
    note: 'If this technique causes lower-back pain due to hip-flexor tightness, halt the test.',
  },

  sit_rise: {
    displayName: 'Sitting-Rising Test (SRT)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Begin standing on a comfortable mat or padded surface. Without using any support, lower yourself to a seated position on the floor with legs extended in front of you.',
      'When ready, return to a standing position.',
      'Score each direction (sitting and rising) separately on a 0–5 scale. Each hand, forearm, knee, or side-of-leg used for support costs 1 point. Each unsteady movement costs 0.5 points.',
      '2–3 coached trials are encouraged. Record the best result.',
      'Maximum total = 5 (sitting) + 5 (rising) = 10 points.',
    ],
    note: 'Speed is not important. This test measures general mobility and relative body strength.',
  },

  balance: {
    displayName: 'Stork Test (Balance)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Remove your shoes. Choose which leg to stand on — typically the dominant side produces a better score, but try both if needed.',
      'Place your hands on your hips. Raise the non-standing foot and rest it against the inside of the standing knee.',
      'Close your eyes and hold the position as long as possible. The clock stops when the raised foot touches the ground or the hands leave the hips.',
      'Record the best time in seconds.',
    ],
    note: 'Multiple trials may be needed to determine which leg produces the better score.',
  },

  speed: {
    displayName: '1-Mile Walk Test',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'The goal is to establish a sustainable walking speed the individual can comfortably maintain day-to-day.',
      'This test is ideally performed on a treadmill so all variables can be controlled.',
      'Walk 1 mile at a steady, comfortable pace. Record the speed in miles per hour (mph).',
      'If the individual cannot complete the 1-mile walk at any pace, record a score of 0.',
    ],
    note: 'Studies show that people who walk faster tend to live longer. Terminate the test immediately if the subject feels dizzy or lightheaded.',
  },

  arm_hang: {
    displayName: 'Dead Hang / Arm Hang (Grip Test)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Grip an overhead bar with both hands, palms facing away (overhand grip), arms fully extended.',
      'Lift your feet off the ground and hold the position for as long as possible.',
      'The clock stops when any part of the body (other than hands) contacts the bar, or when the arms are no longer fully extended.',
      'Record total hang time in seconds.',
    ],
    note: 'Men: maximum is 2:00 (120 s) for 10 points, in 12-second intervals. Women: maximum is 1:30 (90 s) for 10 points, in 9-second intervals.',
  },

  flexibility: {
    displayName: 'General Flexibility (5 Bilateral Tests)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Lie on a comfortable padded surface. A partner/trainer assists with each movement. Never force range of motion — movements should be uncomfortable but NOT painful.',
      '1. Sagittal Hamstring — Lying on your back, raise one leg straight up to 90°. Repeat the other side. Each side that cannot reach 90° loses 1 point.',
      '2. Piriformis (Hip Rotation) — With the thigh pointing straight up and knee bent at 90°, internally rotate the shin to bring it parallel with the waist. Each side that cannot reach parallel loses 1 point.',
      '3. Quadriceps — Lying face down, bend one knee to touch the heel to the buttocks. Each side where the heel cannot reach the buttocks loses 1 point.',
      '4. Hip Flexor (Modified Thomas Test) — Sitting at the edge of a table, hold one knee to your chest and let the other leg hang free. The hanging femur should drop to or below the horizon. Each side that cannot do this loses 1 point.',
      '5. Back Scratch Test — Reach one hand over the shoulder and down the back; reach the other hand up the back. Each side where the fingertips cannot touch (or come within 3 inches) loses 1 point.',
    ],
    note: 'Maximum score is 10 (all 10 sides passing). This is NOT a pain-tolerance test — stop if any movement causes pain.',
  },
}

export const ALL_EVENT_KEYS = [
  'whr', 'pushup', 'squat', 'hr', 'situp',
  'sit_rise', 'balance', 'speed', 'arm_hang', 'flexibility',
] as const

export type EventKey = typeof ALL_EVENT_KEYS[number]
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
cd C:\Users\Owner\.claude\Projects\Rebel-Decathlon\rebel-decathlon
npm test
```

Expected: all tests PASS including the new `event-instructions` test.

- [ ] **Step 5: Commit**

```bash
cd C:\Users\Owner\.claude\Projects\Rebel-Decathlon\rebel-decathlon
git add lib/event-instructions.ts lib/__tests__/event-instructions.test.ts
git commit -m "feat: add vimeoId field to all 10 events in event-instructions"
```

---

## Task 2: Add Vimeo iframe to event pages

**Files:**
- Modify: `app/test/[attemptId]/[eventKey]/page.tsx`

No unit test is possible here (no React testing setup in this project). Manual verification is in Step 3.

- [ ] **Step 1: Update app/test/[attemptId]/[eventKey]/page.tsx**

Replace the entire file with the following. The key changes are:
- Import no longer needed for the old video link
- A Vimeo iframe block is added **between the title block and the instructions card** (not inside the instructions card)
- The old `<a>` link inside the instructions card is removed

```tsx
import { createServiceClient } from '@/lib/supabase'
import { ALL_EVENT_KEYS, EVENT_INSTRUCTIONS } from '@/lib/event-instructions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EventForm from './EventForm'

export default async function EventPage({
  params,
}: {
  params: Promise<{ attemptId: string; eventKey: string }>
}) {
  const { attemptId, eventKey } = await params

  // Validate eventKey before hitting the database
  if (!(ALL_EVENT_KEYS as readonly string[]).includes(eventKey)) notFound()

  const supabase = createServiceClient()

  const { data: attempt } = await supabase
    .from('decathlon_attempts')
    .select('status')
    .eq('id', attemptId)
    .single()

  if (!attempt) notFound()

  const instruction = EVENT_INSTRUCTIONS[eventKey]
  const eventIndex = ALL_EVENT_KEYS.indexOf(eventKey as typeof ALL_EVENT_KEYS[number])

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <Link
          href={`/test/${attemptId}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
        >
          ← Back to dashboard
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Event {eventIndex + 1} of {ALL_EVENT_KEYS.length}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{instruction.displayName}</h1>
        </div>

        {instruction.vimeoId && instruction.vimeoId !== 'TODO' && (
          <div className="mb-6 aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              src={`https://player.vimeo.com/video/${instruction.vimeoId}`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Instructions</h2>
          <ol className="space-y-2">
            {instruction.instructions.map((step, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-400 font-medium shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {instruction.note && (
            <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              {instruction.note}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Enter your result</h2>
          <EventForm attemptId={attemptId} eventKey={eventKey} />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Build to confirm no TypeScript errors**

```bash
cd C:\Users\Owner\.claude\Projects\Rebel-Decathlon\rebel-decathlon
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 3: Manual verification**

Since `vimeoId` is `'TODO'` for all events, the iframe will not render yet (guarded by `!== 'TODO'`). To verify the guard works correctly, temporarily change one event's `vimeoId` in `lib/event-instructions.ts` to a real public Vimeo ID (e.g. `'76979871'` is a public Vimeo test video), run `npm run dev`, navigate to any event page, and confirm the player appears. Then revert the change.

- [ ] **Step 4: Commit**

```bash
cd C:\Users\Owner\.claude\Projects\Rebel-Decathlon\rebel-decathlon
git add app/test/[attemptId]/[eventKey]/page.tsx
git commit -m "feat: add Vimeo iframe embed to event pages"
```

---

## Task 3: Welcome page with intro video

**Files:**
- Create: `app/test/[attemptId]/welcome/page.tsx`
- Modify: `app/start/page.tsx` (line 45 — change redirect)

- [ ] **Step 1: Create app/test/[attemptId]/welcome/page.tsx**

```tsx
import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Art: replace 'TODO' with your Vimeo intro video ID after uploading
// e.g. if your Vimeo URL is https://vimeo.com/123456789, set this to '123456789'
const INTRO_VIMEO_ID = 'TODO'

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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Welcome to the Rebel Decathlon
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Watch this short intro before you begin.
        </p>

        <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${INTRO_VIMEO_ID}`}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>

        <Link
          href={`/test/${attemptId}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors mb-3"
        >
          Continue to Assessment
        </Link>

        <Link
          href={`/test/${attemptId}`}
          className="block w-full text-center text-sm text-gray-400 hover:text-gray-600"
        >
          Skip
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Update the redirect in app/start/page.tsx**

On line 45, change:

```tsx
router.push(`/test/${result.attemptId!}`)
```

to:

```tsx
router.push(`/test/${result.attemptId!}/welcome`)
```

- [ ] **Step 3: Build to confirm no TypeScript errors**

```bash
cd C:\Users\Owner\.claude\Projects\Rebel-Decathlon\rebel-decathlon
npm run build
```

Expected: build completes with no errors. The route `/test/[attemptId]/welcome` will appear in the build output.

- [ ] **Step 4: Run all tests**

```bash
cd C:\Users\Owner\.claude\Projects\Rebel-Decathlon\rebel-decathlon
npm test
```

Expected: all tests PASS.

- [ ] **Step 5: Manual flow verification**

Run `npm run dev`, go to `http://localhost:3000/start`, fill in the form and submit. You should land on `/test/[attemptId]/welcome` instead of the dashboard. The Vimeo player will show a blank/broken embed until `INTRO_VIMEO_ID` is set to a real ID — that's expected. Click "Continue to Assessment" and confirm you reach the test dashboard. Click "Skip" from the welcome page and confirm you also reach the dashboard.

- [ ] **Step 6: Commit**

```bash
cd C:\Users\Owner\.claude\Projects\Rebel-Decathlon\rebel-decathlon
git add app/test/[attemptId]/welcome/page.tsx app/start/page.tsx
git commit -m "feat: add welcome page with intro video before test dashboard"
```

---

## After implementation: filling in real Vimeo IDs

Once Art has uploaded videos to Vimeo:

1. Open each video on Vimeo — the URL will be `https://vimeo.com/XXXXXXXXX`
2. Copy the numeric ID (the digits at the end)
3. In `lib/event-instructions.ts`, replace `'TODO'` with the ID for each event
4. In `app/test/[attemptId]/welcome/page.tsx`, replace `'TODO'` on the `INTRO_VIMEO_ID` line
5. Run `npm run build` to confirm no errors
6. Deploy: `vercel --prod` from the project root
