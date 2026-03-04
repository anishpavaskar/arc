import type { DayScore, DayState, DomainKey, VelocityStatus, WeeklyData } from '../types';
import { DOMAINS } from '../config/domains';
import { loadDay, getMonday, getDateKey } from './storage';
import { getToday, getDayLabel } from './dates';

/**
 * Computes weekly velocity data for the current Mon-Sun fixed week.
 *
 * - Week is Mon-Sun FIXED, not rolling 7 days
 * - Ghost days (no localStorage key) are EXCLUDED from average
 * - Present days (key exists, all done:false) are INCLUDED in average with score 0
 * - Active days (1+ done:true) are INCLUDED in average with their score
 */
export function computeWeeklyData(): WeeklyData {
  const todayStr = getToday();
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const todayDate = new Date(ty, tm - 1, td);

  const monday = getMonday(todayDate);

  // Determine dayOfWeek: 1=Mon, 7=Sun
  const todayJsDay = todayDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const dayOfWeek = todayJsDay === 0 ? 7 : todayJsDay;

  const domainCounts = Object.fromEntries(
    DOMAINS.map((dom) => [dom.key, 0]),
  ) as Record<DomainKey, number>;

  let sum = 0;
  let nonGhostCount = 0;
  const days: DayScore[] = [];

  // Iterate Mon through Sun, but only up to today
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    // Skip future days
    if (date > todayDate) break;

    const dateStr = getDateKey(date);
    const dayData = loadDay(dateStr);

    let score = 0;
    let state: DayState;

    if (dayData === null) {
      // Ghost day -- no localStorage key exists
      state = 'ghost';
    } else {
      // Key exists -- check if any domain is done
      let anyDone = false;
      for (const domain of DOMAINS) {
        if (dayData[domain.key].done) {
          score++;
          domainCounts[domain.key]++;
          anyDone = true;
        }
      }
      state = anyDone ? 'active' : 'present';
    }

    if (state !== 'ghost') {
      sum += score;
      nonGhostCount++;
    }

    days.push({
      date: dateStr,
      label: getDayLabel(dateStr),
      score,
      state,
    });
  }

  const average = nonGhostCount > 0 ? sum / nonGhostCount : 0;

  let status: VelocityStatus;
  if (average >= 2.5) status = 'LOCKED IN';
  else if (average >= 1.5) status = 'MOVING';
  else if (average >= 0.5) status = 'DRAG DETECTED';
  else status = 'FLATLINE';

  return { days, average, status, domainCounts, dayOfWeek };
}
