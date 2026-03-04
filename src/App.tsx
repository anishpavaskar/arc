import { useState } from 'react';
import type { Screen } from './types';
import BottomNav from './components/BottomNav';
import TodayScreen from './screens/TodayScreen';
import VelocityScreen from './screens/VelocityScreen';
import OnboardingOverlay from './components/OnboardingOverlay';

export default function App() {
  const [screen, setScreen] = useState<Screen>('today');

  return (
    <div style={{ width: '100%', maxWidth: 480, minHeight: '100dvh', position: 'relative', paddingTop: 'calc(env(safe-area-inset-top, 10px) + 8px)', paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))' }}>
      {screen === 'today' ? <TodayScreen /> : <VelocityScreen />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 480, margin: '0 auto', padding: '0 20px', marginBottom: 8 }}>
        <a
          href="https://github.com/anishpavaskar/arc"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', lineHeight: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="#888888">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#333333' }}>&copy; 2026 Anish Pavaskar</span>
        <a
          href="/ethos.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: 'rgba(201,168,76,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}
        >
          Ethos
        </a>
      </div>
      <BottomNav screen={screen} onScreenChange={setScreen} />
      <OnboardingOverlay />
    </div>
  );
}
