import { z } from 'zod';
import { db } from '@/data/db';

// Loose but real validation — every top-level key must be an array if present.
// Per-entity field validation happens at the form layer (zod schemas in
// lib/validation); this guards against corrupt/foreign JSON on import.
const BackupSchema = z.object({
  schemaVersion: z.number(),
  exportedAt: z.number(),
  exams: z.array(z.record(z.unknown())).default([]),
  deadlines: z.array(z.record(z.unknown())).default([]),
  syllabusNodes: z.array(z.record(z.unknown())).default([]),
  tasks: z.array(z.record(z.unknown())).default([]),
  tags: z.array(z.record(z.unknown())).default([]),
  activityLog: z.array(z.record(z.unknown())).default([])
});

export type Backup = z.infer<typeof BackupSchema>;

export async function exportBackup(): Promise<Backup> {
  const [exams, deadlines, syllabusNodes, tasks, tags, activityLog] = await Promise.all([
    db.exams.toArray(),
    db.deadlines.toArray(),
    db.syllabusNodes.toArray(),
    db.tasks.toArray(),
    db.tags.toArray(),
    db.activityLog.toArray()
  ]);
  return {
    schemaVersion: 1,
    exportedAt: Date.now(),
    exams,
    deadlines,
    syllabusNodes,
    tasks,
    tags,
    activityLog
  } as unknown as Backup;
}

export function downloadBackupFile(backup: Backup, filename = `tally-backup-${Date.now()}.json`) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportPreview {
  examCount: number;
  deadlineCount: number;
  syllabusCount: number;
  taskCount: number;
}

export function validateBackup(raw: unknown): { ok: true; data: Backup } | { ok: false; error: string } {
  const parsed = BackupSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'This file is not a valid Tally backup.' };
  }
  return { ok: true, data: parsed.data };
}

export function previewBackup(backup: Backup): ImportPreview {
  return {
    examCount: backup.exams.length,
    deadlineCount: backup.deadlines.length,
    syllabusCount: backup.syllabusNodes.length,
    taskCount: backup.tasks.length
  };
}

/**
 * Applies an imported backup.
 * mode 'replace' clears each store first; 'merge' upserts by id (bulkPut),
 * so existing records with the same id are overwritten and others are kept.
 */
export async function applyBackup(backup: Backup, mode: 'merge' | 'replace'): Promise<void> {
  await db.transaction(
    'rw',
    [db.exams, db.deadlines, db.syllabusNodes, db.tasks, db.tags, db.activityLog],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.exams.clear(),
          db.deadlines.clear(),
          db.syllabusNodes.clear(),
          db.tasks.clear(),
          db.tags.clear(),
          db.activityLog.clear()
        ]);
      }
      await Promise.all([
        db.exams.bulkPut(backup.exams as never[]),
        db.deadlines.bulkPut(backup.deadlines as never[]),
        db.syllabusNodes.bulkPut(backup.syllabusNodes as never[]),
        db.tasks.bulkPut(backup.tasks as never[]),
        db.tags.bulkPut(backup.tags as never[]),
        db.activityLog.bulkPut(backup.activityLog as never[])
      ]);
    }
  );
}
