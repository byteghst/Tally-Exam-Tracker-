import { db } from '@/data/db';
import { createRepository } from './createRepository';
import type { Deadline } from '@/types';
import { isPast, isToday, todayISO } from '@/lib/dates';

const base = createRepository<Deadline>(db.deadlines);

export const deadlineRepository = {
  ...base,

  /** Recomputes derived statuses (upcoming/due_today/overdue) against today's date. */
  async withComputedStatus(): Promise<Deadline[]> {
    const all = await base.list();
    return all.map((d) => {
      if (d.status === 'completed' || d.status === 'archived') return d;
      if (isToday(d.date)) return { ...d, status: 'due_today' as const };
      if (isPast(d.date)) return { ...d, status: 'overdue' as const };
      return { ...d, status: 'upcoming' as const };
    });
  },

  async dueOn(dateISO: string): Promise<Deadline[]> {
    return db.deadlines.where('date').equals(dateISO).toArray();
  },

  async today(): Promise<Deadline[]> {
    return this.dueOn(todayISO());
  }
};
