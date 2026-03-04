import { useMemo } from 'react';
import { computeWeeklyData } from '../utils/velocity';
import StatusLabel from '../components/StatusLabel';
import VelocityChart from '../components/VelocityChart';
import DomainBreakdown from '../components/DomainBreakdown';

export default function VelocityScreen() {
  const weeklyData = useMemo(() => computeWeeklyData(), []);

  // Count non-ghost days for DomainBreakdown denominator
  const nonGhostDays = weeklyData.days.filter((d) => d.state !== 'ghost').length;

  const allGhost = weeklyData.days.every((d) => d.state === 'ghost');

  return (
    <div style={{ padding: 'var(--page-padding)', paddingTop: 'var(--section-gap)', display: 'flex', flexDirection: 'column', gap: 'var(--section-gap)' }}>
      {!allGhost && <StatusLabel status={weeklyData.status} average={weeklyData.average} dayOfWeek={weeklyData.dayOfWeek} />}
      <VelocityChart days={weeklyData.days} />
      <DomainBreakdown domainCounts={weeklyData.domainCounts} nonGhostDays={nonGhostDays} />
    </div>
  );
}
