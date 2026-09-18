import { describe, it, expect } from 'vitest';
import { taskFormSchema } from './taskSchema';

const base = {
  name: 'Solve last 5 years MCQ',
  date: '2026-09-20',
  priority: 'medium' as const,
  recurrenceEnabled: false
};

describe('taskFormSchema', () => {
  it('accepts a minimal non-recurring task', () => {
    expect(taskFormSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(taskFormSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });

  it('requires a recurrence config when recurrenceEnabled is true', () => {
    const result = taskFormSchema.safeParse({ ...base, recurrenceEnabled: true });
    expect(result.success).toBe(false);
  });

  it('accepts a daily recurrence', () => {
    const result = taskFormSchema.safeParse({
      ...base,
      recurrenceEnabled: true,
      recurrence: { freq: 'daily' }
    });
    expect(result.success).toBe(true);
  });

  it('rejects a weekly recurrence with no days selected', () => {
    const result = taskFormSchema.safeParse({
      ...base,
      recurrenceEnabled: true,
      recurrence: { freq: 'weekly', daysOfWeek: [] }
    });
    expect(result.success).toBe(false);
  });

  it('accepts a weekly recurrence with days selected', () => {
    const result = taskFormSchema.safeParse({
      ...base,
      recurrenceEnabled: true,
      recurrence: { freq: 'weekly', daysOfWeek: [1, 3, 5] }
    });
    expect(result.success).toBe(true);
  });
});
