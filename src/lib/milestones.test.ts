import { describe, it, expect } from 'vitest';
import { computeMilestones } from './milestones';
import type { Exam, Task, ActivityLogEntry } from '@/types';

function exam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'e', name: 'Test', type: 'daily', date: '2026-09-10', positiveMarks: 1, negativeMarks: 0,
    status: 'completed', tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}
function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 't', name: 'Task', priority: 'medium', status: 'completed', tagIds: [],
    createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}

describe('computeMilestones', () => {
  it('returns nothing when there is no data at all', () => {
    const result = computeMilestones({ exams: [], tasks: [], deadlines: [], syllabusNodes: [], activityEntries: [] });
    expect(result).toEqual([]);
  });

  it('reports first exam recorded once at least one exam exists', () => {
    const result = computeMilestones({
      exams: [exam({ id: 'e1' })],
      tasks: [],
      deadlines: [],
      syllabusNodes: [],
      activityEntries: []
    });
    expect(result.some((m) => m.id === 'first-exam')).toBe(true);
    expect(result.some((m) => m.id === 'exams-10')).toBe(false);
  });

  it('does not report the 10-exams milestone with only 3 exams', () => {
    const exams = [exam({ id: '1' }), exam({ id: '2' }), exam({ id: '3' })];
    const result = computeMilestones({ exams, tasks: [], deadlines: [], syllabusNodes: [], activityEntries: [] });
    expect(result.some((m) => m.id === 'exams-10')).toBe(false);
  });

  it('reports highest score from real percentage data', () => {
    const exams = [
      exam({ id: '1', correct: 50, totalMarks: 100, totalQuestions: 100 }),
      exam({ id: '2', correct: 90, totalMarks: 100, totalQuestions: 100 })
    ];
    const result = computeMilestones({ exams, tasks: [], deadlines: [], syllabusNodes: [], activityEntries: [] });
    const highest = result.find((m) => m.id === 'highest-score');
    expect(highest?.detail).toContain('90%');
  });

  it('reports 10-tasks-completed milestone', () => {
    const tasks = Array.from({ length: 10 }, (_, i) => task({ id: `t${i}` }));
    const result = computeMilestones({ exams: [], tasks, deadlines: [], syllabusNodes: [], activityEntries: [] });
    expect(result.some((m) => m.id === 'tasks-10')).toBe(true);
  });

  it('pulls the achieved-on date for a count milestone from the activity log', () => {
    const entries: ActivityLogEntry[] = [
      { id: 'a', entityType: 'exam', entityId: '1', message: 'Added exam "First"', timestamp: new Date(2026, 0, 5).getTime() }
    ];
    const result = computeMilestones({
      exams: [exam({ id: '1' })],
      tasks: [],
      deadlines: [],
      syllabusNodes: [],
      activityEntries: entries
    });
    const first = result.find((m) => m.id === 'first-exam');
    expect(first?.detail).toBe('Jan 5, 2026');
  });
});
