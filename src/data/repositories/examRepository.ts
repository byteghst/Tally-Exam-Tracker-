import { db } from '@/data/db';
import { createRepository } from './createRepository';
import type { Exam, ExamType, ExamStatus } from '@/types';

const base = createRepository<Exam>(db.exams);

export const examRepository = {
  ...base,

  async byType(type: ExamType): Promise<Exam[]> {
    const all = await base.list();
    return all.filter((e) => e.type === type);
  },

  async byStatus(status: ExamStatus): Promise<Exam[]> {
    const all = await base.list();
    return all.filter((e) => e.status === status);
  },

  async inDateRange(fromISO: string, toISO: string): Promise<Exam[]> {
    return db.exams.where('date').between(fromISO, toISO, true, true).toArray();
  }
};
