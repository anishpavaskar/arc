import { useRef, useEffect } from 'react';

interface UseSwipeOptions {
  onComplete: (done: boolean) => void;
  disabled: boolean;
  done: boolean;
}

const DEAD_ZONE = 10;
const THRESHOLD_RATIO = 0.4;

export function useSwipe({ onComplete, disabled, done }: UseSwipeOptions) {
  const cardRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(done);
  doneRef.current = done;
  const callbackRef = useRef(onComplete);
  callbackRef.current = onComplete;

  useEffect(() => {
    if (!cardRef.current || disabled) return;
    const el = cardRef.current;

    let startX = 0;
    let startY = 0;
    let swiping = false;
    let decided = false; // have we decided swipe vs scroll?

    function onPointerDown(clientX: number, clientY: number) {
      startX = clientX;
      startY = clientY;
      swiping = false;
      decided = false;
    }

    function onPointerMove(clientX: number, clientY: number) {
      if (decided && !swiping) return; // decided it's a scroll, ignore

      const dx = clientX - startX;
      const dy = clientY - startY;

      if (!decided) {
        // Not enough movement to decide yet
        if (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE) return;

        decided = true;
        if (Math.abs(dy) > Math.abs(dx)) {
          // Vertical — user is scrolling, bail out
          swiping = false;
          return;
        }

        // Swipe on already-complete card is a no-op (use hold-to-undo instead)
        if (doneRef.current) {
          swiping = false;
          return;
        }

        swiping = true;
        el.style.transition = 'none';
      }

      if (swiping) {
        el.style.transform = `translateX(${dx}px)`;
      }
    }

    function onPointerUp(clientX: number) {
      if (!swiping) return;

      const dx = clientX - startX;
      const width = el.offsetWidth;
      const threshold = width * THRESHOLD_RATIO;

      el.style.transition = 'transform 200ms ease';
      el.style.transform = 'translateX(0)';

      if (Math.abs(dx) > threshold) {
        // Only fires on incomplete cards (swipe to complete)
        callbackRef.current(true);
      }

      // Restore React's transition after snap-back completes
      setTimeout(() => {
        el.style.transition = '';
        el.style.transform = '';
      }, 210);

      swiping = false;
      decided = false;
    }

    // Track whether pointer is down (for mouse)
    let mouseDown = false;

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      e.preventDefault();
      mouseDown = true;
      onPointerDown(e.clientX, e.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;
      onPointerMove(e.clientX, e.clientY);
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (!mouseDown) return;
      mouseDown = false;
      onPointerUp(e.clientX);
    };

    const handleTouchStart = (e: TouchEvent) => {
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      if (swiping) e.preventDefault();
    };
    const handleTouchEnd = (e: TouchEvent) => {
      onPointerUp(e.changedTouches[0].clientX);
    };

    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled]);

  return cardRef;
}
