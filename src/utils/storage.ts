import type { DayData } from '../types';

export function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the Monday of the week containing the given date.
 * Monday = 1, Sunday = 0 (JS), so we shift accordingly.
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // if Sunday, go back 6 days
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function defaultDay(dateStr: string): DayData {
  return {
    date: dateStr,
    intent: '',
    committed: false,
    body: { task: '', done: false },
    build: { task: '', done: false },
    exposure: { task: '', done: false },
  };
}

/**
 * Returns true if a localStorage key exists for the given date.
 */
export function dayExists(dateStr: string): boolean {
  return localStorage.getItem(`arc-${dateStr}`) !== null;
}

/**
 * Loads day data from localStorage.
 * Returns null for missing keys (ghost days) — NOT a default object.
 */
export function loadDay(dateStr: string): DayData | null {
  try {
    const raw = localStorage.getItem(`arc-${dateStr}`);
    if (!raw) return null;
    return JSON.parse(raw) as DayData;
  } catch {
    return null;
  }
}

export function saveDay(data: DayData): void {
  localStorage.setItem(`arc-${data.date}`, JSON.stringify(data));
}
