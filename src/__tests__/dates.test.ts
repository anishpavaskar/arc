import { describe, it, expect } from 'vitest';
import { getToday, formatDisplayDate, getDayLabel } from '../utils/dates';

describe('getToday', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(getToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches current local date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getToday()).toBe(expected);
  });
});

describe('formatDisplayDate', () => {
  it('formats as "WEEKDAY, MON D"', () => {
    expect(formatDisplayDate('2026-03-03')).toBe('TUESDAY, MAR 3');
  });

  it('formats January correctly', () => {
    expect(formatDisplayDate('2026-01-01')).toBe('THURSDAY, JAN 1');
  });

  it('formats double-digit day', () => {
    expect(formatDisplayDate('2025-12-25')).toBe('THURSDAY, DEC 25');
  });
});

describe('getDayLabel', () => {
  it('returns short day name', () => {
    expect(getDayLabel('2026-03-03')).toBe('Tue');
  });

  it('returns Mon for a Monday', () => {
    expect(getDayLabel('2026-03-02')).toBe('Mon');
  });

  it('returns Sun for a Sunday', () => {
    expect(getDayLabel('2026-03-01')).toBe('Sun');
  });
});
