import { describe, it, expect } from 'vitest';
import { deadlineFormSchema } from './deadlineSchema';

const base = {
  title: 'Scholarship form submission',
  date: '2026-10-01',
  priority: 'medium' as const
};

describe('deadlineFormSchema', () => {
  it('accepts a minimal valid deadline', () => {
    expect(deadlineFormSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(deadlineFormSchema.safeParse({ ...base, title: '  ' }).success).toBe(false);
  });

  it('rejects a missing date', () => {
    expect(deadlineFormSchema.safeParse({ ...base, date: '' }).success).toBe(false);
  });

  it('rejects a negative reminder', () => {
    expect(deadlineFormSchema.safeParse({ ...base, reminderMinutesBefore: -5 }).success).toBe(false);
  });
});
