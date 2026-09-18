import { describe, it, expect } from 'vitest';
import { daysBetween, expandRecurrence, toISODate, parseISODate, getMonthGrid, addMonths } from './index';

describe('date roundtrip', () => {
  it('toISODate/parseISODate are inverse and timezone-safe', () => {
    const d = new Date(2026, 8, 16); // Sep 16 2026, local
    const iso = toISODate(d);
    expect(iso).toBe('2026-09-16');
    const parsed = parseISODate(iso);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8);
    expect(parsed.getDate()).toBe(16);
  });
});

describe('daysBetween / describeCountdown', () => {
  it('computes day differences correctly', () => {
    expect(daysBetween('2026-09-16', '2026-09-19')).toBe(3);
    expect(daysBetween('2026-09-19', '2026-09-16')).toBe(-3);
  });
});

describe('expandRecurrence', () => {
  it('expands a daily recurrence within range', () => {
    const dates = expandRecurrence(
      { freq: 'daily' },
      '2026-09-01',
      '2026-09-01',
      '2026-09-05'
    );
    expect(dates).toEqual(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05']);
  });

  it('expands weekdays only, skipping weekends', () => {
    // 2026-09-16 is a Wednesday
    const dates = expandRecurrence(
      { freq: 'weekdays' },
      '2026-09-14', // Monday
      '2026-09-14',
      '2026-09-20' // Sunday
    );
    expect(dates).toEqual(['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18']);
  });

  it('respects an explicit endDate', () => {
    const dates = expandRecurrence(
      { freq: 'daily', endDate: '2026-09-03' },
      '2026-09-01',
      '2026-09-01',
      '2026-09-10'
    );
    expect(dates).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
  });
});

describe('getMonthGrid', () => {
  it('starts on Sunday by default and covers the whole month', () => {
    // September 2026: Sep 1 is a Tuesday, Sep 30 is a Wednesday
    const grid = getMonthGrid(2026, 8, 0); // month is 0-indexed: 8 = September
    expect(grid[0]).toBe('2026-08-30'); // preceding Sunday
    expect(grid).toContain('2026-09-01');
    expect(grid).toContain('2026-09-30');
    expect(grid.length % 7).toBe(0);
  });

  it('starts on Monday when firstDayOfWeek is 1', () => {
    const grid = getMonthGrid(2026, 8, 1);
    expect(grid[0]).toBe('2026-08-31'); // preceding Monday
    expect(grid.length % 7).toBe(0);
  });
});

describe('addMonths', () => {
  it('rolls over to the next year', () => {
    expect(addMonths(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
  });

  it('rolls back to the previous year', () => {
    expect(addMonths(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});
