import { describe, it, expect } from 'vitest';
import { compareToPrevious } from './examComparison';
import type { Exam } from '@/types';

function exam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'e', name: 'Test', type: 'daily', date: '2026-09-10', positiveMarks: 1, negativeMarks: 0,
    status: 'completed', tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}

describe('compareToPrevious', () => {
  it('returns no previous exam when none exists of the same type', () => {
    const result = compareToPrevious(exam({ id: 'e1' }), [exam({ id: 'e1' })]);
    expect(result.previousExam).toBeUndefined();
    expect(result.percentageDiff).toBeNull();
  });

  it('computes a positive percentage diff when score improved', () => {
    const prev = exam({ id: 'p', date: '2026-09-01', correct: 60, totalMarks: 100, totalQuestions: 100 });
    const curr = exam({ id: 'c', date: '2026-09-10', correct: 75, totalMarks: 100, totalQuestions: 100 });
    const result = compareToPrevious(curr, [prev, curr]);
    expect(result.previousExam?.id).toBe('p');
    expect(result.percentageDiff).toBe(15);
  });

  it('ignores exams of a different type', () => {
    const prev = exam({ id: 'p', type: 'weekly', date: '2026-09-01', correct: 60, totalMarks: 100 });
    const curr = exam({ id: 'c', type: 'daily', date: '2026-09-10', correct: 75, totalMarks: 100 });
    const result = compareToPrevious(curr, [prev, curr]);
    expect(result.previousExam).toBeUndefined();
  });

  it('computes rank improvement only when both exams have rank set', () => {
    const prev = exam({ id: 'p', date: '2026-09-01', rank: 20 });
    const curr = exam({ id: 'c', date: '2026-09-10', rank: 12 });
    const result = compareToPrevious(curr, [prev, curr]);
    expect(result.rankDiff).toBe(8); // improved by 8 places
  });

  it('leaves rankDiff null when either exam is missing a rank', () => {
    const prev = exam({ id: 'p', date: '2026-09-01' });
    const curr = exam({ id: 'c', date: '2026-09-10', rank: 12 });
    const result = compareToPrevious(curr, [prev, curr]);
    expect(result.rankDiff).toBeNull();
  });
});
