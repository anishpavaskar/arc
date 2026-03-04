import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusLabel from '../components/StatusLabel';
import type { VelocityStatus } from '../types';

const statuses: VelocityStatus[] = ['LOCKED IN', 'MOVING', 'DRAG DETECTED', 'FLATLINE'];

/**
 * Helper: checks if an element's style.color matches the expected hex color.
 * jsdom may return the color as hex or as rgb(), so we check both forms.
 */
function expectColor(el: HTMLElement, hex: string) {
  const actual = el.style.color;
  // Convert hex to rgb for comparison
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  // Accept either hex or rgb representation
  const matches = actual === hex.toLowerCase() || actual === rgb;
  expect(matches, `Expected color ${hex} (or ${rgb}), got ${actual}`).toBe(true);
}

describe('StatusLabel', () => {
  statuses.forEach((status) => {
    it(`renders "${status}" text`, () => {
      render(<StatusLabel status={status} average={1.5} dayOfWeek={5} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    });
  });

  it('displays average formatted to one decimal', () => {
    render(<StatusLabel status="MOVING" average={1.5714} dayOfWeek={5} />);
    expect(screen.getByText('1.6 avg')).toBeInTheDocument();
  });

  it('displays zero average correctly', () => {
    render(<StatusLabel status="FLATLINE" average={0} dayOfWeek={5} />);
    expect(screen.getByText('0.0 avg')).toBeInTheDocument();
  });

  it('displays whole number average with decimal', () => {
    render(<StatusLabel status="LOCKED IN" average={3} dayOfWeek={5} />);
    expect(screen.getByText('3.0 avg')).toBeInTheDocument();
  });

  // v3: Early-week dimming (Mon-Wed = dayOfWeek 1-3)
  describe('early-week dimming', () => {
    it('Mon (dayOfWeek=1): status text color is #888888 regardless of status', () => {
      statuses.forEach((status) => {
        const { unmount } = render(<StatusLabel status={status} average={2} dayOfWeek={1} />);
        const statusEl = screen.getByText(status);
        expectColor(statusEl, '#888888');
        unmount();
      });
    });

    it('Tue (dayOfWeek=2): status text color is #888888 regardless of status', () => {
      const { unmount } = render(<StatusLabel status="LOCKED IN" average={3} dayOfWeek={2} />);
      const statusEl = screen.getByText('LOCKED IN');
      expectColor(statusEl, '#888888');
      unmount();
    });

    it('Wed (dayOfWeek=3): status text color is #888888 regardless of status', () => {
      const { unmount } = render(<StatusLabel status="MOVING" average={2} dayOfWeek={3} />);
      const statusEl = screen.getByText('MOVING');
      expectColor(statusEl, '#888888');
      unmount();
    });
  });

  // v3: Full color Thu-Sun (dayOfWeek 4-7)
  describe('full color from Thursday onward', () => {
    it('Thu (dayOfWeek=4): LOCKED IN shows gold (#C9A84C)', () => {
      render(<StatusLabel status="LOCKED IN" average={3} dayOfWeek={4} />);
      const statusEl = screen.getByText('LOCKED IN');
      expectColor(statusEl, '#C9A84C');
    });

    it('Fri (dayOfWeek=5): MOVING shows white (#F5F5F0)', () => {
      render(<StatusLabel status="MOVING" average={2} dayOfWeek={5} />);
      const statusEl = screen.getByText('MOVING');
      expectColor(statusEl, '#F5F5F0');
    });

    it('Sat (dayOfWeek=6): DRAG DETECTED shows gray (#888888)', () => {
      render(<StatusLabel status="DRAG DETECTED" average={1} dayOfWeek={6} />);
      const statusEl = screen.getByText('DRAG DETECTED');
      expectColor(statusEl, '#888888');
    });

    it('Sun (dayOfWeek=7): FLATLINE shows dark gray (#333333)', () => {
      render(<StatusLabel status="FLATLINE" average={0} dayOfWeek={7} />);
      const statusEl = screen.getByText('FLATLINE');
      expectColor(statusEl, '#333333');
    });

    it('Sun (dayOfWeek=7): LOCKED IN shows full gold color', () => {
      render(<StatusLabel status="LOCKED IN" average={3} dayOfWeek={7} />);
      const statusEl = screen.getByText('LOCKED IN');
      expectColor(statusEl, '#C9A84C');
    });
  });
});
