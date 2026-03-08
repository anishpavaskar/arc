import { useState, useEffect } from 'react';

const STORAGE_KEY = 'arc-onboarded';

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  });
  const [fading, setFading] = useState(false);

  // Prevent body scroll while overlay is visible
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [visible]);

  if (!visible) return null;

  function handleBegin() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setFading(true);
    setTimeout(() => setVisible(false), 200);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10,10,10,0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 200ms ease',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          maxWidth: 320,
          padding: 32,
          textAlign: 'center',
        }}
      >
        {/* Title */}
        <span
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C9A84C',
          }}
        >
          ARC
        </span>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            color: '#F5F5F0',
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          A personal velocity system.
        </p>

        {/* Gold divider */}
        <div style={{ width: 48, height: 2, backgroundColor: '#C9A84C', margin: '24px auto' }} />

        {/* Body text */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            lineHeight: 1.8,
            color: '#F5F5F0',
          }}
        >
          <p style={{ margin: 0 }}>
            Each day, commit to one action in three domains:
          </p>
          <p style={{ margin: '4px 0 0' }}>
            <span style={{ color: '#C9A84C', fontWeight: 700 }}>BODY</span>
            {' \u00B7 '}
            <span style={{ color: '#C9A84C', fontWeight: 700 }}>BUILD</span>
            {' \u00B7 '}
            <span style={{ color: '#C9A84C', fontWeight: 700 }}>EXPOSURE</span>
          </p>

          <div style={{ height: 16 }} />

          <p style={{ margin: 0 }}>Swipe a card when the action is done.</p>
          <p style={{ margin: 0 }}>Rate each task: <span style={{ color: '#888888' }}>MAINTAIN</span>, <span style={{ color: '#D4915C' }}>ADVANCE</span>, or <span style={{ color: '#C9A84C' }}>EXPAND</span>.</p>
          <p style={{ margin: 0 }}>Hold to undo.</p>

          <div style={{ height: 16 }} />

          <p style={{ margin: 0 }}>No streaks. No points.</p>
          <p style={{ margin: 0 }}>Missed days are data.</p>

          <div style={{ height: 16 }} />

          <p style={{ margin: 0 }}>Every day reduces to one question:</p>
        </div>

        {/* Gold divider */}
        <div style={{ width: 48, height: 2, backgroundColor: '#C9A84C', margin: '24px auto' }} />

        {/* Tagline */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            fontStyle: 'italic',
            color: 'rgba(201,168,76,0.6)',
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          Am I moving,<br />
          or am I drifting?
        </p>

        {/* Gold divider */}
        <div style={{ width: 48, height: 2, backgroundColor: '#C9A84C', margin: '24px auto' }} />

        {/* Buttons — BEGIN first, Ethos second */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleBegin}
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 44,
              width: '100%',
              cursor: 'pointer',
            }}
          >
            Begin
          </button>
          <a
            href="/ethos.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#888888',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 44,
              width: '100%',
              cursor: 'pointer',
            }}
          >
            Read the Ethos
          </a>
        </div>
      </div>
    </div>
  );
}
