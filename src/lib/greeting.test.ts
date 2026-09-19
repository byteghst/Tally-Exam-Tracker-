import { describe, it, expect } from 'vitest';
import { computeGreetingSummary } from './greeting';
import { todayISO } from '@/lib/dates';
import type { Exam, Deadline, Task } from '@/types';

function task(overrides: Partial<Task> = {}): Task {
  return { id: 't', name: 'Task', priority: 'medium', status: 'todo', tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides };
}

describe('computeGreetingSummary', () => {
  it('shows a first-use message when there is no data at all', () => {
    const result = computeGreetingSummary({ exams: [], deadlines: [], tasks: [], hour: 9 });
    expect(result.headline).toMatch(/first exam/);
    expect(result.timeGreeting).toBe('Good morning');
  });

  it('counts important things across tasks, deadlines and exams today', () => {
    const result = computeGreetingSummary({
      exams: [],
      deadlines: [],
      tasks: [task({ date: todayISO() }), task({ id: 't2', date: todayISO() })],
      hour: 14
    });
    expect(result.headline).toBe('You have 2 important things today.');
    expect(result.timeGreeting).toBe('Good afternoon');
  });

  it("says everything is done when today's tasks are all completed", () => {
    const result = computeGreetingSummary({
      exams: [],
      deadlines: [],
      tasks: [task({ date: todayISO(), status: 'completed' })],
      hour: 20
    });
    expect(result.headline).toBe('Everything is done for today.');
    expect(result.timeGreeting).toBe('Good evening');
  });

  it('says nothing urgent when there is data overall but nothing today', () => {
    const result = computeGreetingSummary({
      exams: [{ id: 'e', name: 'X', type: 'daily', date: '2099-01-01', positiveMarks: 1, negativeMarks: 0, status: 'upcoming', tagIds: [], createdAt: 0, updatedAt: 0, archived: false } as Exam],
      deadlines: [] as Deadline[],
      tasks: [],
      hour: 10
    });
    expect(result.headline).toBe('Nothing urgent today.');
  });
});
