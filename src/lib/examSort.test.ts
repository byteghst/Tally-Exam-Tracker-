import { describe, it, expect } from 'vitest';
import { sortExamsByDateTime } from './examSort';
import type { Exam } from '@/types';

function exam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'e', name: 'Test', type: 'daily', date: '2026-09-10', positiveMarks: 1, negativeMarks: 0,
    status: 'upcoming', tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}

describe('sortExamsByDateTime', () => {
  it('sorts by date ascending regardless of input order', () => {
    const result = sortExamsByDateTime([
      exam({ id: 'b', date: '2026-09-15' }),
      exam({ id: 'a', date: '2026-09-01' })
    ]);
    expect(result.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('sorts same-day exams by start time', () => {
    const result = sortExamsByDateTime([
      exam({ id: 'late', date: '2026-09-10', startTime: '14:00' }),
      exam({ id: 'early', date: '2026-09-10', startTime: '09:00' })
    ]);
    expect(result.map((e) => e.id)).toEqual(['early', 'late']);
  });

  it('puts exams with no start time before timed exams on the same day', () => {
    const result = sortExamsByDateTime([
      exam({ id: 'timed', date: '2026-09-10', startTime: '09:00' }),
      exam({ id: 'untimed', date: '2026-09-10' })
    ]);
    expect(result.map((e) => e.id)).toEqual(['untimed', 'timed']);
  });

  it('does not mutate the original array', () => {
    const input = [exam({ id: 'b', date: '2026-09-15' }), exam({ id: 'a', date: '2026-09-01' })];
    const original = [...input];
    sortExamsByDateTime(input);
    expect(input).toEqual(original);
  });
});
