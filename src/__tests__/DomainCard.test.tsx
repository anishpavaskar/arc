import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DomainCard from '../components/DomainCard';
import type { DomainConfig } from '../config/domains';

const config: DomainConfig = { key: 'body', label: 'BODY', placeholder: 'Gym — press day' };

const defaultProps = {
  domainConfig: config,
  data: { task: '', done: false, weight: null as null },
  onChange: vi.fn(),
  onComplete: vi.fn(),
  disabled: false,
  drifting: false,
  committed: false,
};

/** The card div is inside a wrapper div, so we need firstChild.firstChild */
function getCard(container: HTMLElement) {
  return (container.firstChild as HTMLElement).firstChild as HTMLElement;
}

describe('DomainCard', () => {
  it('renders domain label', () => {
    render(<DomainCard {...defaultProps} />);
    expect(screen.getByText('BODY')).toBeInTheDocument();
  });

  it('renders placeholder when task is empty', () => {
    render(<DomainCard {...defaultProps} />);
    expect(screen.getByPlaceholderText('Gym — press day')).toBeInTheDocument();
  });

  it('renders task text when provided', () => {
    render(<DomainCard {...defaultProps} data={{ task: 'Morning run', done: false, weight: null }} />);
    expect(screen.getByDisplayValue('Morning run')).toBeInTheDocument();
  });

  it('shows gold background when done', () => {
    const { container } = render(
      <DomainCard {...defaultProps} data={{ task: 'Run', done: true, weight: null }} />,
    );
    const card = getCard(container);
    expect(card.style.backgroundColor).toContain('rgba(201');
  });

  it('shows default surface background when not done', () => {
    const { container } = render(<DomainCard {...defaultProps} />);
    const card = getCard(container);
    expect(card.style.backgroundColor).toBe('var(--surface)');
  });

  it('shows gold left border when done', () => {
    const { container } = render(
      <DomainCard {...defaultProps} data={{ task: 'Run', done: true, weight: null }} />,
    );
    const card = getCard(container);
    expect(card.style.borderLeft).toContain('var(--gold)');
  });

  it('shows inactive border when not done', () => {
    const { container } = render(<DomainCard {...defaultProps} />);
    const card = getCard(container);
    expect(card.style.borderLeft).toContain('var(--border-inactive)');
  });

  it('renders checkmark SVG when done', () => {
    const { container } = render(
      <DomainCard {...defaultProps} data={{ task: 'Run', done: true, weight: null }} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render checkmark SVG when not done', () => {
    const { container } = render(<DomainCard {...defaultProps} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('disables input when disabled prop is true', () => {
    render(<DomainCard {...defaultProps} disabled={true} />);
    expect(screen.getByPlaceholderText('Gym — press day')).toBeDisabled();
  });

  // v3: task input is locked (disabled) when done=true
  it('task input is disabled (locked) when done=true', () => {
    render(
      <DomainCard {...defaultProps} data={{ task: 'Morning run', done: true, weight: null }} />,
    );
    const input = screen.getByDisplayValue('Morning run');
    expect(input).toBeDisabled();
  });

  // v3: drifting prop causes ~60% opacity
  it('card has ~60% opacity when drifting=true', () => {
    const { container } = render(
      <DomainCard {...defaultProps} drifting={true} />,
    );
    const card = getCard(container);
    const opacity = parseFloat(card.style.opacity);
    expect(opacity).toBeCloseTo(0.6, 1);
  });

  it('card has full opacity when drifting=false', () => {
    const { container } = render(
      <DomainCard {...defaultProps} drifting={false} />,
    );
    const card = getCard(container);
    const opacity = parseFloat(card.style.opacity);
    expect(opacity).toBe(1);
  });

  it('card has full opacity by default (no drifting prop)', () => {
    const { container } = render(<DomainCard {...defaultProps} />);
    const card = getCard(container);
    const opacity = parseFloat(card.style.opacity);
    // Should be 1 when not disabled and not drifting
    expect(opacity).toBe(1);
  });
});
