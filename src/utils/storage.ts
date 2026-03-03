import type { DayData } from '../types';

export function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function defaultDay(dateStr: string): DayData {
  return {
    date: dateStr,
    intent: '',
    body: { task: '', done: false },
    build: { task: '', done: false },
    exposure: { task: '', done: false },
  };
}

export function loadDay(dateStr: string): DayData {
  try {
    const raw = localStorage.getItem(`arc-${dateStr}`);
    if (!raw) return defaultDay(dateStr);
    return JSON.parse(raw) as DayData;
  } catch {
    return defaultDay(dateStr);
  }
}

export function saveDay(data: DayData): void {
  localStorage.setItem(`arc-${data.date}`, JSON.stringify(data));
}
