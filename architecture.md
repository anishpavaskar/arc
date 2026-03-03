# ARC — Architecture Document (v2)

## What This Is
Arc is a personal velocity system. Two screens, local storage, no backend. You use it twice a day: morning to commit, evening to verify.

---

## User Flow (Three Moments)

```
MORNING CHECK-IN (Commitment)
──────────────────────────────
Open app → Today screen
Set 3 tasks (one per domain: BODY, BUILD, EXPOSURE)
Optional: type one-line intent
Close app. 30 seconds.

EVENING LOG (Completion)
──────────────────────────────
Open app → same Today screen
Swipe RIGHT on each completed card → fills gold
Can undo same day by swiping left
Locked after midnight. No retroactive edits.
Close app. 10 seconds.

WEEKLY CHECK (Trajectory)
──────────────────────────────
Sunday → tap Velocity tab
See 7-day chart, weekly state, per-domain breakdown
No interaction needed. Just read. Adjust next week.
```

This is the entire product. Three moments, three purposes: declare, verify, reflect.

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
│   │   ├── dates.ts              # Date formatting, key generation, today check
│   │   └── velocity.ts           # Weekly computation logic
│   │
│   ├── hooks/
│   │   ├── useDateRollover.ts    # Midnight detection (interval + visibilitychange)
│   │   └── useSwipe.ts           # Swipe gesture detection for domain cards
│   │
│   ├── components/
│   │   ├── BottomNav.tsx          # Fixed bottom tab bar
│   │   ├── DateHeader.tsx         # Date display + navigation arrows
│   │   ├── DailyIntent.tsx        # Single-line intent input
│   │   ├── DomainCard.tsx         # Reusable card with swipe-to-complete
│   │   ├── VelocityChart.tsx      # 7-day bar chart (Recharts)
│   │   ├── StatusLabel.tsx        # LOCKED IN / MOVING / etc.
│   │   └── DomainBreakdown.tsx    # Per-domain X/7 progress bars
│   │
│   └── screens/
│       ├── TodayScreen.tsx        # Composes: DateHeader + DailyIntent + 3x DomainCard
│       └── VelocityScreen.tsx     # Composes: StatusLabel + VelocityChart + DomainBreakdown
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

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

Use `DOMAINS` everywhere: rendering cards, computing scores, building breakdowns. Never hardcode `'body'`, `'build'`, or `'exposure'` as strings outside of this file and the type definition.

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

export interface DayScore {
  date: string;          // "YYYY-MM-DD"
  label: string;         // "Mon", "Tue", etc.
  score: number;         // 0–3
}

export interface WeeklyData {
  days: DayScore[];
  average: number;
  status: VelocityStatus;
  domainCounts: Record<DomainKey, number>;  // each 0–7
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

Swipes card right      →  useSwipe detects horizontal drag past threshold
(evening)              →  DomainCard fires onComplete
                       →  TodayScreen updates domain.done = true
                       →  TodayScreen calls saveDay()
                       →  Card fills muted gold

Swipes card left       →  useSwipe detects reverse drag
(undo, same day)       →  DomainCard fires onComplete
                       →  TodayScreen updates domain.done = false
                       →  TodayScreen calls saveDay()
                       →  Card returns to default surface

Types intent           →  DailyIntent.onChange
                       →  TodayScreen updates local state
                       →  TodayScreen calls saveDay()
                       →  localStorage writes

Navigates date         →  DateHeader.onDateChange
                       →  TodayScreen calls loadDay(newDate)
                       →  Local state updates, UI re-renders

Opens Velocity tab     →  VelocityScreen mounts
                       →  computeWeeklyData() reads last 7 days
                       →  Returns WeeklyData object
                       →  StatusLabel, VelocityChart, DomainBreakdown render

Midnight rollover      →  useDateRollover hook detects date change
                       →  selectedDate snaps to new today
                       →  TodayScreen reloads with fresh day
```

**Key rule:** App.tsx is a dumb shell. It holds `screen` state and renders the active screen + BottomNav. All persistence logic lives in the screens, not the shell.

---

## Swipe-to-Complete Interaction

```ts
// src/hooks/useSwipe.ts
//
// Custom hook that attaches touch/mouse listeners to a card element
// and detects horizontal swipe gestures.
//
// BEHAVIOR:
// - Track touchstart/mousedown X position
// - On touchmove/mousemove, calculate horizontal delta
// - Only activate swipe if horizontal delta > 10px (prevents conflict with tapping/typing)
// - Card element follows the finger (translateX) during drag
// - If dragged past 40% of card width → snap to complete (or uncomplete if reverse)
// - If not past threshold → snap back to origin
// - Snap animation: 200ms ease
//
// DIRECTION:
// - Swipe RIGHT on incomplete card → marks done
// - Swipe LEFT on complete card → marks undone
// - Swipe RIGHT on already-complete card → no-op
// - Swipe LEFT on incomplete card → no-op
//
// CONFLICT PREVENTION:
// - Tapping the task input field does NOT trigger swipe
// - Only horizontal movement beyond 10px dead zone initiates gesture
// - Vertical scrolling is not hijacked — if vertical delta > horizontal delta, cancel swipe
//
// DISABLED STATE:
// - When disabled (past day), swipe listeners are not attached
// - Cards are visually dimmed and non-interactive
```

### Card Visual States

```
INCOMPLETE (default):
  Background: #1A1A1A (surface)
  Border-left: 3px solid #333333
  Task text: #F5F5F0
  Label: #888888 uppercase

COMPLETE (after swipe right):
  Background: rgba(201, 168, 76, 0.15) — muted gold at 15% opacity
  Border-left: 3px solid #C9A84C
  Small gold checkmark icon on the right side
  Task text: #F5F5F0 (unchanged)
  Label: #C9A84C (gold)

DRAGGING (during swipe):
  Card translates horizontally following finger
  Background begins transitioning toward gold tint
  200ms ease snap on release

DISABLED (past day):
  Opacity: 0.5
  No swipe listeners attached
  pointerEvents: none on toggle areas
  Task text still visible but not editable
```

---

## Midnight Rollover Logic

```ts
// src/hooks/useDateRollover.ts

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
// The hook returns the current "today" string (YYYY-MM-DD).
// When today changes, it updates and triggers a callback.
//
// Usage in TodayScreen:
//   const today = useDateRollover((newToday) => {
//     setSelectedDate(newToday);  // snap back to today
//   });
```

**"Today" is always derived from `new Date()` formatted to local YYYY-MM-DD.** No timezone trickery. No server time. Just the user's local clock.

When the day flips (whether at midnight or when returning to a backgrounded tab), `selectedDate` automatically snaps to the new today. The user always lands on the current day. All cards lock — no retroactive edits.

---

## Storage Layer

```
KEY PATTERN:  "arc-YYYY-MM-DD"
STORAGE:      localStorage (browser)

Operations:
  loadDay(dateStr)  →  reads key, parses JSON, returns DayData (or default empty)
  saveDay(data)     →  stringifies DayData, writes to key
  getDateKey(date)  →  converts Date object to "YYYY-MM-DD" string
```

Default empty DayData (returned when key doesn't exist):

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
│   ├── DateHeader.tsx (selectedDate, onDateChange, isToday)
│   ├── DailyIntent.tsx (intent, onChange, disabled)
│   ├── DomainCard.tsx × 3 (domain config, data, onChange, onComplete, disabled)
│   │   └── mapped from DOMAINS config array
│   │   └── uses: useSwipe hook for gesture detection
│   │
│   ├── uses: storage.ts, dates.ts, useDateRollover.ts
│   └── uses: DOMAINS from config/domains.ts
│
└── VelocityScreen.tsx (computes weekly data on mount)
    ├── StatusLabel.tsx (status, average)
    ├── VelocityChart.tsx (days[])
    ├── DomainBreakdown.tsx (domainCounts)
    │
    ├── uses: velocity.ts, storage.ts, dates.ts
    └── uses: DOMAINS from config/domains.ts
```

---

## Velocity Computation Logic

```
INPUT:  Last 7 days of DayData from localStorage

STEP 1: For each of the last 7 days, load DayData from localStorage.
        For each day, iterate DOMAINS config and count where done === true.
        → score per day = 0, 1, 2, or 3

STEP 2: Compute average of all 7 scores.
        → average = sum / 7

STEP 3: Map average to status:
        2.5–3.0  →  "LOCKED IN"
        1.5–2.4  →  "MOVING"
        0.5–1.4  →  "DRAG DETECTED"
        0.0–0.4  →  "FLATLINE"

STEP 4: Count per-domain completions across 7 days:
        Iterate DOMAINS config. For each domain key, count days where
        that domain's done === true.
        → Record<DomainKey, number> (each 0–7)

OUTPUT: WeeklyData { days, average, status, domainCounts }
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
  --text-primary:    #F5F5F0    (main text)
  --text-secondary:  #888888    (labels, placeholders, inactive)
  --border-inactive: #333333    (card borders, empty states, 1/3 bars)

TYPOGRAPHY:
  Font family:    "DM Sans" (body), "Instrument Sans" (labels/headings)
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
  Snap animation:      200ms ease
  No other animations
  Tap targets:         minimum 44px

LAYOUT:
  Max width:      480px (centered on desktop)
  Bottom nav:     56px height, fixed
  Content:        scrollable, padded bottom for nav clearance
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
- No feature creep
- localStorage only
- Recharts for charts
- Tailwind for styling
- Must be deployable as static site
- Must work as PWA (offline capable)
- App.tsx is a dumb shell — no persistence logic
- All domain references use DOMAINS config — no hardcoded domain strings
- Past days are always read-only — no retroactive edits after midnight

---

## Build Sequence

Build in this exact order. Do not skip ahead.

1. Project scaffold + theme + CSS variables + Google Fonts + layout shell + bottom nav
2. Domain config file + type definitions
3. Storage utilities (loadDay, saveDay, getDateKey)
4. Date utilities + useDateRollover hook
5. DateHeader component with navigation
6. DailyIntent component with persistence
7. useSwipe hook (gesture detection)
8. DomainCard component with swipe-to-complete (reusable, mapped from DOMAINS config)
9. Full TodayScreen integration (all pieces wired, persistence working, read-only past days)
10. Velocity computation utility
11. VelocityChart (Recharts bar chart)
12. StatusLabel + DomainBreakdown
13. Full VelocityScreen integration
14. PWA manifest + service worker + final polish