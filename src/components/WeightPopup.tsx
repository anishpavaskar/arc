import { useState, useEffect, useRef } from 'react';
import type { TaskWeight } from '../types';

interface WeightPopupProps {
  onSelect: (weight: TaskWeight) => void;
}

const WEIGHTS: { value: TaskWeight; label: string; subtitle: string; color: string; bg: string }[] = [
  { value: 'maintain', label: 'MAINTAIN', subtitle: 'Kept the habit alive', color: '#888888', bg: 'rgba(136,136,136,0.15)' },
  { value: 'advance', label: 'ADVANCE', subtitle: 'Pushed harder than usual', color: '#D4915C', bg: 'rgba(212,145,92,0.15)' },
  { value: 'expand', label: 'EXPAND', subtitle: 'Went somewhere new', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)' },
];

export default function WeightPopup({ onSelect }: WeightPopupProps) {
  const [selected, setSelected] = useState<TaskWeight | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Tap outside defaults to maintain
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onSelect('maintain');
      }
    }
    // Delay listener to avoid catching the swipe-end event
    const id = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onSelect]);

  function handlePick(weight: TaskWeight) {
    setSelected(weight);
    setTimeout(() => onSelect(weight), 200);
  }

  return (
    <div
      ref={popupRef}
      style={{
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        border: '1px solid #333',
        padding: 12,
        marginTop: 6,
        display: 'flex',
        gap: 8,
      }}
    >
      {WEIGHTS.map((w) => {
        const isSelected = selected === w.value;
        const isDimmed = selected !== null && !isSelected;
        return (
          <button
            key={w.value}
            onClick={() => handlePick(w.value)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 6,
              border: 'none',
              backgroundColor: isSelected ? w.bg : isDimmed ? '#333' : '#222',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              cursor: 'pointer',
              padding: '4px 2px',
              transition: 'background-color 150ms ease',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isSelected ? w.color : isDimmed ? '#444' : '#888',
                transition: 'color 150ms ease',
              }}
            >
              {w.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: 9,
                color: isSelected ? w.color : isDimmed ? '#444' : '#555',
                transition: 'color 150ms ease',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {w.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
