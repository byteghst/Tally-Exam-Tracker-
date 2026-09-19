import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeDailyMission } from './dailyMission';
import { todayISO } from '@/lib/dates';
import type { Task, SyllabusNode, ActivityLogEntry } from '@/types';

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1', name: 'Task', priority: 'medium', status: 'todo', tagIds: [],
    createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}
function node(overrides: Partial<SyllabusNode> = {}): SyllabusNode {
  return {
    id: 'n1', type: 'chapter', title: 'Node', progressState: 'not_started',
    progressPercent: 0, order: 0, tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 19, 10, 0, 0));
});
afterEach(() => vi.useRealTimers());

describe('computeDailyMission', () => {
  it('returns no items when there is nothing today and no in-progress syllabus', () => {
    expect(computeDailyMission({ tasks: [], syllabusNodes: [], activityEntries: [] })).toEqual([]);
  });

  it("includes a tasks item marked done only when all of today's tasks are completed", () => {
    const items = computeDailyMission({
      tasks: [task({ date: todayISO(), status: 'completed' }), task({ id: 't2', date: todayISO(), status: 'todo' })],
      syllabusNodes: [],
      activityEntries: []
    });
    expect(items.find((i) => i.id === 'tasks')?.done).toBe(false);
  });

  it('marks tasks item done when every scheduled task today is completed', () => {
    const items = computeDailyMission({
      tasks: [task({ date: todayISO(), status: 'completed' })],
      syllabusNodes: [],
      activityEntries: []
    });
    expect(items.find((i) => i.id === 'tasks')?.done).toBe(true);
  });

  it('includes a syllabus item when something is in progress', () => {
    const items = computeDailyMission({
      tasks: [],
      syllabusNodes: [node({ progressState: 'in_progress' })],
      activityEntries: []
    });
    expect(items.find((i) => i.id === 'syllabus')).toBeTruthy();
  });

  it('marks syllabus item done based on a real completion log entry today, not fabricated state', () => {
    const entries: ActivityLogEntry[] = [
      { id: 'a1', entityType: 'syllabus', entityId: 'n1', message: 'Completed syllabus item "Node"', timestamp: Date.now() }
    ];
    const items = computeDailyMission({ tasks: [], syllabusNodes: [], activityEntries: entries });
    expect(items.find((i) => i.id === 'syllabus')?.done).toBe(true);
  });
});
