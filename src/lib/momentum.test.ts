import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeMomentum, countAllTimeProductiveDays } from './momentum';
import type { ActivityLogEntry } from '@/types';

function entry(message: string, daysAgo: number): ActivityLogEntry {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return { id: crypto.randomUUID(), entityType: 'task', entityId: 'x', message, timestamp: d.getTime() };
}

describe('computeMomentum', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 19, 10, 0, 0)); // Sat Sep 19 2026
  });
  afterEach(() => vi.useRealTimers());

  it('marks today productive when a completion happened today', () => {
    const result = computeMomentum([entry('Completed task "X"', 0)]);
    const today = result.days.find((d) => d.isToday);
    expect(today?.productive).toBe(true);
    expect(result.productiveCount).toBe(1);
  });

  it('ignores non-completion messages', () => {
    const result = computeMomentum([entry('Added task "X"', 0)]);
    expect(result.productiveCount).toBe(0);
  });

  it('returns exactly daysBack entries ending on today', () => {
    const result = computeMomentum([], 7);
    expect(result.days).toHaveLength(7);
    expect(result.days[6].isToday).toBe(true);
  });

  it('counts multiple distinct productive days without double-counting same-day entries', () => {
    const result = computeMomentum([
      entry('Completed task "A"', 1),
      entry('Completed task "B"', 1), // same day as above
      entry('Completed deadline "C"', 3)
    ]);
    expect(result.productiveCount).toBe(2);
  });
});

describe('countAllTimeProductiveDays', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 19, 10, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('counts distinct days regardless of range', () => {
    const count = countAllTimeProductiveDays([
      entry('Completed task "A"', 0),
      entry('Completed task "B"', 10),
      entry('Completed task "C"', 100)
    ]);
    expect(count).toBe(3);
  });
});
