import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFutureReminders, getDueReminders } from './scheduling';
import type { Exam, Deadline } from '@/types';

function exam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'e1', name: 'Physics Test', type: 'daily', date: '2026-09-20', positiveMarks: 1, negativeMarks: 0,
    status: 'upcoming', tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}
function deadline(overrides: Partial<Deadline> = {}): Deadline {
  return {
    id: 'd1', title: 'Form due', date: '2026-09-20', priority: 'medium', status: 'upcoming',
    tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 19, 10, 0, 0)); // Sep 19 2026, 10:00
});
afterEach(() => vi.useRealTimers());

describe('getFutureReminders', () => {
  it('skips exams/deadlines with no reminder set', () => {
    expect(getFutureReminders([exam()], [deadline()])).toEqual([]);
  });

  it('computes fire time from date+startTime minus the reminder offset', () => {
    const items = getFutureReminders(
      [exam({ startTime: '10:00', reminderMinutesBefore: 60 })],
      []
    );
    expect(items).toHaveLength(1);
    expect(items[0].fireAt).toEqual(new Date(2026, 8, 20, 9, 0, 0));
  });

  it('defaults to 9am when no specific time is set', () => {
    const items = getFutureReminders([], [deadline({ reminderMinutesBefore: 30 })]);
    expect(items[0].fireAt).toEqual(new Date(2026, 8, 20, 8, 30, 0));
  });

  it('excludes reminders whose fire time has already passed', () => {
    const items = getFutureReminders(
      [exam({ date: '2026-09-19', startTime: '10:00', reminderMinutesBefore: 300 })], // fires at 5am today, already past
      []
    );
    expect(items).toEqual([]);
  });

  it('excludes completed/archived deadlines and non-upcoming exams even with a reminder set', () => {
    const items = getFutureReminders(
      [exam({ status: 'completed', reminderMinutesBefore: 60 })],
      [deadline({ status: 'completed', reminderMinutesBefore: 60 })]
    );
    expect(items).toEqual([]);
  });

  it('sorts multiple reminders by fire time', () => {
    const items = getFutureReminders(
      [
        exam({ id: 'later', date: '2026-09-25', reminderMinutesBefore: 60 }),
        exam({ id: 'sooner', date: '2026-09-21', reminderMinutesBefore: 60 })
      ],
      []
    );
    expect(items.map((i) => i.entityId)).toEqual(['sooner', 'later']);
  });
});

describe('getDueReminders', () => {
  it('includes a reminder whose fire time just passed, within the grace window', () => {
    // fires at 9:45, "now" is 10:00 — 15 minutes ago, within default 30-min grace
    const items = getDueReminders(
      [exam({ date: '2026-09-19', startTime: '10:00', reminderMinutesBefore: 15 })],
      []
    );
    expect(items).toHaveLength(1);
  });

  it('excludes a reminder that already fired outside the grace window', () => {
    const items = getDueReminders(
      [exam({ date: '2026-09-18', startTime: '10:00', reminderMinutesBefore: 15 })], // fired yesterday
      []
    );
    expect(items).toEqual([]);
  });

  it('excludes a reminder already recorded as notified', () => {
    const items = getDueReminders(
      [exam({ id: 'e1', date: '2026-09-19', startTime: '10:00', reminderMinutesBefore: 15 })],
      ['exam-e1']
    );
    expect(items).toEqual([]);
  });

  it('excludes reminders still in the future', () => {
    const items = getDueReminders(
      [exam({ date: '2026-09-25', reminderMinutesBefore: 60 })],
      []
    );
    expect(items).toEqual([]);
  });
});
