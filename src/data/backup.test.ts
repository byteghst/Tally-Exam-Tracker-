import { describe, it, expect } from 'vitest';
import { validateBackup, previewBackup } from './backup';

const validBackup = {
  schemaVersion: 1,
  exportedAt: Date.now(),
  exams: [{ id: '1', name: 'Test' }],
  deadlines: [],
  syllabusNodes: [{ id: 'a' }, { id: 'b' }],
  tasks: [{ id: 't1' }, { id: 't2' }, { id: 't3' }],
  tags: []
};

describe('validateBackup', () => {
  it('accepts a well-formed backup object', () => {
    const result = validateBackup(validBackup);
    expect(result.ok).toBe(true);
  });

  it('rejects a completely unrelated JSON shape', () => {
    const result = validateBackup({ hello: 'world' });
    expect(result.ok).toBe(false);
  });

  it('rejects a non-object value', () => {
    const result = validateBackup('just a string');
    expect(result.ok).toBe(false);
  });

  it('defaults missing arrays to empty rather than failing', () => {
    const result = validateBackup({ schemaVersion: 1, exportedAt: Date.now() });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.exams).toEqual([]);
    }
  });
});

describe('previewBackup', () => {
  it('counts each entity type correctly', () => {
    const result = validateBackup(validBackup);
    if (!result.ok) throw new Error('expected valid backup');
    const preview = previewBackup(result.data);
    expect(preview).toEqual({
      examCount: 1,
      deadlineCount: 0,
      syllabusCount: 2,
      taskCount: 3
    });
  });
});
