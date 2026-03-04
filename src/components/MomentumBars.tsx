import type { DayScore } from '../types';

interface MomentumBarsProps {
  last3Days: DayScore[];
}

/**
 * Three small vertical bars in the top-right of the Today screen.
 * Shows the last 3 days (NOT including today).
 * Each bar: ~6px wide, ~32px tall, 4px gap between.
 *
 * Bar fill logic:
 *   3/3 done  -> full gold fill
 *   2/3 done  -> two-thirds gold fill (bottom up)
 *   1/3 done  -> one-third gold fill (bottom up)
 *   0/3 done but present -> dim gold outline, no fill
 *   ghost day -> dark gray #333
 */
export default function MomentumBars({ last3Days }: MomentumBarsProps) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
      {last3Days.map((day, i) => {
        const isGhost = day.state === 'ghost';
        const isPresent = day.state === 'present';
        const score = day.score;
        const fillPercent = isGhost || isPresent ? 0 : (score / 3) * 100;

        return (
          <div
            key={day.date || i}
            style={{
              width: 6,
              height: 32,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: isGhost
                ? '#333333'
                : isPresent
                  ? 'transparent'
                  : 'transparent',
              border: isPresent
                ? '1px solid rgba(201, 168, 76, 0.3)'
                : isGhost
                  ? 'none'
                  : 'none',
            }}
          >
            {/* Gold fill from bottom */}
            {!isGhost && !isPresent && score > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${fillPercent}%`,
                  backgroundColor: 'var(--gold)',
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
