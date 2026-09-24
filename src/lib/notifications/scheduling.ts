import type { Exam, Deadline } from '@/types';
import { parseISODate } from '@/lib/dates';

export type ReminderKind = 'exam' | 'deadline';

export interface ReminderItem {
  /** Composite id, e.g. "exam-<uuid>" — stable per entity, used for native
   *  notification ids (hashed) and web dedupe tracking. */
  id: string;
  kind: ReminderKind;
  entityId: string;
  title: string;
  body: string;
  /** When the reminder should actually fire. */
  fireAt: Date;
  /** When the exam/deadline itself happens — for building the "in Xh" body text. */
  targetAt: Date;
}

const DEFAULT_HOUR = 9; // used when an exam/deadline has no specific time set

function combineDateAndTime(dateISO: string, time: string | undefined): Date {
  const d = parseISODate(dateISO);
  if (time) {
    const [h, m] = time.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(DEFAULT_HOUR, 0, 0, 0);
  }
  return d;
}

function minutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${rest}m`;
}

/**
 * Builds the full list of reminders that have a fire time in the future.
 * This is what the native scheduler asks the OS to schedule.
 */
export function getFutureReminders(exams: Exam[], deadlines: Deadline[], now: Date = new Date()): ReminderItem[] {
  const items: ReminderItem[] = [];

  for (const e of exams) {
    if (!e.reminderMinutesBefore || e.status !== 'upcoming') continue;
    const targetAt = combineDateAndTime(e.date, e.startTime);
    const fireAt = new Date(targetAt.getTime() - e.reminderMinutesBefore * 60_000);
    if (fireAt.getTime() <= now.getTime()) continue;
    items.push({
      id: `exam-${e.id}`,
      kind: 'exam',
      entityId: e.id,
      title: e.name,
      body: `Exam in ${minutesLabel(e.reminderMinutesBefore)}`,
      fireAt,
      targetAt
    });
  }

  for (const d of deadlines) {
    if (!d.reminderMinutesBefore || d.status === 'completed' || d.status === 'archived') continue;
    const targetAt = combineDateAndTime(d.date, d.time);
    const fireAt = new Date(targetAt.getTime() - d.reminderMinutesBefore * 60_000);
    if (fireAt.getTime() <= now.getTime()) continue;
    items.push({
      id: `deadline-${d.id}`,
      kind: 'deadline',
      entityId: d.id,
      title: d.title,
      body: `Due in ${minutesLabel(d.reminderMinutesBefore)}`,
      fireAt,
      targetAt
    });
  }

  return items.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}

/**
 * Reminders whose fire time has already passed (within a grace window, so a
 * closed tab/app that was reopened doesn't miss one entirely) and that
 * haven't already been shown.
 */
export function getDueReminders(
  exams: Exam[],
  deadlines: Deadline[],
  alreadyNotifiedIds: string[] = [],
  now: Date = new Date(),
  graceMinutes = 30
): ReminderItem[] {
  const notified = new Set(alreadyNotifiedIds);
  const graceMs = graceMinutes * 60_000;
  return getAllReminders(exams, deadlines).filter((item) => {
    if (notified.has(item.id)) return false;
    const diff = now.getTime() - item.fireAt.getTime();
    return diff >= 0 && diff <= graceMs;
  });
}

/** All reminders regardless of whether they're in the future or past relative
 *  to right now — reuses getFutureReminders with an epoch "now" so its
 *  future-only filter doesn't exclude anything. */
function getAllReminders(exams: Exam[], deadlines: Deadline[]): ReminderItem[] {
  return getFutureReminders(exams, deadlines, new Date(0));
                                               }
                                   
