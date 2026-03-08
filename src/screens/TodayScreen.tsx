import { useState, useCallback, useEffect, useMemo } from 'react';
import type { DayData, DayScore, DomainKey, TaskWeight } from '../types';
import { getToday } from '../utils/dates';
import { loadDay, saveDay, defaultDay, getDateKey } from '../utils/storage';
import { useDateRollover } from '../hooks/useDateRollover';
import { DOMAINS } from '../config/domains';
import DateHeader from '../components/DateHeader';
import DailyIntent from '../components/DailyIntent';
import DomainCard from '../components/DomainCard';
import MomentumBars from '../components/MomentumBars';
import WeightPopup from '../components/WeightPopup';

/**
 * Ensures we always have a DayData to render.
 * For today: creates a default if null (ghost), but does NOT save until user interacts.
 * For past days: returns the stored data or a read-only default for ghost days.
 */
function loadOrDefault(dateStr: string): DayData {
  const data = loadDay(dateStr);
  return data ?? defaultDay(dateStr);
}

/**
 * Compute last 3 days' DayScores for MomentumBars (not including today).
 */
function computeLast3Days(todayStr: string): DayScore[] {
  const [y, m, d] = todayStr.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);
  const result: DayScore[] = [];

  for (let i = 3; i >= 1; i--) {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() - i);
    const dateStr = getDateKey(date);
    const dayData = loadDay(dateStr);
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

    if (dayData === null) {
      result.push({ date: dateStr, label: dayLabel, score: 0, state: 'ghost' });
    } else {
      let score = 0;
      let anyDone = false;
      for (const domain of DOMAINS) {
        if (dayData[domain.key].done) {
          score++;
          anyDone = true;
        }
      }
      result.push({
        date: dateStr,
        label: dayLabel,
        score,
        state: anyDone ? 'active' : 'present',
      });
    }
  }

  return result;
}

/**
 * Compute drift signal per domain.
 * A domain is drifting if it was NOT done for all of the last 3 days
 * (ghost or present-but-not-done counts as missed).
 * Edge case: if fewer than 3 prior days exist, no drift.
 */
function computeDrift(todayStr: string): Record<DomainKey, boolean> {
  const [y, m, d] = todayStr.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);
  const drift: Record<DomainKey, boolean> = { body: false, build: false, exposure: false };

  // Need at least 3 prior days to have drift
  const priorDays: (DayData | null)[] = [];
  for (let i = 3; i >= 1; i--) {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() - i);
    const dateStr = getDateKey(date);
    priorDays.push(loadDay(dateStr));
  }

  // If we don't have 3 prior days of data history, no drift
  if (priorDays.length < 3) return drift;

  for (const domain of DOMAINS) {
    const allMissed = priorDays.every((dayData) => {
      if (dayData === null) return true; // ghost day = missed
      return !dayData[domain.key].done;  // present but not done = missed
    });
    drift[domain.key] = allMissed;
  }

  return drift;
}

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [dayData, setDayData] = useState<DayData>(() => loadOrDefault(getToday()));
  // Which domain is awaiting weight selection (popup visible)
  const [pendingWeight, setPendingWeight] = useState<DomainKey | null>(null);

  const today = useDateRollover(
    useCallback((newToday: string) => {
      setSelectedDate(newToday);
    }, []),
  );

  useEffect(() => {
    setDayData(loadOrDefault(selectedDate));
  }, [selectedDate]);

  const isToday = selectedDate === today;

  // Compute MomentumBars data for last 3 days
  const last3Days = useMemo(() => computeLast3Days(today), [today]);

  // Compute drift signal per domain
  const drift = useMemo(() => computeDrift(today), [today, dayData]);

  function update(patch: Partial<DayData>) {
    setDayData((prev) => {
      const next = { ...prev, ...patch };
      saveDay(next);
      return next;
    });
  }

  function handleWeightSelect(domainKey: DomainKey, weight: TaskWeight) {
    const current = dayData[domainKey];
    update({ [domainKey]: { ...current, done: true, weight } } as Partial<DayData>);
    setPendingWeight(null);
  }

  return (
    <div style={{ padding: 'var(--page-padding)', display: 'flex', flexDirection: 'column' }}>
      {/* Top row: ARC label + MomentumBars */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
        <span
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.2em',
            fontVariant: 'small-caps',
            color: 'var(--gold)',
          }}
        >
          ARC
        </span>
        <MomentumBars last3Days={last3Days} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <DateHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          isToday={isToday}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <DailyIntent
          intent={dayData.intent}
          onChange={(intent) => update({ intent })}
          disabled={!isToday}
          committed={dayData.committed ?? false}
          onCommit={() => update({ committed: true })}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DOMAINS.map((domain) => (
          <DomainCard
            key={domain.key}
            domainConfig={domain}
            data={dayData[domain.key]}
            onChange={(data) => update({ [domain.key]: data } as Partial<DayData>)}
            onComplete={(done) => {
              if (done) {
                // Show weight popup instead of immediately completing
                setPendingWeight(domain.key);
              } else {
                // Undo — clear weight too
                const current = dayData[domain.key];
                update({ [domain.key]: { ...current, done: false, weight: null } } as Partial<DayData>);
              }
            }}
            disabled={!isToday}
            drifting={isToday && drift[domain.key]}
            committed={dayData.committed ?? false}
            popup={pendingWeight === domain.key ? (
              <WeightPopup onSelect={(w) => handleWeightSelect(domain.key, w)} />
            ) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
