import type { DomainKey } from '../types';
import { DOMAINS } from '../config/domains';

interface DomainBreakdownProps {
  domainCounts: Record<DomainKey, number>;
}

export default function DomainBreakdown({ domainCounts }: DomainBreakdownProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {DOMAINS.map((domain) => {
        const count = domainCounts[domain.key];
        const pct = (count / 7) * 100;

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
                {count}/7
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
                  width: `${pct}%`,
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
