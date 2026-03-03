import { formatDisplayDate } from '../utils/dates';

interface DateHeaderProps {
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  isToday: boolean;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  const nd = String(date.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export default function DateHeader({ selectedDate, onDateChange, isToday }: DateHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => onDateChange(shiftDate(selectedDate, -1))}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 20,
            cursor: 'pointer',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Previous day"
        >
          ‹
        </button>

        <span
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}
        >
          {formatDisplayDate(selectedDate)}
        </span>

        <button
          onClick={() => onDateChange(shiftDate(selectedDate, 1))}
          disabled={isToday}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 20,
            cursor: isToday ? 'default' : 'pointer',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isToday ? 0 : 1,
          }}
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      {!isToday && (
        <span
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: 11,
            color: 'var(--text-secondary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          read-only
        </span>
      )}
    </div>
  );
}
