import { describe, it, expect } from 'vitest';
import { DOMAINS } from '../config/domains';
import type { DomainKey } from '../types';

describe('DOMAINS config', () => {
  it('has exactly 3 entries', () => {
    expect(DOMAINS).toHaveLength(3);
  });

  it('each entry has key, label, and placeholder', () => {
    DOMAINS.forEach((d) => {
      expect(d).toHaveProperty('key');
      expect(d).toHaveProperty('label');
      expect(d).toHaveProperty('placeholder');
      expect(typeof d.key).toBe('string');
      expect(typeof d.label).toBe('string');
      expect(typeof d.placeholder).toBe('string');
    });
  });

  it('keys match DomainKey type values', () => {
    const validKeys: DomainKey[] = ['body', 'build', 'exposure'];
    const actualKeys = DOMAINS.map((d) => d.key);
    expect(actualKeys).toEqual(validKeys);
  });
});
