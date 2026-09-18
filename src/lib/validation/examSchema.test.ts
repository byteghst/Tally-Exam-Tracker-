import { describe, it, expect } from 'vitest';
import { examFormSchema } from './examSchema';

const base = {
  name: 'Physics Model Test 4',
  type: 'daily' as const,
  date: '2026-09-20',
  positiveMarks: 1,
  negativeMarks: 0.25,
  status: 'upcoming' as const
};

describe('examFormSchema', () => {
  it('accepts a minimal valid exam', () => {
    const result = examFormSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = examFormSchema.safeParse({ ...base, name: '   ' });
    expect(result.success).toBe(false);
  });

  it('flags correct+wrong+unanswered exceeding total questions', () => {
    const result = examFormSchema.safeParse({
      ...base,
      totalQuestions: 100,
      correct: 60,
      wrong: 30,
      unanswered: 20
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('unanswered'))).toBe(true);
    }
  });

  it('allows correct+wrong+unanswered exactly equal to total questions', () => {
    const result = examFormSchema.safeParse({
      ...base,
      totalQuestions: 100,
      correct: 70,
      wrong: 10,
      unanswered: 20
    });
    expect(result.success).toBe(true);
  });

  it('flags rank greater than participants', () => {
    const result = examFormSchema.safeParse({ ...base, rank: 50, participants: 20 });
    expect(result.success).toBe(false);
  });

  it('rejects negative marks', () => {
    const result = examFormSchema.safeParse({ ...base, positiveMarks: -1 });
    expect(result.success).toBe(false);
  });
});
