import { getDateKey } from './storage';

export function getToday(): string {
  return getDateKey(new Date());
}

export function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `${day}, ${month} ${d}`;
}

export function getDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
