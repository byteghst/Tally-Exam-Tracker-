import { db } from '@/data/db';
import { createRepository } from './createRepository';
import type { SyllabusNode } from '@/types';

const base = createRepository<SyllabusNode>(db.syllabusNodes);

export const syllabusRepository = {
  ...base,

  async children(parentId?: string): Promise<SyllabusNode[]> {
    const all = await base.list();
    return all.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order);
  },

  /** Overall progress across all leaf-ish nodes (simple average; UI may weight later). */
  async overallProgress(): Promise<number> {
    const all = await base.list();
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, n) => acc + n.progressPercent, 0);
    return Math.round(sum / all.length);
  }
};
