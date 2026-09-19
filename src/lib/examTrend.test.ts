import { describe, it, expect } from 'vitest';
import { computeExamTrendPoints } from './examTrend';
import type { Exam } from '@/types';

function exam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'e', name: 'Test', type: 'daily', date: '2026-09-10', positiveMarks: 1, negativeMarks: 0,
    status: 'completed', tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}

describe('computeExamTrendPoints', () => {
  it('drops exams with no resolvable percentage (no totalMarks)', () => {
    const points = computeExamTrendPoints([exam({ correct: 10 })]);
    expect(points).toEqual([]);
  });

  it('sorts points chronologically regardless of input order', () => {
    const points = computeExamTrendPoints([
      exam({ id: 'b', date: '2026-09-15', correct: 80, totalMarks: 100, totalQuestions: 100 }),
      exam({ id: 'a', date: '2026-09-01', correct: 60, totalMarks: 100, totalQuestions: 100 })
    ]);
    expect(points.map((p) => p.date)).toEqual(['2026-09-01', '2026-09-15']);
  });

  it('produces a short date label', () => {
    const points = computeExamTrendPoints([exam({ date: '2026-09-05', correct: 50, totalMarks: 100, totalQuestions: 100 })]);
    expect(points[0].label).toBe('9/5');
  });
});