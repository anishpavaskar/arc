import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from 'recharts';
import type { DayScore } from '../types';

interface VelocityChartProps {
  days: DayScore[];
}

function barFill(score: number): string {
  if (score === 3) return '#C9A84C';
  if (score === 2) return '#C9A84C99';
  if (score === 1) return '#333333';
  return 'transparent';
}

function barStroke(score: number): string | undefined {
  return score === 0 ? '#333333' : undefined;
}

export default function VelocityChart({ days }: VelocityChartProps) {
  const data = days.map((d) => ({
    ...d,
    displayScore: d.score === 0 ? 0.15 : d.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap="20%">
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#888888', fontSize: 12, fontFamily: 'Instrument Sans' }}
        />
        <Bar dataKey="displayScore" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={barFill(entry.score)}
              stroke={barStroke(entry.score)}
              strokeWidth={entry.score === 0 ? 1 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
