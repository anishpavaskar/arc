import type { VelocityStatus } from '../types';

interface StatusLabelProps {
  status: VelocityStatus;
  average: number;
}

const statusColor: Record<VelocityStatus, string> = {
  'LOCKED IN': '#C9A84C',
  'MOVING': '#F5F5F0',
  'DRAG DETECTED': '#888888',
  'FLATLINE': '#333333',
};

export default function StatusLabel({ status, average }: StatusLabelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--font-label)',
          fontSize: 28,
          fontWeight: 700,
          textTransform: 'uppercase',
          color: statusColor[status],
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
