# Video Additions — Design Spec
Date: 2026-08-19

## Overview

Two video features added to the Rebel Decathlon app:

1. **Exercise demo videos** — a Vimeo player embedded on each of the 10 event pages, above the instructions, so participants can watch a demonstration before performing the test.
2. **Intro video + Welcome page** — a new page shown immediately after a participant registers, before they reach the test dashboard. Contains an intro video, a "Continue to Assessment" button, and a "Skip" link.

Videos are hosted on a paid Vimeo account. Embeds use standard Vimeo iframes — no additional dependencies required.

---

## Feature 1: Exercise Demo Videos

### Where it appears

Each event page at `/test/[attemptId]/[eventKey]` gets a 16:9 Vimeo player embedded above the instructions card.

### Layout (top to bottom on event page)

1. Back link + event number/title (unchanged)
2. **Vimeo video player** ← new
3. Instructions card (unchanged)
4. Enter your result card (unchanged)

### Data

`event-instructions.ts` has `videoUrl?: string` on the `EventInstruction` type. This field is repurposed and renamed to `vimeoId?: string` — it stores only the numeric Vimeo video ID, not a full URL. One event (`sit_rise`) has an old YouTube URL there; that gets replaced with a Vimeo ID. All 10 events get a Vimeo ID populated. Art fills these in after uploading videos to Vimeo.

Vimeo share URL format: `https://vimeo.com/123456789` → ID is `123456789`

### Events needing Vimeo IDs

| Event key     | Display name                        |
|---------------|-------------------------------------|
| `whr`         | Waist-to-Hip Ratio                  |
| `pushup`      | Push-Up Challenge (4 minutes)       |
| `squat`       | Chair Squat Test (30 seconds)       |
| `hr`          | Home Step Test (Heart Rate)         |
| `situp`       | Sit-Up Challenge (3 minutes)        |
| `sit_rise`    | Sitting-Rising Test (SRT)           |
| `balance`     | Stork Test (Balance)                |
| `speed`       | 1-Mile Walk Test                    |
| `arm_hang`    | Dead Hang / Arm Hang (Grip Test)    |
| `flexibility` | General Flexibility (5 Bilateral Tests) |

### Code changes

**`lib/event-instructions.ts`**
- Rename `videoUrl?: string` to `vimeoId?: string` on the `EventInstruction` type.
- Add `vimeoId` to all 10 events. Use placeholder string `'TODO'` for any not yet uploaded; Art replaces these with the numeric Vimeo ID after uploading.
- Update `sit_rise` to replace the old YouTube URL with a Vimeo ID.

**`app/test/[attemptId]/[eventKey]/page.tsx`**
- Replace the current `<a href={instruction.videoUrl}>Watch demonstration video</a>` link with a responsive 16:9 Vimeo iframe, rendered when `vimeoId` is present and not `'TODO'`.
- Embed markup:

```tsx
{instruction.vimeoId && instruction.vimeoId !== 'TODO' && (
  <div className="mb-6 aspect-video rounded-2xl overflow-hidden">
    <iframe
      src={`https://player.vimeo.com/video/${instruction.vimeoId}`}
      className="w-full h-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  </div>
)}
```

---

## Feature 2: Intro Video + Welcome Page

### New route

`app/test/[attemptId]/welcome/page.tsx`

### Flow change

**Before:** `/start` form submits → `/api/participants` creates attempt → redirects to `/test/[attemptId]`

**After:** `/start` form submits → `/api/participants` creates attempt → redirects to `/test/[attemptId]/welcome`

### Welcome page layout (top to bottom)

1. "Rebel Decathlon" heading
2. Short subheading: "Watch this short intro before you begin."
3. 16:9 Vimeo intro video player (same embed style as exercise videos)
4. "Continue to Assessment" button → navigates to `/test/[attemptId]`
5. Small "Skip" link below button → also navigates to `/test/[attemptId]`

### Intro video ID

Stored as a constant in the welcome page file:

```ts
const INTRO_VIDEO_ID = 'VIMEO_ID_HERE' // Art replaces after upload
```

### Code changes

**`app/api/participants/route.ts`**
- Change redirect from `/test/${attemptId}` to `/test/${attemptId}/welcome`

**`app/test/[attemptId]/welcome/page.tsx`** (new file)
- Server component
- Validates `attemptId` exists in DB (same pattern as event page — `notFound()` if missing)
- Renders intro video + Continue button + Skip link

---

## Out of Scope

- No autoplay (browser policies block it for non-muted video)
- No video progress tracking
- No "already watched" detection (skip link always available)
- No captions or transcripts
- No fallback for missing video IDs beyond simply not rendering the player
