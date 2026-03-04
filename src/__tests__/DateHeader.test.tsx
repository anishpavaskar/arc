import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateHeader from '../components/DateHeader';

describe('DateHeader', () => {
  it('renders formatted date', () => {
    render(<DateHeader selectedDate="2026-03-03" onDateChange={vi.fn()} isToday={true} />);
    expect(screen.getByText('TUESDAY, MAR 3')).toBeInTheDocument();
  });

  it('right arrow is hidden when isToday is true', () => {
    render(<DateHeader selectedDate="2026-03-03" onDateChange={vi.fn()} isToday={true} />);
    const nextBtn = screen.getByLabelText('Next day');
    expect(nextBtn.style.opacity).toBe('0');
    expect(nextBtn).toBeDisabled();
  });

  it('right arrow is visible when isToday is false', () => {
    render(<DateHeader selectedDate="2026-03-02" onDateChange={vi.fn()} isToday={false} />);
    const nextBtn = screen.getByLabelText('Next day');
    expect(nextBtn.style.opacity).toBe('1');
    expect(nextBtn).not.toBeDisabled();
  });

  it('left arrow calls onDateChange with previous day', async () => {
    const onDateChange = vi.fn();
    render(<DateHeader selectedDate="2026-03-03" onDateChange={onDateChange} isToday={true} />);
    await userEvent.click(screen.getByLabelText('Previous day'));
    expect(onDateChange).toHaveBeenCalledWith('2026-03-02');
  });

  it('shows read-only label when not today', () => {
    render(<DateHeader selectedDate="2026-03-01" onDateChange={vi.fn()} isToday={false} />);
    expect(screen.getByText('read-only')).toBeInTheDocument();
  });

  it('does not show read-only label when isToday', () => {
    render(<DateHeader selectedDate="2026-03-03" onDateChange={vi.fn()} isToday={true} />);
    expect(screen.queryByText('read-only')).toBeNull();
  });
});
