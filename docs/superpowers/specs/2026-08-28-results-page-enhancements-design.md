# Results Page Enhancements — Design Spec

**Date:** 2026-08-28
**Status:** Approved

## Overview

Add five missing features to `/results/[attemptId]`:

1. SAA branding (logo icon)
2. Email results to themselves (via Resend)
3. Personalized CTA card ("Book a Session")
4. Print button
5. Link to `/progress` history

Nothing in the existing page structure changes. All additions appear below the current cards.

---

## Architecture

**Approach:** All inline on the existing results page. Email uses a Server Action + Resend. No new routes needed.

**New files:**
- `app/results/[attemptId]/EmailResultsForm.tsx` — Client Component, email input + submit
- `app/results/[attemptId]/actions.ts` — Server Action `sendResultsEmail()`
- `app/results/[attemptId]/PrintButton.tsx` — Client Component, calls `window.print()`

**Modified files:**
- `app/results/[attemptId]/page.tsx` — imports and renders the new components

**Environment variable:**
- `NEXT_PUBLIC_BOOKING_URL` — GHL calendar link (Art provides). Stored as a public env var so it renders server-side without an extra fetch.

---

## Feature Details

### 1. SAA Branding

- Element: `<Image src="/saa-icon.png" />` (~40px)
- Placement: top-right of the header row, inline with the existing "← Back to dashboard" link
- Follows the pattern used on `/test/[id]` (dashboard)

### 2. Email Results Form

**Component:** `EmailResultsForm` (Client Component)

UI: White card, heading "Get a copy of your results", single email `<input>`, "Send my results" button.

Three states:
- **Idle:** input + button enabled
- **Sending:** button disabled, shows "Sending…"
- **Success:** replaces form with "Check your inbox!"
- **Error:** shows "Something went wrong — try again" inline, form stays enabled

**Server Action:** `sendResultsEmail(formData, payload)`

`payload` is passed from the server page and contains:
- `participantName`
- `total` (number)
- `bandLabel` (string)
- `completedAt` (string)
- `attemptId` (for the results page URL)
- `scores` — array of `{ label, points }` for all 10 events

The action calls Resend to send from the configured sender domain.

**Email content:**
- **Subject:** `[Name]'s Rebel Decathlon Results — [Date]`
- **Body (plain text + HTML):**
  - Total score + band label
  - Link back to `https://rebel-decathlon.vercel.app/results/[attemptId]`
  - Full 10-event breakdown (event name + points / 10)

### 3. Personalized CTA Card

A card rendered server-side using data already computed on the page.

**Heading:** "Turn your results into a plan"

**Body copy (dynamic):** Inserts the name of `primaryFocus[0]` — the participant's lowest-scoring event:

> "Your [Event Name] score is your biggest opportunity right now. That's not a criticism — it's a target. The fastest way to move that number is to stop guessing and put a structured plan in place. That's exactly what we do together."

**Button:** "Book a Session" — `<Link href={process.env.NEXT_PUBLIC_BOOKING_URL}>` — opens in new tab.

### 4. Print Button

**Component:** `PrintButton` (Client Component — needs `window`)

A `<button>` that calls `window.print()` on click. Sits in a row with the Book a Session button:
- Print button: left side
- Book a Session button: right side

No custom print stylesheet in this iteration.

### 5. Progress Link

Plain `<Link href="/progress">` at the very bottom of the page:

> "View your full history →"

Small text, no card wrapper.

---

## Page Layout (bottom half, new additions)

```
[ existing cards: score card, congrats, focus analysis, event breakdown, progress comparison ]

─────────────────────────────────────
[ Email card ]
  "Get a copy of your results"
  [email input________________] [Send my results]

─────────────────────────────────────
[ CTA card ]
  "Turn your results into a plan"
  "Your [Event] score is your biggest opportunity..."
  [Print]                    [Book a Session →]

─────────────────────────────────────
  View your full history →
```

---

## Out of Scope

- Custom print stylesheet
- Social sharing
- Pre-filling the email address (user types it)
- Email open/click tracking
