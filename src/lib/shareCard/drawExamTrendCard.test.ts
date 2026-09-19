import { describe, it, expect } from 'vitest';
import { computeCardStats, pickLabelIndices } from './drawExamTrendCard';
import type { ExamTrendPoint } from '@/lib/examTrend';

function point(percentage: number, date = '2026-09-01'): ExamTrendPoint {
  return { date, label: '9/1', percentage, name: 'Exam' };
}

describe('computeCardStats', () => {
  it('computes latest, highest and average correctly', () => {
    const stats = computeCardStats([point(60), point(80), point(70)]);
    expect(stats.latest).toBe(70); // last in array = most recent since caller sorts chronologically
    expect(stats.highest).toBe(80);
    expect(stats.average).toBe(70);
  });

  it('rounds average to one decimal place', () => {
    const stats = computeCardStats([point(60), point(61), point(62)]);
    expect(stats.average).toBe(61);
  });
});

describe('pickLabelIndices', () => {
  it('includes every index when count is within the max', () => {
    const indices = pickLabelIndices(4, 6);
    expect(indices.size).toBe(4);
  });

  it('always includes the first and last index when thinning', () => {
    const indices = pickLabelIndices(20, 6);
    expect(indices.has(0)).toBe(true);
    expect(indices.has(19)).toBe(true);
    expect(indices.size).toBeLessThanOrEqual(6);
  });
});
