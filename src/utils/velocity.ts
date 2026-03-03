import type { DomainKey, VelocityStatus, WeeklyData } from '../types';
import { DOMAINS } from '../config/domains';
import { loadDay } from './storage';
import { getToday, getDayLabel } from './dates';

export function computeWeeklyData(): WeeklyData {
  const todayStr = getToday();
  const [y, m, d] = todayStr.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);

  const domainCounts = Object.fromEntries(
    DOMAINS.map((dom) => [dom.key, 0]),
  ) as Record<DomainKey, number>;

  let sum = 0;
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayDate);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayData = loadDay(dateStr);

    let score = 0;
    for (const domain of DOMAINS) {
      if (dayData[domain.key].done) {
        score++;
        domainCounts[domain.key]++;
      }
    }

    sum += score;
    days.push({ date: dateStr, label: getDayLabel(dateStr), score });
  }

  const average = sum / 7;

  let status: VelocityStatus;
  if (average >= 2.5) status = 'LOCKED IN';
  else if (average >= 1.5) status = 'MOVING';
  else if (average >= 0.5) status = 'DRAG DETECTED';
  else status = 'FLATLINE';

  return { days, average, status, domainCounts };
}
