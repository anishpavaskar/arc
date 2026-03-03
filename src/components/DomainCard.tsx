import type { DomainData } from '../types';
import type { DomainConfig } from '../config/domains';
import { useSwipe } from '../hooks/useSwipe';

interface DomainCardProps {
  domainConfig: DomainConfig;
  data: DomainData;
  onChange: (data: DomainData) => void;
  onComplete: () => void;
  disabled: boolean;
}

export default function DomainCard({ domainConfig, data, onChange, onComplete, disabled }: DomainCardProps) {
  const cardRef = useSwipe({
    onSwipeComplete: onComplete,
    disabled,
    done: data.done,
  });

  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: data.done ? 'var(--gold-tint)' : 'var(--surface)',
        borderRadius: 12,
        borderLeft: `3px solid ${data.done ? 'var(--gold)' : 'var(--border-inactive)'}`,
        padding: 'var(--card-padding)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 200ms ease, border-color 200ms ease',
        touchAction: 'pan-y',
        userSelect: 'none',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: data.done ? 'var(--gold)' : 'var(--text-secondary)',
            transition: 'color 200ms ease',
          }}
        >
          {domainConfig.label}
        </span>
        <input
          type="text"
          value={data.task}
          onChange={(e) => onChange({ ...data, task: e.target.value })}
          disabled={disabled}
          placeholder={domainConfig.placeholder}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'var(--text-primary)',
            padding: 0,
            width: '100%',
            touchAction: 'auto',
            userSelect: 'auto',
          }}
        />
      </div>

      {data.done && (
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ minWidth: 16 }}>
          <path
            d="M1.5 6L6 10.5L14.5 1.5"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
