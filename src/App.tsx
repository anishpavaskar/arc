import { useState } from 'react';
import type { Screen } from './types';
import BottomNav from './components/BottomNav';
import TodayScreen from './screens/TodayScreen';
import VelocityScreen from './screens/VelocityScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('today');

  return (
    <div style={{ width: '100%', maxWidth: 480, minHeight: '100dvh', position: 'relative', paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))' }}>
      {screen === 'today' ? <TodayScreen /> : <VelocityScreen />}
      <BottomNav screen={screen} onScreenChange={setScreen} />
    </div>
  );
}
