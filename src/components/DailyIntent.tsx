interface DailyIntentProps {
  intent: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function DailyIntent({ intent, onChange, disabled }: DailyIntentProps) {
  return (
    <input
      type="text"
      value={intent}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="What is today's intent?"
      style={{
        width: '100%',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--border-inactive)',
        outline: 'none',
        fontFamily: 'var(--font-body)',
        fontSize: 16,
        color: 'var(--text-primary)',
        padding: '12px 0',
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
}
