import type { DomainKey } from '../types';

export interface DomainConfig {
  key: DomainKey;
  label: string;
  placeholder: string;
}

export const DOMAINS: DomainConfig[] = [
  { key: 'body',     label: 'BODY',     placeholder: 'Gym — press day' },
  { key: 'build',    label: 'BUILD',    placeholder: 'Ship the landing page' },
  { key: 'exposure', label: 'EXPOSURE', placeholder: 'Dinner with Alex' },
];
