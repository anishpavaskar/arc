# ARC — Architecture Document (v3)

## What This Is
Arc is a personal velocity system. Two screens, local storage, no backend. You use it twice a day: morning to commit, evening to verify. Sunday to reflect.

---

## User Flow (Four Touchpoints)

```
MORNING (Commitment) — under 60 seconds
──────────────────────────────────────────
Open app → Today screen
See: date, 3-day momentum bars (top right), 3 empty domain cards
Type intent (one sentence framing the day)
Fill one task per domain: BODY, BUILD, EXPOSURE
Close app.

DURING THE DAY (Verification) — under 10 seconds each
──────────────────────────────────────────
Open app → swipe completed card RIGHT → gold fill, card locks
Close app. Repeat as tasks complete.

MIDNIGHT (Automatic)
──────────────────────────────────────────
Day freezes. Whatever's done is done. Whatever's not is not.
Cards become read-only. Tomorrow starts blank.

SUNDAY (Reflection)
──────────────────────────────────────────
Tap Velocity tab → see Mon–Sun chart, status label, domain breakdown.
See which domains are strong, which are lagging. Adjust next week.
```

---

## System Overview

```
┌─────────────────────────────────────────────┐
│                   ARC APP                    │
│              (React + TypeScript)            │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │              App.tsx                     │ │
│  │     (dumb shell: tabs + screen swap)    │ │
│  │     No persistence logic lives here.    │ │
│  │                                          │ │
│  │    ┌──────────────┬──────────────┐      │ │
│  │    │  TodayScreen │ VelocityScreen│     │ │
│  │    └──────┬───────┴──────┬───────┘      │ │
│  │           │              │               │ │
│  └───────────┼──────────────┼───────────────┘ │
│              │              │                  │
│  ┌───────────▼──────────────▼───────────────┐ │
│  │           Storage Layer                   │ │
│  │         (utils/storage.ts)                │ │
│  │       localStorage read/write             │ │
│  └───────────────────────────────────────────┘ │
│                                              │
│  ┌───────────────────────────────────────────┐ │
│  │           BottomNav.tsx                   │ │
│  │      (fixed, always visible)              │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## File Structure

```
arc/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── main.tsx                  # Entry point, service worker registration
│   ├── App.tsx                   # Dumb shell: screen state + renders active screen + BottomNav
│   ├── index.css                 # Tailwind import, Google Fonts, CSS variables
│   │
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces
│   │
│   ├── config/
│   │   └── domains.ts            # Domain config array (single source of truth)
│   │
│   ├── utils/
│   │   ├── storage.ts            # localStorage read/write helpers
│   │   ├── dates.ts              # Date formatting, key generation, week boundaries
│   │   └── velocity.ts           # Weekly computation logic (Mon–Sun)
│   │
│   ├── hooks/
│   │   ├── useDateRollover.ts    # Midnight detection (interval + visibilitychange)
│   │   ├── useSwipe.ts           # Swipe gesture detection for domain cards
│   │   └── useLongPress.ts       # Long press detection for hold-to-undo
│   │
│   ├── components/
│   │   ├── BottomNav.tsx          # Fixed bottom tab bar
│   │   ├── DateHeader.tsx         # Date display + navigation arrows
│   │   ├── MomentumBars.tsx       # 3-day mini bars (top right of daily view)
│   │   ├── DailyIntent.tsx        # Single-line intent input
│   │   ├── DomainCard.tsx         # Reusable card with swipe-to-complete + hold-to-undo
│   │   ├── VelocityChart.tsx      # Mon–Sun bar chart (Recharts)
│   │   ├── StatusLabel.tsx        # LOCKED IN / MOVING / etc. with early-week dimming
│   │   └── DomainBreakdown.tsx    # Per-domain X/7 progress bars
│   │
│   └── screens/
│       ├── TodayScreen.tsx        # Composes: DateHeader + MomentumBars + DailyIntent + 3x DomainCard
│       └── VelocityScreen.tsx     # Composes: StatusLabel + VelocityChart + DomainBreakdown
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Three Day States

Every day in ARC exists in one of three states. This is core to the system's honesty.

```
GHOST DAY
  What happened:  Never opened the app. Full drift.
  Data:           No localStorage key exists for that date.
  Visual:         Gap in the chart. No bar rendered.
                  Momentum bar: dark gray, barely visible.

PRESENT BUT INCOMPLETE
  What happened:  Opened the app, set tasks, completed 0.
  Data:           Key exists, all done: false.
  Visual:         Dim gold outline bar, no fill.
                  Shows you showed up but didn't execute.

ACTIVE DAY
  What happened:  Completed 1, 2, or 3 tasks.
  Data:           Key exists, 1+ done: true.
  Visual:         Gold bar filled proportionally (1/3, 2/3, or full).
```

Showing up is not nothing. But it's not the same as executing. And disappearing is worse than both.

---

## Domain Config (Single Source of Truth)

```ts
// src/config/domains.ts

import { DomainKey } from '../types';

export interface DomainConfig {
  key: DomainKey;
  label: string;
  placeholder: string;
}

export const DOMAINS: DomainConfig[] = [
  { key: 'body',     label: 'BODY',     placeholder: 'Gym — press day' },
  { key: 'build',    label: 'BUILD',    placeholder: 'Ship the landing page' },
  { key: 'exposure', label: 'EXPOSURE', placeholder: 'Dinner with Alex' },
];
```

Use `DOMAINS` everywhere. Never hardcode domain strings outside this file and the type definition.

---

## Type Definitions

```ts
// src/types/index.ts

export interface DomainData {
  task: string;
  done: boolean;
}

export interface DayData {
  date: string;          // "YYYY-MM-DD"
  intent: string;
  body: DomainData;
  build: DomainData;
  exposure: DomainData;
}

export type DomainKey = 'body' | 'build' | 'exposure';

export type Screen = 'today' | 'velocity';

export type VelocityStatus = 'LOCKED IN' | 'MOVING' | 'DRAG DETECTED' | 'FLATLINE';

// Three possible day states
export type DayState = 'ghost' | 'present' | 'active';

export interface DayScore {
  date: string;          // "YYYY-MM-DD"
  label: string;         // "Mon", "Tue", etc.
  score: number;         // 0–3
  state: DayState;       // ghost, present, or active
}

export interface WeeklyData {
  days: DayScore[];       // Always Mon–Sun (7 entries, future days excluded)
  average: number;        // Based only on non-ghost days
  status: VelocityStatus;
  domainCounts: Record<DomainKey, number>;  // each 0–7
  dayOfWeek: number;      // 1=Mon, 7=Sun — for early-week dimming logic
}
```

---

## Data Flow

```
USER ACTION                    DATA FLOW
───────────                    ─────────

Types task text        →  DomainCard.onChange
(morning)              →  TodayScreen updates local state
                       →  TodayScreen calls saveDay()
                       →  localStorage writes
                       →  Key now exists = no longer ghost day

Swipes card right      →  useSwipe detects horizontal drag past threshold
(during day)           →  DomainCard fires onComplete(true)
                       →  TodayScreen updates domain.done = true
                       →  TodayScreen calls saveDay()
                       →  Card fills gold, task text locks

Holds card             →  useLongPress detects 500ms press
(undo, same day)       →  DomainCard fires onComplete(false)
                       →  TodayScreen updates domain.done = false
                       →  TodayScreen calls saveDay()
                       →  Card returns to default, task text unlocks

Types intent           →  DailyIntent.onChange
                       →  TodayScreen updates local state
                       →  TodayScreen calls saveDay()

Navigates date         →  DateHeader.onDateChange
                       →  TodayScreen calls loadDay(newDate)
                       →  If no key exists → ghost day (empty + locked)
                       →  If key exists → show saved data (locked)

Opens Velocity tab     →  VelocityScreen mounts
                       →  computeWeeklyData() loads Mon–Sun of current week
                       →  Ghost days = gap, present = outline, active = gold fill
                       →  StatusLabel, VelocityChart, DomainBreakdown render

Midnight rollover      →  useDateRollover hook detects date change
                       →  selectedDate snaps to new today
                       →  TodayScreen reloads with fresh empty day
```

---

## Swipe-to-Complete + Hold-to-Undo

```ts
// src/hooks/useSwipe.ts
//
// Detects horizontal swipe gestures on a card element.
//
// BEHAVIOR:
// - Track touchstart/mousedown X and Y positions
// - On move, calculate horizontal and vertical delta
// - If vertical > horizontal, cancel (user is scrolling)
// - Only activate if horizontal delta > 10px dead zone
// - Card follows finger via translateX during drag
// - If dragged past 40% of card width → trigger completion
// - Otherwise snap back to origin
// - Snap animation: 200ms ease
//
// DIRECTION:
// - Any direction swipe on incomplete card → marks done
// - Swipe on already-complete card → no-op (use hold-to-undo instead)
//
// CONFLICT PREVENTION:
// - Tapping task input does NOT trigger swipe
// - Vertical scrolling not hijacked
// - mousemove/mouseup attached to window, not card
//
// DISABLED: No listeners when disabled (past day)
```

```ts
// src/hooks/useLongPress.ts
//
// Detects press-and-hold gesture (500ms) for undoing completion.
//
// BEHAVIOR:
// - On touchstart/mousedown, start a 500ms timer
// - If finger/mouse lifts before 500ms → cancel (was a tap or swipe)
// - If finger moves more than 10px → cancel (was a swipe)
// - If 500ms passes with finger held → fire onUndo callback
// - Optional: subtle haptic feedback on trigger (navigator.vibrate(50) if available)
//
// ONLY ACTIVE on completed cards. No-op on incomplete cards.
// DISABLED on past days.
```

### Card Visual States

```
INCOMPLETE (default):
  Background:   #1A1A1A (surface)
  Border-left:  3px solid #333333
  Task text:    #F5F5F0, editable
  Label:        #888888 uppercase

COMPLETE (after swipe):
  Background:   rgba(201, 168, 76, 0.15) — muted gold tint
  Border-left:  3px solid #C9A84C
  Checkmark:    small gold checkmark icon, right side
  Task text:    #F5F5F0, LOCKED (not editable)
  Label:        #C9A84C (gold)

DRIFTING (domain missed 3+ consecutive days):
  Background:   #1A1A1A but at ~60% opacity
  Border-left:  3px solid #333333 at ~60% opacity
  Task text:    #F5F5F0 at ~60% opacity
  Label:        #888888 at ~60% opacity
  Visual decay — the card fades, reflecting neglect.
  No notification. No message. Just quiet dimming.

DRAGGING (during swipe gesture):
  Card translateX follows finger
  Background transitions toward gold tint
  200ms ease snap on release

DISABLED (past day):
  Opacity: 0.5
  No swipe/hold listeners
  pointerEvents: none
  Task text visible but not editable
```

---

## 3-Day Momentum Bars

```
// src/components/MomentumBars.tsx
//
// Three small vertical bars in the top-right of the Today screen.
// Shows the last 3 days (not including today).
// Each bar is ~6px wide, ~32px tall, with 4px gap between.
//
// BAR FILL LOGIC (proportional thirds):
//   3/3 done  →  full gold fill
//   2/3 done  →  two-thirds gold fill (bottom up)
//   1/3 done  →  one-third gold fill (bottom up)
//   0/3 done but key exists (present day)  →  dim gold outline, no fill
//   No key (ghost day)  →  dark gray (#333333), barely visible
//
// PURPOSE: Peripheral rearview mirror. You glance at it, you know
// if you've been showing up. No interaction needed.
```

---

## Drift Signal

```
// Drift detection logic — lives in TodayScreen or a utility.
//
// For each domain, check the last 3 days (not including today):
//   - Load last 3 days from localStorage
//   - If domain.done === false (or ghost day) for all 3 → domain is drifting
//
// When a domain is drifting:
//   - DomainCard receives a `drifting: boolean` prop
//   - Card renders at ~60% opacity (all elements: label, input, border)
//   - No notification, no warning text, no badge
//   - Just visual decay — the interface reflects behavior back at you
//
// When user completes the drifting domain today:
//   - Card immediately returns to full opacity
//   - The drift signal clears as soon as done = true
//
// Edge case: if today is Mon/Tue/Wed (fewer than 3 prior days this week),
// check whatever days exist. If only 1 prior day exists and that domain
// was missed, no drift yet (need 3 consecutive).
```

---

## Velocity Computation (Mon–Sun Fixed Week)

```ts
// src/utils/velocity.ts

// CHANGE FROM v2: Week is Mon–Sun, not rolling 7 days.
//
// computeWeeklyData() logic:
//
// STEP 1: Determine current week boundaries.
//   - Find the Monday of the current week (getMonday(today))
//   - Sunday = Monday + 6
//   - Only include days up to and including today (future days excluded)
//
// STEP 2: For each day Mon through today:
//   - Check if localStorage key exists
//   - No key → DayState = 'ghost', score = excluded from average
//   - Key exists, all done: false → DayState = 'present', score = 0
//   - Key exists, 1+ done: true → DayState = 'active', score = count of done
//
// STEP 3: Compute average.
//   - Sum scores of NON-GHOST days only
//   - Divide by count of non-ghost days
//   - If all days are ghost → average = 0
//
// STEP 4: Map average to status (same thresholds).
//   2.5–3.0  →  "LOCKED IN"
//   1.5–2.4  →  "MOVING"
//   0.5–1.4  →  "DRAG DETECTED"
//   0.0–0.4  →  "FLATLINE"
//
// STEP 5: Count per-domain completions.
//   - Only count non-ghost days
//   - domainCounts denominator = number of non-ghost days (not always 7)
//
// STEP 6: Include dayOfWeek (1=Mon, 7=Sun) for early-week dimming.
//
// OUTPUT: WeeklyData { days, average, status, domainCounts, dayOfWeek }
```

### Early-Week Status Dimming

```
// StatusLabel.tsx behavior:
//
// Monday through Wednesday (dayOfWeek 1–3):
//   Status label text renders in #888888 (muted secondary gray)
//   regardless of the actual status category.
//   The data is provisional — don't trust a "LOCKED IN" on Tuesday.
//
// Thursday through Sunday (dayOfWeek 4–7):
//   Status label renders in its full designated color:
//     LOCKED IN    → #C9A84C (gold)
//     MOVING       → #F5F5F0 (white)
//     DRAG DETECTED → #888888 (gray)
//     FLATLINE     → #333333 (dark gray)
//
// No explanation, no tooltip. It quietly becomes more confident
// as the week fills in.
```

---

## Velocity Chart (Mon–Sun)

```
// VelocityChart.tsx changes from v2:
//
// FIXED WEEK: Chart always shows Mon–Sun. X-axis labels are
// Mon, Tue, Wed, Thu, Fri, Sat, Sun.
//
// FUTURE DAYS: Days after today are not rendered. If today is
// Wednesday, only Mon/Tue/Wed bars appear. Thu–Sun are empty space.
//
// BAR RENDERING by DayState:
//   ghost day    →  NO BAR. Gap in the chart. Empty space.
//   present (0/3) →  Dim gold outline bar (#C9A84C at 30% opacity),
//                    no fill. Shows you showed up.
//   active (1/3) →  Gold bar filled 1/3 from bottom
//   active (2/3) →  Gold bar filled 2/3 from bottom
//   active (3/3) →  Gold bar filled fully
//
// PROPORTIONAL FILL: Bars fill in thirds, not solid blocks.
// A 2/3 bar is visually 2/3 gold from the bottom, top 1/3 empty.
// This matches the 3-day momentum bar visual language.
//
// No tooltip. No grid. No Y-axis labels. Minimal.
```

---

## Midnight Rollover Logic

```ts
// src/hooks/useDateRollover.ts
//
// Two mechanisms, both active:
//
// 1. INTERVAL: Every 60 seconds, check if getToday() !== lastKnownToday.
//    Only runs while document.visibilityState === 'visible'.
//    On mismatch → call onDateChange(newToday).
//
// 2. VISIBILITYCHANGE: When tab becomes visible again after being hidden,
//    check if getToday() !== lastKnownToday.
//    On mismatch → call onDateChange(newToday).
//
// When day flips:
//   - selectedDate snaps to new today
//   - Previous day is now permanently read-only
//   - New day starts blank (ghost until user interacts)
```

---

## Storage Layer

```
KEY PATTERN:  "arc-YYYY-MM-DD"
STORAGE:      localStorage (browser)

Operations:
  loadDay(dateStr)   →  reads key, returns DayData or null
  saveDay(data)      →  writes DayData to key
  dayExists(dateStr) →  returns boolean (key exists in localStorage)
  getDateKey(date)   →  converts Date to "YYYY-MM-DD"
  getMonday(date)    →  returns the Monday of the week containing date
```

**IMPORTANT CHANGE:** `loadDay` now returns `null` for missing keys (ghost days), NOT a default empty object. This distinguishes "never opened" from "opened but empty." The TodayScreen creates and saves a default DayData only when the user first interacts with today's cards.

Default DayData (created on first interaction with a new day):

```json
{
  "date": "2026-03-03",
  "intent": "",
  "body": { "task": "", "done": false },
  "build": { "task": "", "done": false },
  "exposure": { "task": "", "done": false }
}
```

---

## Component Dependency Map

```
App.tsx (dumb shell: screen state only)
├── BottomNav.tsx (screen, onScreenChange)
│
├── TodayScreen.tsx (owns selectedDate + dayData state + persistence)
│   ├── DateHeader.tsx (selectedDate, onDateChange, isToday)  [top left]
│   ├── MomentumBars.tsx (last3Days: DayScore[])              [top right]
│   ├── DailyIntent.tsx (intent, onChange, disabled)
│   ├── DomainCard.tsx × 3 (config, data, onChange, onComplete, disabled, drifting)
│   │   └── mapped from DOMAINS config array
│   │   └── uses: useSwipe (complete), useLongPress (undo)
│   │
│   ├── uses: storage.ts, dates.ts, useDateRollover.ts
│   ├── uses: DOMAINS from config/domains.ts
│   └── computes: drift signal per domain (last 3 days check)
│
└── VelocityScreen.tsx (computes weekly data on mount/tab switch)
    ├── StatusLabel.tsx (status, average, dayOfWeek)
    ├── VelocityChart.tsx (days[] with DayState)
    ├── DomainBreakdown.tsx (domainCounts, nonGhostDays)
    │
    ├── uses: velocity.ts, storage.ts, dates.ts
    └── uses: DOMAINS from config/domains.ts
```

---

## Design Tokens

```
COLORS:
  --bg:              #0A0A0A    (page background)
  --surface:         #1A1A1A    (card backgrounds, incomplete state)
  --gold:            #C9A84C    (primary accent, done state, active tab)
  --gold-muted:      #C9A84C99  (60% opacity gold, chart 2/3 bars)
  --gold-tint:       rgba(201, 168, 76, 0.15)  (completed card background)
  --gold-outline:    rgba(201, 168, 76, 0.30)  (present-but-0 bar outline)
  --text-primary:    #F5F5F0    (main text)
  --text-secondary:  #888888    (labels, placeholders, inactive, early-week status)
  --border-inactive: #333333    (card borders, ghost bars, empty states)

TYPOGRAPHY:
  Font family:    "DM Sans" (body text, task inputs, intent)
                  "Instrument Sans" (labels, headings, status, date header)
  NOTE:           Both are Google Fonts (no licensing issues). The spec's earlier
                  mention of "SF Pro Display, Satoshi" is superseded by these choices.
  Labels:         uppercase, letter-spacing 0.1em, text-secondary
  Body:           16px, text-primary
  Status label:   24–32px, bold, uppercase
  Date header:    14px, uppercase, letter-spacing 0.15em

SPACING:
  Page padding:   20px horizontal
  Card padding:   16px
  Card gap:       12px
  Section gap:    24px

INTERACTIONS:
  Swipe threshold:     40% of card width to trigger completion
  Swipe dead zone:     10px horizontal before gesture activates
  Long press duration: 500ms to trigger undo
  Snap animation:      200ms ease
  No other animations
  Tap targets:         minimum 44px

LAYOUT:
  Max width:      480px (centered on desktop)
  Bottom nav:     56px height, fixed
  Content:        scrollable, padded bottom for nav clearance
  Momentum bars:  top-right corner, 3 bars, ~6px wide, ~32px tall, 4px gap
```

---

## Constraints (Non-Negotiable)

- No routing library
- No state management library
- No backend
- No authentication
- No notifications
- No analytics
- No gamification
- No streak tracking
- No confetti, no celebrations
- No motivational quotes
- No feature creep
- localStorage only
- Recharts for charts
- Tailwind for styling
- Must be deployable as static site
- Must work as PWA (offline capable)
- App.tsx is a dumb shell — no persistence logic
- All domain references use DOMAINS config — no hardcoded domain strings
- Past days are always read-only — no retroactive edits after midnight
- Ghost days are real — missing key ≠ empty day

---

## Build Sequence

Build in this exact order. Do not skip ahead.

### Already built (v2):
1. ~~Project scaffold + theme + CSS variables + Google Fonts + layout shell + bottom nav~~
2. ~~Domain config file + type definitions~~
3. ~~Storage utilities~~
4. ~~Date utilities + useDateRollover hook~~
5. ~~DateHeader component~~
6. ~~DailyIntent component~~
7. ~~useSwipe hook~~
8. ~~DomainCard component with swipe-to-complete~~
9. ~~Full TodayScreen integration~~
10. ~~Velocity computation utility~~
11. ~~VelocityChart~~
12. ~~StatusLabel + DomainBreakdown~~
13. ~~Full VelocityScreen integration~~
14. ~~PWA manifest + service worker~~

### New (v3 refinements):
15. Update storage.ts: loadDay returns null for missing keys, add dayExists() and getMonday()
16. Update types: add DayState, update DayScore and WeeklyData
17. useLongPress hook (500ms hold-to-undo)
18. Update DomainCard: hold-to-undo replaces swipe-to-undo, task text locks on complete
19. MomentumBars component (3-day mini bars, top right of daily view)
20. Drift signal: compute per-domain 3-day miss streak, pass drifting prop to DomainCard
21. Update velocity.ts: Mon–Sun fixed week, three day states, ghost day exclusion from average
22. Update VelocityChart: proportional third-fill bars, ghost gaps, present-day outlines, future days excluded
23. Update StatusLabel: early-week dimming (Mon–Wed muted, Thu–Sun full color)
24. Update DomainBreakdown: denominator = non-ghost days, not always 7
25. Update tests to cover all new behavior