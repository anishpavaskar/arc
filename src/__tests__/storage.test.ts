import { describe, it, expect, beforeEach } from 'vitest';
import { getDateKey, loadDay, saveDay, dayExists, getMonday, defaultDay } from '../utils/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('getDateKey', () => {
  it('formats Date to YYYY-MM-DD', () => {
    expect(getDateKey(new Date(2026, 2, 3))).toBe('2026-03-03');
  });

  it('pads single-digit months and days', () => {
    expect(getDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('loadDay', () => {
  it('returns null for missing key (ghost day)', () => {
    const result = loadDay('2026-03-03');
    expect(result).toBeNull();
  });

  it('returns parsed DayData for existing key', () => {
    const data = {
      date: '2026-03-03',
      intent: 'Ship it',
      committed: false,
      body: { task: 'Run', done: true },
      build: { task: 'Code', done: false },
      exposure: { task: 'Call', done: true },
    };
    localStorage.setItem('arc-2026-03-03', JSON.stringify(data));
    expect(loadDay('2026-03-03')).toEqual(data);
  });

  it('returns null on corrupted JSON', () => {
    localStorage.setItem('arc-2026-03-03', '{broken json!!!');
    const result = loadDay('2026-03-03');
    expect(result).toBeNull();
  });

  it('returns null for empty string value', () => {
    localStorage.setItem('arc-2026-03-03', '');
    const result = loadDay('2026-03-03');
    expect(result).toBeNull();
  });
});

describe('saveDay', () => {
  it('writes DayData to localStorage', () => {
    const data = {
      date: '2026-03-03',
      intent: 'Focus',
      committed: false,
      body: { task: 'Gym', done: true },
      build: { task: 'Ship', done: false },
      exposure: { task: 'Dinner', done: false },
    };
    saveDay(data);
    expect(localStorage.getItem('arc-2026-03-03')).toBe(JSON.stringify(data));
  });

  it('roundtrips with loadDay', () => {
    const data = {
      date: '2026-01-15',
      intent: 'Test',
      committed: false,
      body: { task: 'A', done: true },
      build: { task: 'B', done: true },
      exposure: { task: 'C', done: false },
    };
    saveDay(data);
    expect(loadDay('2026-01-15')).toEqual(data);
  });
});

describe('dayExists', () => {
  it('returns false when no key exists', () => {
    expect(dayExists('2026-03-03')).toBe(false);
  });

  it('returns true when key exists', () => {
    localStorage.setItem('arc-2026-03-03', JSON.stringify({
      date: '2026-03-03',
      intent: '',
      committed: false,
      body: { task: '', done: false },
      build: { task: '', done: false },
      exposure: { task: '', done: false },
    }));
    expect(dayExists('2026-03-03')).toBe(true);
  });

  it('returns true even for present-but-empty day', () => {
    saveDay({
      date: '2026-03-03',
      intent: '',
      committed: false,
      body: { task: '', done: false },
      build: { task: '', done: false },
      exposure: { task: '', done: false },
    });
    expect(dayExists('2026-03-03')).toBe(true);
  });
});

describe('getMonday', () => {
  it('returns Monday for a Monday input', () => {
    // 2026-03-02 is a Monday
    const monday = getMonday(new Date(2026, 2, 2));
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(2); // March
    expect(monday.getDate()).toBe(2);
  });

  it('returns Monday for a Wednesday input', () => {
    // 2026-03-04 is a Wednesday, Monday is 2026-03-02
    const monday = getMonday(new Date(2026, 2, 4));
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(2);
    expect(monday.getDate()).toBe(2);
  });

  it('returns Monday for a Sunday input', () => {
    // 2026-03-08 is a Sunday, Monday of that week is 2026-03-02
    const monday = getMonday(new Date(2026, 2, 8));
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(2);
    expect(monday.getDate()).toBe(2);
  });

  it('returns Monday for a Saturday input', () => {
    // 2026-03-07 is a Saturday, Monday of that week is 2026-03-02
    const monday = getMonday(new Date(2026, 2, 7));
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(2);
    expect(monday.getDate()).toBe(2);
  });

  it('handles month boundary (Monday in previous month)', () => {
    // 2026-03-01 is a Sunday, Monday is 2026-02-23
    const monday = getMonday(new Date(2026, 2, 1));
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(1); // February
    expect(monday.getDate()).toBe(23);
  });

  it('zeroes out the time portion', () => {
    const monday = getMonday(new Date(2026, 2, 4, 15, 30, 45));
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
    expect(monday.getSeconds()).toBe(0);
    expect(monday.getMilliseconds()).toBe(0);
  });
});

describe('defaultDay', () => {
  it('creates a default DayData with given date', () => {
    const day = defaultDay('2026-03-03');
    expect(day).toEqual({
      date: '2026-03-03',
      intent: '',
      committed: false,
      body: { task: '', done: false },
      build: { task: '', done: false },
      exposure: { task: '', done: false },
    });
  });
});
