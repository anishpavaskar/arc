import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DailyIntent from '../components/DailyIntent';

const defaultProps = {
  intent: '',
  onChange: vi.fn(),
  disabled: false,
};

describe('DailyIntent', () => {
  it('renders placeholder "What is today\'s intent?"', () => {
    render(<DailyIntent {...defaultProps} />);
    expect(screen.getByPlaceholderText("What is today's intent?")).toBeInTheDocument();
  });

  it('displays provided intent value', () => {
    render(<DailyIntent {...defaultProps} intent="Ship the feature" />);
    expect(screen.getByDisplayValue('Ship the feature')).toBeInTheDocument();
  });

  it('input is disabled when disabled prop is true', () => {
    render(<DailyIntent {...defaultProps} disabled={true} />);
    expect(screen.getByPlaceholderText("What is today's intent?")).toBeDisabled();
  });

  it('calls onChange on typing', async () => {
    const onChange = vi.fn();
    render(<DailyIntent {...defaultProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("What is today's intent?");
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
