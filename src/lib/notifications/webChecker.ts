import { getDueReminders } from './scheduling';
import type { Exam, Deadline } from '@/types';

export function isWebNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getWebNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isWebNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestWebNotificationPermission(): Promise<boolean> {
  if (!isWebNotificationSupported()) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Checks for any reminder whose time has just passed and fires a real
 * browser Notification for it. This only runs while this code is actually
 * executing — i.e. the tab/installed PWA is open (or was just reopened,
 * thanks to the grace window in getDueReminders). Standard web
 * notifications have no equivalent to Android's AlarmManager: there's no
 * way to reliably wake up and fire one while the app is fully closed
 * without a push server, which this local-first app deliberately doesn't
 * have. That's a real platform limitation, not a shortcut taken here.
 */
export function checkAndFireWebReminders(
  exams: Exam[],
  deadlines: Deadline[],
  alreadyNotifiedIds: string[],
  onFired: (newlyFiredIds: string[]) => void
): void {
  if (!isWebNotificationSupported() || Notification.permission !== 'granted') return;
  const due = getDueReminders(exams, deadlines, alreadyNotifiedIds);
  if (due.length === 0) return;

  for (const item of due) {
    new Notification(item.kind === 'exam' ? `Exam: ${item.title}` : `Deadline: ${item.title}`, {
      body: item.body,
      tag: item.id
    });
  }
  onFired(due.map((d) => d.id));
}

export function sendTestWebNotification(): void {
  if (!isWebNotificationSupported() || Notification.permission !== 'granted') return;
  new Notification('Tally', { body: 'Notifications are working.' });
}
