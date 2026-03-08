import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { DayData } from '../types';

function makeDay(dateStr: string, body: boolean, build: boolean, exposure: boolean): DayData {
  return {
    date: dateStr,
    intent: '',
    committed: false,
    body: { task: 'b', done: body, weight: null },
    build: { task: 'b', done: build, weight: null },
    exposure: { task: 'e', done: exposure, weight: null },
  };
}

/**
 * Returns Mon-Sun date strings for the week containing a given date.
 * The date parameter should be a "YYYY-MM-DD" string.
 */
function getWeekDates(todayStr: string): string[] {
  const [y, m, d] = todayStr.split('-').map(Number);
  const today = new Date(y, m - 1, d);
  const day = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(monday.getDate() + diff);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setDate(dt.getDate() + i);
    dates.push(
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
    );
  }
  return dates;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('computeWeeklyData (v3 — Mon-Sun fixed week)', () => {
  // We mock getToday to control what "today" is so tests are deterministic.
  // We use a Wednesday (2026-03-04) for most tests.
  // Week: Mon 2026-03-02 through Sun 2026-03-08
  const FIXED_TODAY = '2026-03-04'; // Wednesday
  const WEEK = getWeekDates(FIXED_TODAY); // Mon-Sun dates

  async function loadVelocity() {
    // Mock getToday in the dates module which velocity.ts imports
    vi.doMock('../utils/dates', async () => {
      const actual = await vi.importActual<typeof import('../utils/dates')>('../utils/dates');
      return {
        ...actual,
        getToday: () => FIXED_TODAY,
      };
    });
    const { computeWeeklyData } = await import('../utils/velocity');
    return computeWeeklyData();
  }

  // Helper that loads with a custom "today"
  async function loadVelocityOn(today: string) {
    vi.doMock('../utils/dates', async () => {
      const actual = await vi.importActual<typeof import('../utils/dates')>('../utils/dates');
      return {
        ...actual,
        getToday: () => today,
      };
    });
    const mod = await import('../utils/velocity');
    return mod.computeWeeklyData();
  }

  afterEach(() => {
    vi.resetModules();
  });

  it('returns FLATLINE with average 0 when no data exists (all ghost days)', async () => {
    const result = await loadVelocity();
    expect(result.status).toBe('FLATLINE');
    expect(result.average).toBe(0);
    // On Wednesday, only Mon-Wed should be included (future days excluded)
    expect(result.days.length).toBeLessThanOrEqual(7);
    // All days should be ghost
    result.days.forEach((d) => expect(d.state).toBe('ghost'));
    expect(result.domainCounts.body).toBe(0);
    expect(result.domainCounts.build).toBe(0);
    expect(result.domainCounts.exposure).toBe(0);
  });

  it('includes dayOfWeek in output (1=Mon, 7=Sun)', async () => {
    // Wednesday = dayOfWeek 3
    const result = await loadVelocity();
    expect(result.dayOfWeek).toBe(3);
  });

  it('dayOfWeek is 1 on Monday', async () => {
    const result = await loadVelocityOn('2026-03-02'); // Monday
    expect(result.dayOfWeek).toBe(1);
  });

  it('dayOfWeek is 7 on Sunday', async () => {
    const result = await loadVelocityOn('2026-03-08'); // Sunday
    expect(result.dayOfWeek).toBe(7);
  });

  it('only includes days up to today (excludes future)', async () => {
    // Wednesday = 3rd day of week → should have Mon, Tue, Wed = 3 days
    const result = await loadVelocity();
    // days array should only contain Mon through Wed
    const dayDates = result.days.map((d) => d.date);
    expect(dayDates).toContain(WEEK[0]); // Mon
    expect(dayDates).toContain(WEEK[1]); // Tue
    expect(dayDates).toContain(WEEK[2]); // Wed
    expect(dayDates).not.toContain(WEEK[3]); // Thu (future)
    expect(dayDates).not.toContain(WEEK[6]); // Sun (future)
  });

  it('ghost days are excluded from average calculation', async () => {
    // Mon and Tue are ghost. Wed has 2/3 done.
    // Average should be 2.0 (only Wed counted), not 2/3.
    localStorage.setItem(`arc-${WEEK[2]}`, JSON.stringify(makeDay(WEEK[2], true, true, false)));

    const result = await loadVelocity();
    expect(result.average).toBe(2);
    expect(result.status).toBe('MOVING'); // 2.0 is in 1.5-2.4 range
  });

  it('3 active days averaging 2.0 with 4 ghost days yields average 2.0 not 6/7', async () => {
    // Full week scenario (Sunday) — 3 active days (score 2 each), 4 ghost days
    const sundayWeek = getWeekDates('2026-03-08');
    // Active on Mon, Wed, Fri (each 2/3)
    localStorage.setItem(`arc-${sundayWeek[0]}`, JSON.stringify(makeDay(sundayWeek[0], true, true, false)));
    localStorage.setItem(`arc-${sundayWeek[2]}`, JSON.stringify(makeDay(sundayWeek[2], true, true, false)));
    localStorage.setItem(`arc-${sundayWeek[4]}`, JSON.stringify(makeDay(sundayWeek[4], true, true, false)));

    const result = await loadVelocityOn('2026-03-08');
    // sum = 6, non-ghost count = 3, average = 6/3 = 2.0
    expect(result.average).toBe(2);
    expect(result.status).toBe('MOVING');
  });

  it('present days (key exists, all done:false) have state "present" and score 0, included in average', async () => {
    // Mon has key but all done:false → present day
    localStorage.setItem(`arc-${WEEK[0]}`, JSON.stringify(makeDay(WEEK[0], false, false, false)));

    const result = await loadVelocity();
    const monDay = result.days.find((d) => d.date === WEEK[0]);
    expect(monDay).toBeDefined();
    expect(monDay!.state).toBe('present');
    expect(monDay!.score).toBe(0);
  });

  it('present day counts in average denominator', async () => {
    // Mon is present (score 0), Tue is ghost, Wed has 3/3 (score 3)
    localStorage.setItem(`arc-${WEEK[0]}`, JSON.stringify(makeDay(WEEK[0], false, false, false)));
    localStorage.setItem(`arc-${WEEK[2]}`, JSON.stringify(makeDay(WEEK[2], true, true, true)));

    const result = await loadVelocity();
    // non-ghost count = 2 (Mon + Wed), sum = 0 + 3 = 3, average = 3/2 = 1.5
    expect(result.average).toBe(1.5);
    expect(result.status).toBe('MOVING');
  });

  it('active days have state "active"', async () => {
    localStorage.setItem(`arc-${WEEK[0]}`, JSON.stringify(makeDay(WEEK[0], true, false, false)));

    const result = await loadVelocity();
    const monDay = result.days.find((d) => d.date === WEEK[0]);
    expect(monDay).toBeDefined();
    expect(monDay!.state).toBe('active');
    expect(monDay!.score).toBe(1);
  });

  it('returns LOCKED IN when non-ghost average is >= 2.5', async () => {
    // All 3 days (Mon-Wed) have 3/3 → average = 3.0
    for (let i = 0; i <= 2; i++) {
      localStorage.setItem(`arc-${WEEK[i]}`, JSON.stringify(makeDay(WEEK[i], true, true, true)));
    }

    const result = await loadVelocity();
    expect(result.average).toBe(3);
    expect(result.status).toBe('LOCKED IN');
  });

  it('returns DRAG DETECTED for average between 0.5 and 1.4', async () => {
    // Mon has 1/3, Tue has 1/3 → sum = 2, count = 2, avg = 1.0
    localStorage.setItem(`arc-${WEEK[0]}`, JSON.stringify(makeDay(WEEK[0], true, false, false)));
    localStorage.setItem(`arc-${WEEK[1]}`, JSON.stringify(makeDay(WEEK[1], true, false, false)));

    const result = await loadVelocity();
    expect(result.average).toBe(1);
    expect(result.status).toBe('DRAG DETECTED');
  });

  it('returns FLATLINE for average between 0.0 and 0.4', async () => {
    // Mon and Tue are present (score 0 each) → avg = 0/2 = 0
    localStorage.setItem(`arc-${WEEK[0]}`, JSON.stringify(makeDay(WEEK[0], false, false, false)));
    localStorage.setItem(`arc-${WEEK[1]}`, JSON.stringify(makeDay(WEEK[1], false, false, false)));

    const result = await loadVelocity();
    expect(result.average).toBe(0);
    expect(result.status).toBe('FLATLINE');
  });

  it('computes correct domainCounts for non-ghost days only', async () => {
    // Mon: body done, build done, exposure not → body=1, build=1
    // Tue: ghost (no key)
    // Wed: body done, build not, exposure done → body=1, exposure=1
    localStorage.setItem(`arc-${WEEK[0]}`, JSON.stringify(makeDay(WEEK[0], true, true, false)));
    localStorage.setItem(`arc-${WEEK[2]}`, JSON.stringify(makeDay(WEEK[2], true, false, true)));

    const result = await loadVelocity();
    expect(result.domainCounts.body).toBe(2);
    expect(result.domainCounts.build).toBe(1);
    expect(result.domainCounts.exposure).toBe(1);
  });

  it('each day has date, label, score, and state', async () => {
    localStorage.setItem(`arc-${WEEK[0]}`, JSON.stringify(makeDay(WEEK[0], true, false, false)));

    const result = await loadVelocity();
    result.days.forEach((d) => {
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.label).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
      expect(typeof d.score).toBe('number');
      expect(['ghost', 'present', 'active']).toContain(d.state);
    });
  });

  it('days array uses Mon-Sun labels in correct order', async () => {
    // Sunday — full week visible
    const sundayWeek = getWeekDates('2026-03-08');
    for (const dateStr of sundayWeek) {
      localStorage.setItem(`arc-${dateStr}`, JSON.stringify(makeDay(dateStr, true, true, true)));
    }

    const result = await loadVelocityOn('2026-03-08');
    const labels = result.days.map((d) => d.label);
    expect(labels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('full week with all 3/3 on 7 days: average=3, LOCKED IN', async () => {
    const sundayWeek = getWeekDates('2026-03-08');
    for (const dateStr of sundayWeek) {
      localStorage.setItem(`arc-${dateStr}`, JSON.stringify(makeDay(dateStr, true, true, true)));
    }

    const result = await loadVelocityOn('2026-03-08');
    expect(result.average).toBe(3);
    expect(result.status).toBe('LOCKED IN');
    expect(result.domainCounts.body).toBe(7);
    expect(result.domainCounts.build).toBe(7);
    expect(result.domainCounts.exposure).toBe(7);
  });
});
