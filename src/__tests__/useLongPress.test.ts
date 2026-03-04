import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { createElement } from 'react';
import { useLongPress } from '../hooks/useLongPress';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Test component that wraps the useLongPress hook.
 * It renders a div and attaches the hook's ref to it.
 */
function TestComponent({
  onUndo,
  disabled,
  done,
  testId = 'press-target',
}: {
  onUndo: () => void;
  disabled: boolean;
  done: boolean;
  testId?: string;
}) {
  const ref = useLongPress({ onUndo, disabled, done });

  // We need to assign the ref to the DOM element
  return createElement('div', {
    ref,
    'data-testid': testId,
    style: { width: 200, height: 100 },
  });
}

function renderTarget(props: { onUndo: () => void; disabled: boolean; done: boolean }) {
  const result = render(createElement(TestComponent, props));
  const el = result.container.querySelector('[data-testid="press-target"]') as HTMLElement;
  return { ...result, el };
}

describe('useLongPress', () => {
  it('fires callback after 500ms hold', () => {
    const onUndo = vi.fn();
    const { el } = renderTarget({ onUndo, disabled: false, done: true });

    act(() => {
      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
    });

    expect(onUndo).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire if released before 500ms', () => {
    const onUndo = vi.fn();
    const { el } = renderTarget({ onUndo, disabled: false, done: true });

    act(() => {
      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onUndo).not.toHaveBeenCalled();
  });

  it('does NOT fire if finger moves more than 10px (cancel on movement)', () => {
    const onUndo = vi.fn();
    const { el } = renderTarget({ onUndo, disabled: false, done: true });

    act(() => {
      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Move 15px horizontally (exceeds 10px threshold)
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 115, clientY: 100, bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onUndo).not.toHaveBeenCalled();
  });

  it('does NOT fire if finger moves more than 10px vertically', () => {
    const onUndo = vi.fn();
    const { el } = renderTarget({ onUndo, disabled: false, done: true });

    act(() => {
      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
    });

    // Move 15px vertically
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 115, bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onUndo).not.toHaveBeenCalled();
  });

  it('no-op when disabled=true', () => {
    const onUndo = vi.fn();
    const { el } = renderTarget({ onUndo, disabled: true, done: true });

    act(() => {
      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onUndo).not.toHaveBeenCalled();
  });

  it('no-op when done=false (only active on completed cards)', () => {
    const onUndo = vi.fn();
    const { el } = renderTarget({ onUndo, disabled: false, done: false });

    act(() => {
      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onUndo).not.toHaveBeenCalled();
  });
});
