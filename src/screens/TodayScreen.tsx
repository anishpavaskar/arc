import { useState, useCallback, useEffect } from 'react';
import type { DayData, DomainKey } from '../types';
import { getToday } from '../utils/dates';
import { loadDay, saveDay } from '../utils/storage';
import { useDateRollover } from '../hooks/useDateRollover';
import { DOMAINS } from '../config/domains';
import DateHeader from '../components/DateHeader';
import DailyIntent from '../components/DailyIntent';
import DomainCard from '../components/DomainCard';

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [dayData, setDayData] = useState<DayData>(() => loadDay(getToday()));

  const today = useDateRollover(
    useCallback((newToday: string) => {
      setSelectedDate(newToday);
    }, []),
  );

  useEffect(() => {
    setDayData(loadDay(selectedDate));
  }, [selectedDate]);

  const isToday = selectedDate === today;

  function update(patch: Partial<DayData>) {
    setDayData((prev) => {
      const next = { ...prev, ...patch };
      saveDay(next);
      return next;
    });
  }

  return (
    <div style={{ padding: 'var(--page-padding)', paddingTop: 'var(--section-gap)', display: 'flex', flexDirection: 'column', gap: 'var(--section-gap)' }}>
      <span
        style={{
          fontFamily: 'var(--font-label)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
        }}
      >
        ARC
      </span>
      <DateHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        isToday={isToday}
      />
      <DailyIntent
        intent={dayData.intent}
        onChange={(intent) => update({ intent })}
        disabled={!isToday}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
        {DOMAINS.map((domain) => (
          <DomainCard
            key={domain.key}
            domainConfig={domain}
            data={dayData[domain.key]}
            onChange={(data) => update({ [domain.key]: data } as Partial<DayData>)}
            onComplete={() => {
              const current = dayData[domain.key];
              update({ [domain.key]: { ...current, done: !current.done } } as Partial<DayData>);
            }}
            disabled={!isToday}
          />
        ))}
      </div>
    </div>
  );
}
