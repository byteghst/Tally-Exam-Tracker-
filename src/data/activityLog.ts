import { db } from './db';
import type { ActivityEntityType } from '@/types';

/**
 * Fire-and-forget by design: every call site invokes this without awaiting,
 * since a logging failure should never block or crash the actual mutation
 * that triggered it. Errors are swallowed here rather than left as an
 * unhandled promise rejection.
 */
export async function logActivity(entityType: ActivityEntityType, entityId: string, message: string) {
  try {
    await db.activityLog.add({
      id: crypto.randomUUID(),
      entityType,
      entityId,
      message,
      timestamp: Date.now()
    });
  } catch {
    // logging is best-effort; the underlying action already succeeded
  }
}