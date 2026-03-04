import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MomentumBars from '../components/MomentumBars';
import type { DayScore } from '../types';

function makeScore(date: string, score: number, state: 'ghost' | 'present' | 'active'): DayScore {
  return { date, label: 'Mon', score, state };
}

describe('MomentumBars', () => {
  it('renders 3 bars', () => {
    const days: DayScore[] = [
      makeScore('2026-03-01', 3, 'active'),
      makeScore('2026-03-02', 2, 'active'),
      makeScore('2026-03-03', 1, 'active'),
    ];
    const { container } = render(<MomentumBars last3Days={days} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeTruthy();
    // The wrapper should contain 3 bar divs
    expect(wrapper.children.length).toBe(3);
  });

  it('full gold bar for 3/3 day (100% fill height)', () => {
    const days: DayScore[] = [
      makeScore('2026-03-01', 3, 'active'),
      makeScore('2026-03-02', 0, 'ghost'),
      makeScore('2026-03-03', 0, 'ghost'),
    ];
    const { container } = render(<MomentumBars last3Days={days} />);
    const wrapper = container.firstChild as HTMLElement;
    const firstBar = wrapper.children[0] as HTMLElement;

    // The active bar should have a fill child div with height 100%
    const fillEl = firstBar.querySelector('div') as HTMLElement;
    expect(fillEl).toBeTruthy();
    expect(fillEl.style.height).toBe('100%');
  });

  it('proportional fill for 1/3 and 2/3 scores', () => {
    const days: DayScore[] = [
      makeScore('2026-03-01', 1, 'active'),
      makeScore('2026-03-02', 2, 'active'),
      makeScore('2026-03-03', 3, 'active'),
    ];
    const { container } = render(<MomentumBars last3Days={days} />);
    const wrapper = container.firstChild as HTMLElement;

    const bars = Array.from(wrapper.children) as HTMLElement[];
    expect(bars.length).toBe(3);

    // Bar 0: score 1 -> 33.33% fill
    const fill1 = bars[0].querySelector('div') as HTMLElement;
    expect(fill1).toBeTruthy();
    const h1 = parseFloat(fill1.style.height);
    expect(h1).toBeCloseTo(33.33, 0);

    // Bar 1: score 2 -> 66.67% fill
    const fill2 = bars[1].querySelector('div') as HTMLElement;
    expect(fill2).toBeTruthy();
    const h2 = parseFloat(fill2.style.height);
    expect(h2).toBeCloseTo(66.67, 0);

    // Bar 2: score 3 -> 100% fill
    const fill3 = bars[2].querySelector('div') as HTMLElement;
    expect(fill3).toBeTruthy();
    expect(fill3.style.height).toBe('100%');
  });

  it('outline-only for present-but-0 day (no fill, gold border)', () => {
    const days: DayScore[] = [
      makeScore('2026-03-01', 0, 'present'),
      makeScore('2026-03-02', 0, 'ghost'),
      makeScore('2026-03-03', 0, 'ghost'),
    ];
    const { container } = render(<MomentumBars last3Days={days} />);
    const wrapper = container.firstChild as HTMLElement;
    const presentBar = wrapper.children[0] as HTMLElement;

    // Present day has gold outline border
    // jsdom may store border as shorthand or individual properties
    const borderStr = presentBar.style.border || presentBar.style.borderColor || '';
    const hasGoldBorder = borderStr.includes('rgba(201, 168, 76') || borderStr.includes('201, 168, 76');
    expect(hasGoldBorder, `Expected gold border, got: border=${presentBar.style.border}, borderColor=${presentBar.style.borderColor}`).toBe(true);
    // Should NOT have a fill child div (score is 0)
    expect(presentBar.querySelector('div')).toBeNull();
    // Background should be transparent
    expect(presentBar.style.backgroundColor).toBe('transparent');
  });

  it('dark gray background for ghost day', () => {
    const days: DayScore[] = [
      makeScore('2026-03-01', 0, 'ghost'),
      makeScore('2026-03-02', 0, 'ghost'),
      makeScore('2026-03-03', 0, 'ghost'),
    ];
    const { container } = render(<MomentumBars last3Days={days} />);
    const wrapper = container.firstChild as HTMLElement;

    Array.from(wrapper.children).forEach((bar) => {
      const el = bar as HTMLElement;
      // Ghost bars have dark gray background #333333
      const bg = el.style.backgroundColor;
      // Accept both hex and rgb format
      const isGray = bg === '#333333' || bg === 'rgb(51, 51, 51)';
      expect(isGray, `Expected #333333 or rgb(51, 51, 51), got ${bg}`).toBe(true);
      // No fill child div
      expect(el.querySelector('div')).toBeNull();
      // No gold border (ghost has no outline)
      expect(el.style.border).not.toContain('rgba(201, 168, 76');
    });
  });

  it('bar dimensions are 6px wide and 32px tall', () => {
    const days: DayScore[] = [
      makeScore('2026-03-01', 1, 'active'),
      makeScore('2026-03-02', 0, 'present'),
      makeScore('2026-03-03', 0, 'ghost'),
    ];
    const { container } = render(<MomentumBars last3Days={days} />);
    const wrapper = container.firstChild as HTMLElement;

    Array.from(wrapper.children).forEach((bar) => {
      const el = bar as HTMLElement;
      expect(el.style.width).toBe('6px');
      expect(el.style.height).toBe('32px');
    });
  });
});
