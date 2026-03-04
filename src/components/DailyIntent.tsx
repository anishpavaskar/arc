import { useRef, useEffect, useCallback } from 'react';

const HOLD_DURATION = 500;
const MOVE_THRESHOLD = 10;

interface DailyIntentProps {
  intent: string;
  onChange: (value: string) => void;
  disabled: boolean;
  committed: boolean;
  onCommit: () => void;
}

export default function DailyIntent({ intent, onChange, disabled, committed, onCommit }: DailyIntentProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const canCommit = !disabled && !committed && intent.trim().length > 0;
  const canCommitRef = useRef(canCommit);
  canCommitRef.current = canCommit;
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el || disabled || committed) return;

    function onPointerDown(clientX: number, clientY: number) {
      if (!canCommitRef.current) return;
      startXRef.current = clientX;
      startYRef.current = clientY;
      timerRef.current = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(50);
        onCommitRef.current();
      }, HOLD_DURATION);
    }

    function onPointerMove(clientX: number, clientY: number) {
      if (timerRef.current === null) return;
      const dx = Math.abs(clientX - startXRef.current);
      const dy = Math.abs(clientY - startYRef.current);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function onPointerUp() {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      onPointerDown(e.clientX, e.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();
    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    const handleTouchEnd = () => onPointerUp();

    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      clearTimer();
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, committed, clearTimer]);

  return (
    <div ref={elRef} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="text"
        inputMode="text"
        enterKeyHint="done"
        autoComplete="off"
        value={intent}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || committed}
        placeholder="What is today's intent?"
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          borderBottom: `1px solid ${committed ? 'var(--gold)' : 'var(--border-inactive)'}`,
          outline: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          color: 'var(--text-primary)',
          padding: '12px 0',
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {committed && (
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ minWidth: 14 }}>
          <rect x="1" y="7" width="12" height="8" rx="2" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
          <path d="M4 7V5a3 3 0 0 1 6 0v2" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}
