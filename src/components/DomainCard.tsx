import { useCallback, type ReactNode } from 'react';
import type { DomainData } from '../types';
import type { DomainConfig } from '../config/domains';
import { useSwipe } from '../hooks/useSwipe';
import { useLongPress } from '../hooks/useLongPress';

const WEIGHT_COLORS: Record<string, string> = {
  maintain: '#888888',
  advance: '#D4915C',
  expand: '#C9A84C',
};

interface DomainCardProps {
  domainConfig: DomainConfig;
  data: DomainData;
  onChange: (data: DomainData) => void;
  onComplete: (done: boolean) => void;
  disabled: boolean;
  drifting: boolean;
  committed: boolean;
  popup?: ReactNode;
}

export default function DomainCard({ domainConfig, data, onChange, onComplete, disabled, drifting, committed, popup }: DomainCardProps) {
  const swipeRef = useSwipe({
    onComplete,
    disabled,
    done: data.done,
  });

  const longPressRef = useLongPress({
    onUndo: () => onComplete(false),
    disabled,
    done: data.done,
  });

  // Merge both refs into a single callback ref
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Assign to both internal refs
      (swipeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      longPressRef.current = node;
    },
    [swipeRef, longPressRef],
  );

  // Drifting dims the card but only when not completed
  const isDrifting = drifting && !data.done;

  return (
    <div>
      <div
        ref={mergedRef}
        style={{
          backgroundColor: data.done ? 'rgba(201,168,76,0.12)' : 'var(--surface)',
          borderRadius: 12,
          borderLeft: `3px solid ${data.done ? 'var(--gold)' : 'var(--border-inactive)'}`,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: disabled ? 0.5 : isDrifting ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          transition: 'background-color 200ms ease, border-color 200ms ease, opacity 200ms ease',
          touchAction: 'pan-y',
          cursor: disabled ? 'default' : 'grab',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: data.done ? 'var(--gold)' : '#666666',
              transition: 'color 200ms ease',
            }}
          >
            {domainConfig.label}
          </span>
          <input
            type="text"
            inputMode="text"
            enterKeyHint="done"
            autoComplete="off"
            value={data.task}
            onChange={(e) => onChange({ ...data, task: e.target.value })}
            disabled={disabled || data.done || committed}
            placeholder={domainConfig.placeholder}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: '#F5F5F0',
              padding: 0,
              width: '100%',
              touchAction: 'auto',
              userSelect: 'auto',
              cursor: disabled || data.done || committed ? 'default' : 'text',
            }}
          />
        </div>

        {data.done && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {data.weight && (
              <span
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: WEIGHT_COLORS[data.weight] ?? '#888',
                }}
              >
                {data.weight}
              </span>
            )}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ minWidth: 16 }}>
              <path
                d="M1.5 6L6 10.5L14.5 1.5"
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
      {popup}
    </div>
  );
}
