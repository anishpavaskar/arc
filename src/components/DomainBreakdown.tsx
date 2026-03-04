import type { DomainKey } from '../types';
import { DOMAINS } from '../config/domains';

interface DomainBreakdownProps {
  domainCounts: Record<DomainKey, number>;
  nonGhostDays: number;
}

/**
 * Per-domain progress bars.
 * Denominator = non-ghost days (not always 7).
 * Display as "X/Y" where Y = non-ghost days.
 */
export default function DomainBreakdown({ domainCounts, nonGhostDays }: DomainBreakdownProps) {
  const denominator = Math.max(nonGhostDays, 1); // avoid division by zero

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {DOMAINS.map((domain) => {
        const count = domainCounts[domain.key];
        const pct = (count / denominator) * 100;

        return (
          <div key={domain.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                }}
              >
                {domain.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                }}
              >
                {count}/{nonGhostDays}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 8,
                backgroundColor: 'var(--surface)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  height: '100%',
                  backgroundColor: 'var(--gold)',
                  borderRadius: 4,
                  transition: 'width 200ms ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
