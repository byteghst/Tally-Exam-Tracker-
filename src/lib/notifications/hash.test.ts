import { describe, it, expect } from 'vitest';
import { hashToInt32 } from './hash';

describe('hashToInt32', () => {
  it('is deterministic for the same input', () => {
    expect(hashToInt32('exam-abc123')).toBe(hashToInt32('exam-abc123'));
  });

  it('produces different values for different inputs', () => {
    expect(hashToInt32('exam-abc123')).not.toBe(hashToInt32('deadline-abc123'));
  });

  it('always returns a non-negative integer', () => {
    for (const input of ['', 'a', 'exam-1', 'deadline-' + 'x'.repeat(50)]) {
      const result = hashToInt32(input);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});
