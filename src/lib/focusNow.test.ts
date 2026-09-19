import { describe, it, expect } from 'vitest';
import { computeFocusNow } from './focusNow';
import { todayISO } from '@/lib/dates';
import type { Exam, Deadline, Task, SyllabusNode } from '@/types';

function baseExam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'e1', name: 'Physics Test', type: 'daily', date: todayISO(),
    positiveMarks: 1, negativeMarks: 0, status: 'upcoming', tagIds: [],
    createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}
function baseDeadline(overrides: Partial<Deadline> = {}): Deadline {
  return {
    id: 'd1', title: 'Form submission', date: todayISO(), priority: 'medium',
    status: 'upcoming', tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}
function baseTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1', name: 'Solve MCQs', priority: 'medium', status: 'todo', tagIds: [],
    createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}
function baseNode(overrides: Partial<SyllabusNode> = {}): SyllabusNode {
  return {
    id: 'n1', type: 'chapter', title: 'Vectors', progressState: 'not_started',
    progressPercent: 0, order: 0, tagIds: [], createdAt: 0, updatedAt: 0, archived: false, ...overrides
  };
}

describe('computeFocusNow', () => {
  it('prioritizes an overdue deadline above everything else', () => {
    const result = computeFocusNow({
      exams: [baseExam()],
      deadlines: [baseDeadline({ status: 'overdue', date: '2020-01-01' })],
      tasks: [baseTask({ date: todayISO() })],
      syllabusNodes: []
    });
    expect(result.eyebrow).toBe('Overdue');
    expect(result.ctaPath).toBe('/deadlines');
  });

  it('recommends a near-term exam when no overdue deadlines exist', () => {
    const result = computeFocusNow({
      exams: [baseExam({ date: todayISO() })],
      deadlines: [],
      tasks: [],
      syllabusNodes: []
    });
    expect(result.title).toBe('Physics Test');
    expect(result.ctaPath).toBe('/exams/e1');
  });

  it("falls back to 'clear' when nothing is pending", () => {
    const result = computeFocusNow({ exams: [], deadlines: [], tasks: [], syllabusNodes: [] });
    expect(result.eyebrow).toBe("You're clear");
  });

  it('recommends continuing syllabus when nothing else is pending but syllabus exists', () => {
    const result = computeFocusNow({
      exams: [],
      deadlines: [],
      tasks: [],
      syllabusNodes: [baseNode({ progressState: 'in_progress', progressPercent: 40 })]
    });
    expect(result.ctaPath).toBe('/syllabus');
    expect(result.subtitle).toContain('40%');
  });

  it('surfaces overdue tasks before today-only tasks', () => {
    const result = computeFocusNow({
      exams: [],
      deadlines: [],
      tasks: [baseTask({ name: 'Late task', date: '2020-01-01' }), baseTask({ name: 'Today task', date: todayISO() })],
      syllabusNodes: []
    });
    expect(result.title).toBe('Late task');
  });
});
