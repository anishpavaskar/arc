import type { Screen } from '../types';

interface BottomNavProps {
  screen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function BottomNav({ screen, onScreenChange }: BottomNavProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border-inactive)',
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 480,
          height: 'var(--nav-height)',
        }}
      >
        <button
          onClick={() => onScreenChange('today')}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-label)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: screen === 'today' ? 'var(--gold)' : 'var(--text-secondary)',
            transition: 'color 200ms ease',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Today
        </button>
        <button
          onClick={() => onScreenChange('velocity')}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-label)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: screen === 'velocity' ? 'var(--gold)' : 'var(--text-secondary)',
            transition: 'color 200ms ease',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Velocity
        </button>
      </div>
    </nav>
  );
}
