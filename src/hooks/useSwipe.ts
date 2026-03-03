import { useRef, useEffect, useCallback } from 'react';

interface UseSwipeOptions {
  onSwipeComplete: () => void;
  disabled: boolean;
  done: boolean;
}

const DEAD_ZONE = 10;
const THRESHOLD_RATIO = 0.4;
const SNAP_MS = 200;

export function useSwipe({ onSwipeComplete, disabled, done }: UseSwipeOptions) {
  const cardRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    startX: 0,
    startY: 0,
    dragging: false,
    activated: false,
    cancelled: false,
  });

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    const s = stateRef.current;
    s.startX = clientX;
    s.startY = clientY;
    s.dragging = true;
    s.activated = false;
    s.cancelled = false;

    const el = cardRef.current;
    if (el) el.style.transition = 'none';
  }, [disabled]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const s = stateRef.current;
    if (!s.dragging || s.cancelled) return;

    const dx = clientX - s.startX;
    const dy = clientY - s.startY;

    // If vertical exceeds horizontal before activation, cancel swipe
    if (!s.activated && Math.abs(dy) > Math.abs(dx)) {
      s.cancelled = true;
      s.dragging = false;
      const el = cardRef.current;
      if (el) {
        el.style.transition = `transform ${SNAP_MS}ms ease`;
        el.style.transform = 'translateX(0)';
      }
      return;
    }

    // Dead zone check
    if (!s.activated && Math.abs(dx) < DEAD_ZONE) return;

    // Filter: only allow valid direction
    // Right swipe (dx > 0) only if not done. Left swipe (dx < 0) only if done.
    if (!s.activated) {
      if (dx > 0 && done) return; // already done, right swipe = no-op
      if (dx < 0 && !done) return; // not done, left swipe = no-op
      s.activated = true;
    }

    const el = cardRef.current;
    if (el) el.style.transform = `translateX(${dx}px)`;
  }, [done, disabled]);

  const handleEnd = useCallback((clientX: number) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    s.dragging = false;

    const el = cardRef.current;
    if (!el) return;

    el.style.transition = `transform ${SNAP_MS}ms ease`;

    if (!s.activated) {
      el.style.transform = 'translateX(0)';
      return;
    }

    const dx = clientX - s.startX;
    const width = el.offsetWidth;
    const pastThreshold = Math.abs(dx) > width * THRESHOLD_RATIO;

    if (pastThreshold) {
      // Snap to 0 and fire callback
      el.style.transform = 'translateX(0)';
      onSwipeComplete();
    } else {
      // Snap back
      el.style.transform = 'translateX(0)';
    }
  }, [onSwipeComplete]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || disabled) return;

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      handleStart(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
      // Prevent page scroll while swiping card
      if (stateRef.current.activated) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      handleEnd(t.clientX);
    };

    // Mouse events (desktop fallback)
    const onMouseDown = (e: MouseEvent) => {
      // Don't initiate swipe from input elements
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      handleStart(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = (e: MouseEvent) => {
      handleEnd(e.clientX);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [disabled, handleStart, handleMove, handleEnd]);

  return cardRef;
}
