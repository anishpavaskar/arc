import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('VelocityScreen — EC1: Ghost week', () => {
  it('hides StatusLabel when all days are ghost', async () => {
    vi.doMock('../utils/velocity', () => ({
      computeWeeklyData: () => ({
        days: [
          { date: '2026-03-02', label: 'Mon', score: 0, state: 'ghost' },
          { date: '2026-03-03', label: 'Tue', score: 0, state: 'ghost' },
          { date: '2026-03-04', label: 'Wed', score: 0, state: 'ghost' },
        ],
        average: 0,
        status: 'FLATLINE',
        domainCounts: { body: 0, build: 0, exposure: 0 },
        dayOfWeek: 3,
      }),
    }));

    const { default: VelocityScreen } = await import('../screens/VelocityScreen');
    render(<VelocityScreen />);

    // StatusLabel renders "FLATLINE" text — it should NOT be present
    expect(screen.queryByText('FLATLINE')).not.toBeInTheDocument();
    // Average text should also be hidden
    expect(screen.queryByText('0.0 avg')).not.toBeInTheDocument();
  });

  it('shows StatusLabel when at least one day is non-ghost', async () => {
    vi.doMock('../utils/velocity', () => ({
      computeWeeklyData: () => ({
        days: [
          { date: '2026-03-02', label: 'Mon', score: 0, state: 'ghost' },
          { date: '2026-03-03', label: 'Tue', score: 0, state: 'present' },
          { date: '2026-03-04', label: 'Wed', score: 2, state: 'active' },
        ],
        average: 1.0,
        status: 'DRAG DETECTED',
        domainCounts: { body: 1, build: 1, exposure: 0 },
        dayOfWeek: 3,
      }),
    }));

    const { default: VelocityScreen } = await import('../screens/VelocityScreen');
    render(<VelocityScreen />);

    expect(screen.getByText('DRAG DETECTED')).toBeInTheDocument();
    expect(screen.getByText('1.0 avg')).toBeInTheDocument();
  });
});
