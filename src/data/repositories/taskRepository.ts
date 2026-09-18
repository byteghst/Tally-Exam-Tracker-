import { db } from '@/data/db';
import { createRepository } from './createRepository';
import type { Task } from '@/types';
import { expandRecurrence, todayISO } from '@/lib/dates';

const base = createRepository<Task>(db.tasks);

export const taskRepository = {
  ...base,

  async onDate(dateISO: string): Promise<Task[]> {
    return db.tasks.where('date').equals(dateISO).toArray();
  },

  async today(): Promise<Task[]> {
    return this.onDate(todayISO());
  },

  /**
   * Generates concrete task instances for a recurring series within a date
   * window, skipping dates that already have a materialized instance.
   * Call this lazily (e.g. when opening Calendar/Tasks for a date range)
   * rather than pre-generating years of rows up front.
   */
  async ensureRecurringInstances(seriesTask: Task, fromISO: string, toISO: string): Promise<void> {
    if (!seriesTask.recurrence || !seriesTask.date) return;
    const seriesId = seriesTask.seriesId ?? seriesTask.id;
    const occurrences = expandRecurrence(seriesTask.recurrence, seriesTask.date, fromISO, toISO);
    const existing = await db.tasks.where('seriesId').equals(seriesId).toArray();
    const existingDates = new Set(existing.map((t) => t.date));

    const toCreate = occurrences.filter((d) => !existingDates.has(d) && d !== seriesTask.date);
    const now = Date.now();
    const newTasks: Task[] = toCreate.map((date) => ({
      ...seriesTask,
      id: crypto.randomUUID(),
      date,
      status: 'todo',
      seriesId,
      createdAt: now,
      updatedAt: now,
      archived: false
    }));
    if (newTasks.length > 0) await db.tasks.bulkAdd(newTasks);
  }
};
