import { describe, it, expect } from 'vitest';
import { syllabusFormSchema } from './syllabusSchema';

const base = {
  title: 'Chapter 3: Vector',
  type: 'chapter' as const,
  progressState: 'not_started' as const,
  progressPercent: 0
};

describe('syllabusFormSchema', () => {
  it('accepts a minimal valid node', () => {
    expect(syllabusFormSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(syllabusFormSchema.safeParse({ ...base, title: '' }).success).toBe(false);
  });

  it('rejects progressPercent over 100', () => {
    expect(syllabusFormSchema.safeParse({ ...base, progressPercent: 150 }).success).toBe(false);
  });

  it('rejects a negative progressPercent', () => {
    expect(syllabusFormSchema.safeParse({ ...base, progressPercent: -1 }).success).toBe(false);
  });
});
