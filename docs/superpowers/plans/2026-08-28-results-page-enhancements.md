# Results Page Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SAA branding, email results (Resend), personalized CTA, print button, and progress link to `/results/[attemptId]`.

**Architecture:** A Server Action (`actions.ts`) handles the Resend email call. Two thin Client Components (`EmailResultsForm`, `PrintButton`) handle interactivity. All five features are wired into the existing server-rendered results page (`page.tsx`) with no structural changes to existing cards.

**Tech Stack:** Next.js 16 App Router, Resend (new dependency), Vitest, Tailwind CSS v4, TypeScript

---

## File Map

| Action | File |
|--------|------|
| Create | `app/results/[attemptId]/actions.ts` |
| Create | `app/results/[attemptId]/actions.test.ts` |
| Create | `app/results/[attemptId]/EmailResultsForm.tsx` |
| Create | `app/results/[attemptId]/PrintButton.tsx` |
| Modify | `app/results/[attemptId]/page.tsx` |

---

## Task 1: Install Resend and configure environment variables

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.local` (local dev env)

- [ ] **Step 1: Install Resend**

```bash
cd rebel-decathlon
npm install resend
```

Expected output: `added 1 package` (or similar). No errors.

- [ ] **Step 2: Add env vars to `.env.local`**

Open `.env.local` (create it if it doesn't exist) and add:

```
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=results@yourdomain.com
BOOKING_URL=https://your-ghl-calendar-link-here
```

> **Note for Art:** Replace all three values with real ones before testing. `BOOKING_URL` is the GHL calendar link you mentioned. `RESEND_FROM_EMAIL` must be a domain you've verified in Resend. Add these same three vars to Vercel's Production environment (Settings → Environment Variables) before deploying.

- [ ] **Step 3: Verify Resend is importable**

```bash
node -e "const { Resend } = require('resend'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add resend dependency"
```

---

## Task 2: Server Action — sendResultsEmail

**Files:**
- Create: `app/results/[attemptId]/actions.ts`
- Create: `app/results/[attemptId]/actions.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/results/[attemptId]/actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted lets us reference mockSend inside the vi.mock factory
const mockSend = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}))

import { sendResultsEmail } from './actions'

const payload = {
  participantName: 'Jane',
  total: 65,
  bandLabel: 'Hardened Warrior',
  completedAt: 'August 1, 2026',
  attemptId: 'abc-123',
  scores: [
    { label: 'Push-Up Test', points: 7 },
    { label: 'Squat Test', points: 4 },
  ],
}

describe('sendResultsEmail', () => {
  beforeEach(() => {
    mockSend.mockResolvedValue({ error: null })
  })

  it('returns error for empty email', async () => {
    const result = await sendResultsEmail('', payload)
    expect(result).toEqual({ error: 'Please enter a valid email address.' })
  })

  it('returns error for email with no @', async () => {
    const result = await sendResultsEmail('notanemail', payload)
    expect(result).toEqual({ error: 'Please enter a valid email address.' })
  })

  it('returns success when Resend sends successfully', async () => {
    const result = await sendResultsEmail('jane@example.com', payload)
    expect(result).toEqual({ success: true })
  })

  it('calls Resend with correct subject containing participant name and date', async () => {
    await sendResultsEmail('jane@example.com', payload)
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.subject).toContain('Jane')
    expect(callArgs.subject).toContain('August 1, 2026')
  })

  it('calls Resend with html containing the results URL', async () => {
    await sendResultsEmail('jane@example.com', payload)
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.html).toContain('abc-123')
  })

  it('calls Resend with html containing all event scores', async () => {
    await sendResultsEmail('jane@example.com', payload)
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.html).toContain('Push-Up Test')
    expect(callArgs.html).toContain('Squat Test')
  })

  it('returns error when Resend returns an error object', async () => {
    mockSend.mockResolvedValueOnce({ error: { message: 'domain not verified' } })
    const result = await sendResultsEmail('jane@example.com', payload)
    expect(result).toEqual({ error: 'Failed to send email. Please try again.' })
  })

  it('returns error when Resend throws', async () => {
    mockSend.mockRejectedValueOnce(new Error('network failure'))
    const result = await sendResultsEmail('jane@example.com', payload)
    expect(result).toEqual({ error: 'Failed to send email. Please try again.' })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run app/results/\\[attemptId\\]/actions.test.ts
```

Expected: FAIL — `Cannot find module './actions'`

- [ ] **Step 3: Create the server action**

Create `app/results/[attemptId]/actions.ts`:

```ts
'use server'

import { Resend } from 'resend'

export type EmailPayload = {
  participantName: string
  total: number
  bandLabel: string
  completedAt: string | null
  attemptId: string
  scores: Array<{ label: string; points: number }>
}

export async function sendResultsEmail(
  email: string,
  payload: EmailPayload
): Promise<{ success: true } | { error: string }> {
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  const resultsUrl = `https://rebel-decathlon.vercel.app/results/${payload.attemptId}`

  const scoreRows = payload.scores
    .map(
      (s) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${s.label}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold">${s.points}/10</td>
        </tr>`
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 4px">${payload.participantName}'s Rebel Decathlon Results</h2>
        ${payload.completedAt ? `<p style="color:#888;margin:0 0 24px;font-size:14px">Completed ${payload.completedAt}</p>` : ''}

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="font-size:56px;font-weight:bold;margin:0 0 4px">${payload.total}</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 8px">out of 100 points</p>
          <p style="font-weight:bold;font-size:18px;margin:0">${payload.bandLabel}</p>
        </div>

        <p style="margin-bottom:24px">
          <a href="${resultsUrl}" style="background:#111;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">
            View your full results →
          </a>
        </p>

        <h3 style="font-size:14px;color:#374151;margin:0 0 8px">Event Breakdown</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody>${scoreRows}</tbody>
        </table>
      </body>
    </html>
  `

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'results@rebelworkout.com',
      to: email,
      subject: `${payload.participantName}'s Rebel Decathlon Results${payload.completedAt ? ` — ${payload.completedAt}` : ''}`,
      html,
    })

    if (error) return { error: 'Failed to send email. Please try again.' }
    return { success: true }
  } catch {
    return { error: 'Failed to send email. Please try again.' }
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run app/results/\\[attemptId\\]/actions.test.ts
```

Expected: PASS — 8 tests, 0 failures

- [ ] **Step 5: Commit**

```bash
git add app/results/\\[attemptId\\]/actions.ts app/results/\\[attemptId\\]/actions.test.ts
git commit -m "feat: add sendResultsEmail server action with Resend"
```

---

## Task 3: PrintButton client component

**Files:**
- Create: `app/results/[attemptId]/PrintButton.tsx`

No test needed — this component is a single `window.print()` call with no logic.

- [ ] **Step 1: Create the component**

Create `app/results/[attemptId]/PrintButton.tsx`:

```tsx
'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      Print results
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/results/\\[attemptId\\]/PrintButton.tsx
git commit -m "feat: add PrintButton client component"
```

---

## Task 4: EmailResultsForm client component

**Files:**
- Create: `app/results/[attemptId]/EmailResultsForm.tsx`

- [ ] **Step 1: Create the component**

Create `app/results/[attemptId]/EmailResultsForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { sendResultsEmail, type EmailPayload } from './actions'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function EmailResultsForm({ payload }: { payload: EmailPayload }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const result = await sendResultsEmail(email, payload)

    if ('success' in result) {
      setStatus('success')
    } else {
      setErrorMessage(result.error)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
        <p className="text-sm font-semibold text-gray-900 mb-1">Check your inbox!</p>
        <p className="text-sm text-gray-500">Your results are on their way to {email}.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Get a copy of your results</h2>
      <p className="text-xs text-gray-500 mb-4">
        We&apos;ll email you your score and full event breakdown.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'sending'}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'sending' || !email}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {status === 'sending' ? 'Sending…' : 'Send my results'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-2">{errorMessage}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/results/\\[attemptId\\]/EmailResultsForm.tsx
git commit -m "feat: add EmailResultsForm client component"
```

---

## Task 5: Update results page.tsx

**Files:**
- Modify: `app/results/[attemptId]/page.tsx`

This task wires in all five features: SAA icon, email form, CTA card, print+book row, and progress link.

- [ ] **Step 1: Read the current page.tsx**

Read `app/results/[attemptId]/page.tsx` in full before making any changes. Confirm the imports at the top and the structure of the `return` block.

- [ ] **Step 2: Update imports at the top of page.tsx**

Replace the existing import block:

```tsx
import { createServiceClient } from '@/lib/supabase'
import { ALL_EVENT_KEYS, EVENT_INSTRUCTIONS } from '@/lib/event-instructions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
```

With:

```tsx
import { createServiceClient } from '@/lib/supabase'
import { ALL_EVENT_KEYS, EVENT_INSTRUCTIONS } from '@/lib/event-instructions'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import EmailResultsForm from './EmailResultsForm'
import PrintButton from './PrintButton'
```

- [ ] **Step 3: Add emailPayload variable after the existing derived values block**

In `page.tsx`, find the comment `// ── Derived values ──` section. After the existing derived values (after the `totalDelta` line), add:

```tsx
  const emailPayload = {
    participantName,
    total,
    bandLabel: band.label,
    completedAt,
    attemptId,
    scores: scores.map((s) => ({ label: s.label, points: s.points })),
  }

  const bookingUrl = process.env.BOOKING_URL ?? '#'
  const weakestEventLabel = primaryFocus[0]?.label ?? 'your lowest-scoring event'
```

- [ ] **Step 4: Update the header section in the return block**

Find this in the return block:

```tsx
        {/* Back link */}
        <Link
          href={`/test/${attemptId}`}
          className="text-sm text-gray-500 hover:text-gray-700 inline-block"
        >
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{participantName}&apos;s Results</h1>
          {completedAt && (
            <p className="text-gray-500 text-sm mt-1">Completed {completedAt}</p>
          )}
        </div>
```

Replace it with:

```tsx
        {/* Back link + SAA icon */}
        <div className="flex items-center justify-between">
          <Link
            href={`/test/${attemptId}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to dashboard
          </Link>
          <Image
            src="/saa-icon.png"
            alt="Successful Aging Academy"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{participantName}&apos;s Results</h1>
          {completedAt && (
            <p className="text-gray-500 text-sm mt-1">Completed {completedAt}</p>
          )}
        </div>
```

- [ ] **Step 5: Add the new bottom section after the closing tag of the progress comparison card**

Find the closing `</div>` of the progress comparison block (the last card in the return). It ends with:

```tsx
        )}

      </div>
    </main>
```

Replace that closing with:

```tsx
        )}

        {/* ── Email results ── */}
        <EmailResultsForm payload={emailPayload} />

        {/* ── CTA card ── */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Turn your results into a plan</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            Your {weakestEventLabel} score is your biggest opportunity right now. That&apos;s not a
            criticism — it&apos;s a target. The fastest way to move that number is to stop guessing
            and put a structured plan in place. That&apos;s exactly what we do together.
          </p>
          <div className="flex gap-3">
            <PrintButton />
            <Link
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white text-center hover:bg-gray-700 transition-colors"
            >
              Book a session →
            </Link>
          </div>
        </div>

        {/* ── Progress history link ── */}
        <div className="text-center pb-2">
          <Link href="/progress" className="text-sm text-gray-400 hover:text-gray-600">
            View your full history →
          </Link>
        </div>

      </div>
    </main>
```

- [ ] **Step 6: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. If there are type errors, fix them before continuing.

- [ ] **Step 7: Start the dev server and manually verify the results page**

```bash
npm run dev
```

Open a results page URL in the browser (e.g. `http://localhost:3000/results/<any-valid-attemptId>`). Confirm:

- [ ] SAA icon appears top-right next to the back link
- [ ] Email form card appears at the bottom
- [ ] Typing an email and submitting shows "Sending…" then "Check your inbox!" (use a real email to verify delivery, or check Resend dashboard)
- [ ] CTA card shows the correct weakest event name in the paragraph
- [ ] Print button triggers browser print dialog
- [ ] Book a Session button is a link (hovering shows a URL)
- [ ] "View your full history →" link appears at the bottom and points to `/progress`

- [ ] **Step 8: Commit**

```bash
git add app/results/\\[attemptId\\]/page.tsx
git commit -m "feat: add branding, email, CTA, print, and progress link to results page"
```

---

## Before deploying to Vercel

Add these three environment variables to the Vercel project (Settings → Environment Variables → Production):

| Name | Value |
|------|-------|
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender address (e.g. `results@yourdomain.com`) |
| `BOOKING_URL` | Your GHL calendar link |
