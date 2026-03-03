import { useMemo } from 'react';
import { computeWeeklyData } from '../utils/velocity';
import StatusLabel from '../components/StatusLabel';
import VelocityChart from '../components/VelocityChart';
import DomainBreakdown from '../components/DomainBreakdown';

export default function VelocityScreen() {
  const weeklyData = useMemo(() => computeWeeklyData(), []);

  return (
    <div style={{ padding: 'var(--page-padding)', paddingTop: 'var(--section-gap)', display: 'flex', flexDirection: 'column', gap: 'var(--section-gap)' }}>
      <StatusLabel status={weeklyData.status} average={weeklyData.average} />
      <VelocityChart days={weeklyData.days} />
      <DomainBreakdown domainCounts={weeklyData.domainCounts} />
    </div>
  );
}
