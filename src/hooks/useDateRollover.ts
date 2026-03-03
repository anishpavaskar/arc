import { useEffect, useRef, useState } from 'react';
import { getToday } from '../utils/dates';

export function useDateRollover(onDateChange: (newToday: string) => void): string {
  const [today, setToday] = useState(getToday);
  const todayRef = useRef(today);

  useEffect(() => {
    todayRef.current = today;
  }, [today]);

  useEffect(() => {
    function check() {
      const now = getToday();
      if (now !== todayRef.current) {
        todayRef.current = now;
        setToday(now);
        onDateChange(now);
      }
    }

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, 60_000);

    function onVisibility() {
      if (document.visibilityState === 'visible') check();
    }

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onDateChange]);

  return today;
}
