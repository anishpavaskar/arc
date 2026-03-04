import { useCallback } from 'react';
import type { DomainData } from '../types';
import type { DomainConfig } from '../config/domains';
import { useSwipe } from '../hooks/useSwipe';
import { useLongPress } from '../hooks/useLongPress';

interface DomainCardProps {
  domainConfig: DomainConfig;
  data: DomainData;
  onChange: (data: DomainData) => void;
  onComplete: (done: boolean) => void;
  disabled: boolean;
  drifting: boolean;
  committed: boolean;
}

export default function DomainCard({ domainConfig, data, onChange, onComplete, disabled, drifting, committed }: DomainCardProps) {
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
    <div
      ref={mergedRef}
      style={{
        backgroundColor: data.done ? 'var(--gold-tint)' : 'var(--surface)',
        borderRadius: 12,
        borderLeft: `3px solid ${data.done ? 'var(--gold)' : 'var(--border-inactive)'}`,
        padding: 'var(--card-padding)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: disabled ? 0.5 : isDrifting ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'background-color 200ms ease, border-color 200ms ease, opacity 200ms ease',
        touchAction: 'pan-y',
        userSelect: 'none',
        cursor: disabled ? 'default' : 'grab',
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
            color: 'var(--text-primary)',
            padding: 0,
            width: '100%',
            touchAction: 'auto',
            userSelect: 'auto',
            cursor: disabled || data.done || committed ? 'default' : 'text',
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
