import type { VelocityStatus } from '../types';

interface StatusLabelProps {
  status: VelocityStatus;
  average: number;
  dayOfWeek: number; // 1=Mon, 7=Sun
}

const statusColor: Record<VelocityStatus, string> = {
  'LOCKED IN': '#C9A84C',
  'MOVING': '#F5F5F0',
  'DRAG DETECTED': '#888888',
  'FLATLINE': '#333333',
};

/**
 * Mon-Wed (dayOfWeek 1-3): status text renders in #888888 (muted) regardless of status.
 * Thu-Sun (dayOfWeek 4-7): full designated color per status tier.
 */
export default function StatusLabel({ status, average, dayOfWeek }: StatusLabelProps) {
  const isEarlyWeek = dayOfWeek >= 1 && dayOfWeek <= 3;
  const color = isEarlyWeek ? '#888888' : statusColor[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--font-label)',
          fontSize: 28,
          fontWeight: 700,
          textTransform: 'uppercase',
          color,
        }}
      >
        {status}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-label)',
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}
      >
        {average.toFixed(1)} avg
      </span>
    </div>
  );
}
