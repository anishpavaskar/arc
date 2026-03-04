import type { DayScore } from '../types';

interface VelocityChartProps {
  days: DayScore[];
}

const ALL_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_MAX_HEIGHT = 160;
const BAR_WIDTH = 28;
const CHART_PADDING_TOP = 12;
const CHART_PADDING_BOTTOM = 28;
const TOTAL_HEIGHT = BAR_MAX_HEIGHT + CHART_PADDING_TOP + CHART_PADDING_BOTTOM;

/**
 * Mon-Sun bar chart with proportional third-fill bars.
 *
 * - Future days: empty space (no bar)
 * - Ghost days: NO BAR (gap)
 * - Present (0/3): dim gold outline bar (--gold-outline at 30% opacity), no fill
 * - Active: gold bar filled proportionally (1/3, 2/3, 3/3 from bottom)
 * - No tooltip, no grid, no Y-axis labels
 */
export default function VelocityChart({ days }: VelocityChartProps) {
  // Build a lookup from day label to DayScore
  const dayMap = new Map<string, DayScore>();
  for (const d of days) {
    dayMap.set(d.label, d);
  }

  return (
    <div style={{ width: '100%', height: TOTAL_HEIGHT, position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          height: BAR_MAX_HEIGHT + CHART_PADDING_TOP,
          paddingTop: CHART_PADDING_TOP,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {ALL_LABELS.map((label) => {
          const dayScore = dayMap.get(label);

          // Future day or not present in data: empty space
          if (!dayScore) {
            return (
              <div key={label} style={{ width: BAR_WIDTH, height: BAR_MAX_HEIGHT }} />
            );
          }

          const { state, score } = dayScore;

          // Ghost day: no bar (empty gap)
          if (state === 'ghost') {
            return (
              <div key={label} style={{ width: BAR_WIDTH, height: BAR_MAX_HEIGHT }} />
            );
          }

          // Present day (0/3): dim gold outline bar
          if (state === 'present') {
            return (
              <div
                key={label}
                style={{
                  width: BAR_WIDTH,
                  height: BAR_MAX_HEIGHT,
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: BAR_MAX_HEIGHT * 0.15, // small outline bar
                    borderRadius: 4,
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
            );
          }

          // Active day: gold bar filled proportionally
          const fillRatio = score / 3;
          const barHeight = BAR_MAX_HEIGHT * fillRatio;

          return (
            <div
              key={label}
              style={{
                width: BAR_WIDTH,
                height: BAR_MAX_HEIGHT,
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: Math.max(barHeight, 4), // minimum visible height
                  borderRadius: 4,
                  backgroundColor: 'var(--gold)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 8,
        }}
      >
        {ALL_LABELS.map((label) => (
          <span
            key={label}
            style={{
              width: BAR_WIDTH,
              textAlign: 'center',
              fontFamily: 'var(--font-label)',
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
