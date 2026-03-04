import { useRef, useEffect, useCallback } from 'react';

interface UseLongPressOptions {
  onUndo: () => void;
  disabled: boolean;
  done: boolean;
}

const HOLD_DURATION = 500;
const MOVE_THRESHOLD = 10;

/**
 * Detects press-and-hold gesture (500ms) for undoing completion.
 * Only active on completed cards (done === true). No-op on incomplete.
 * Disabled on past days.
 * Returns a ref callback to attach to the card element.
 */
export function useLongPress({ onUndo, disabled, done }: UseLongPressOptions) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(done);
  doneRef.current = done;
  const callbackRef = useRef(onUndo);
  callbackRef.current = onUndo;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const firedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el || disabled) return;

    function onPointerDown(clientX: number, clientY: number) {
      // Only active on completed cards
      if (!doneRef.current) return;

      startXRef.current = clientX;
      startYRef.current = clientY;
      firedRef.current = false;

      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        callbackRef.current();
      }, HOLD_DURATION);
    }

    function onPointerMove(clientX: number, clientY: number) {
      if (timerRef.current === null) return;

      const dx = Math.abs(clientX - startXRef.current);
      const dy = Math.abs(clientY - startYRef.current);

      // Cancel if finger moved too far (was a swipe)
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
      onPointerDown(e.clientX, e.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      onPointerUp();
    };

    const handleTouchStart = (e: TouchEvent) => {
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchEnd = () => {
      onPointerUp();
    };

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
  }, [disabled, clearTimer]);

  return elRef;
}
