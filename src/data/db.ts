import Dexie, { type Table } from 'dexie';
import type {
  Exam,
  Deadline,
  SyllabusNode,
  Task,
  Tag,
  ActivityLogEntry
} from '@/types';

/**
 * Single Dexie database, one object store per entity.
 * Deliberately NOT one giant JSON blob — each store can be queried/indexed
 * independently and imports can merge per-store.
 */
export class ExamTrackerDB extends Dexie {
  exams!: Table<Exam, string>;
  deadlines!: Table<Deadline, string>;
  syllabusNodes!: Table<SyllabusNode, string>;
  tasks!: Table<Task, string>;
  tags!: Table<Tag, string>;
  activityLog!: Table<ActivityLogEntry, string>;

  constructor() {
    super('exam-tracker-db');

    // schemaVersion 1 — initial shape. Bump this and add .version(N) blocks
    // with upgrade functions whenever a stored shape changes.
    this.version(1).stores({
      exams: 'id, date, type, status, updatedAt',
      deadlines: 'id, date, status, priority, updatedAt',
      syllabusNodes: 'id, parentId, type, updatedAt',
      tasks: 'id, date, status, seriesId, updatedAt',
      tags: 'id, name',
      activityLog: 'id, timestamp, entityType'
    });
  }
}

export const db = new ExamTrackerDB();
