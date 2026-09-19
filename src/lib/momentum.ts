import type { ActivityLogEntry } from '@/types';
import { toISODate, todayISO } from '@/lib/dates';

export interface MomentumDay {
  iso: string;
  label: string; // single-letter weekday, e.g. 'M'
  productive: boolean;
  isToday: boolean;
}

export interface MomentumResult {
  days: MomentumDay[];
  productiveCount: number;
}

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isCompletionMessage(message: string): boolean {
  return message.startsWith('Completed');
}

/**
 * A day counts as "productive" if at least one entity was marked complete
 * that day, per the activity log — no separate streak counter, no fabricated
 * points. Purely a read of what already happened.
 */
export function computeMomentum(entries: ActivityLogEntry[], daysBack = 7): MomentumResult {
  const productiveDates = new Set(
    entries.filter((e) => isCompletionMessage(e.message)).map((e) => toISODate(new Date(e.timestamp)))
  );

  const today = todayISO();
  const days: MomentumDay[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = toISODate(d);
    days.push({
      iso,
      label: WEEKDAY_LETTERS[d.getDay()],
      productive: productiveDates.has(iso),
      isToday: iso === today
    });
  }

  return {
    days,
    productiveCount: days.filter((d) => d.productive).length
  };
}

/** Count of distinct all-time productive days (used for milestones, not the 7-day strip). */
export function countAllTimeProductiveDays(entries: ActivityLogEntry[]): number {
  const dates = new Set(
    entries.filter((e) => isCompletionMessage(e.message)).map((e) => toISODate(new Date(e.timestamp)))
  );
  return dates.size;
}
