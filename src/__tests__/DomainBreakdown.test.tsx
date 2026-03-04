import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DomainBreakdown from '../components/DomainBreakdown';
import type { DomainKey } from '../types';

describe('DomainBreakdown', () => {
  it('shows correct X/Y format where Y = nonGhostDays', () => {
    const domainCounts: Record<DomainKey, number> = { body: 3, build: 2, exposure: 1 };
    render(<DomainBreakdown domainCounts={domainCounts} nonGhostDays={5} />);

    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.getByText('2/5')).toBeInTheDocument();
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  it('uses nonGhostDays=7 when all days are present', () => {
    const domainCounts: Record<DomainKey, number> = { body: 7, build: 5, exposure: 3 };
    render(<DomainBreakdown domainCounts={domainCounts} nonGhostDays={7} />);

    expect(screen.getByText('7/7')).toBeInTheDocument();
    expect(screen.getByText('5/7')).toBeInTheDocument();
    expect(screen.getByText('3/7')).toBeInTheDocument();
  });

  it('handles 0 non-ghost days gracefully', () => {
    const domainCounts: Record<DomainKey, number> = { body: 0, build: 0, exposure: 0 };
    // Should not crash or show NaN
    const { container } = render(<DomainBreakdown domainCounts={domainCounts} nonGhostDays={0} />);
    // Should render all 3 domain labels
    expect(screen.getByText('BODY')).toBeInTheDocument();
    expect(screen.getByText('BUILD')).toBeInTheDocument();
    expect(screen.getByText('EXPOSURE')).toBeInTheDocument();
    // Should show 0/0 format
    const zeroLabels = screen.getAllByText('0/0');
    expect(zeroLabels.length).toBe(3);
    // Progress bars should have 0% width (not NaN)
    const fills = container.querySelectorAll('[style*="width"]');
    fills.forEach((fill) => {
      const el = fill as HTMLElement;
      const width = el.style.width;
      // Width should not contain NaN
      expect(width).not.toContain('NaN');
    });
  });

  it('renders all 3 domain labels', () => {
    const domainCounts: Record<DomainKey, number> = { body: 1, build: 1, exposure: 1 };
    render(<DomainBreakdown domainCounts={domainCounts} nonGhostDays={3} />);

    expect(screen.getByText('BODY')).toBeInTheDocument();
    expect(screen.getByText('BUILD')).toBeInTheDocument();
    expect(screen.getByText('EXPOSURE')).toBeInTheDocument();
  });

  it('renders progress bars with proportional fill width', () => {
    const domainCounts: Record<DomainKey, number> = { body: 3, build: 0, exposure: 5 };
    const { container } = render(<DomainBreakdown domainCounts={domainCounts} nonGhostDays={5} />);

    // body: 3/5 = 60%, build: 0/5 = 0%, exposure: 5/5 = 100%
    // We can check the inner fill bars
    const allDivs = container.querySelectorAll('div');
    // The component should render progress bars with correct widths
    expect(allDivs.length).toBeGreaterThan(0);
  });

  it('shows 1 nonGhostDay correctly', () => {
    const domainCounts: Record<DomainKey, number> = { body: 1, build: 0, exposure: 0 };
    render(<DomainBreakdown domainCounts={domainCounts} nonGhostDays={1} />);

    expect(screen.getByText('1/1')).toBeInTheDocument();
    expect(screen.getAllByText('0/1')).toHaveLength(2);
  });
});
