import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useExamStore } from '@/store/examStore';
import { useDeadlineStore } from '@/store/deadlineStore';
import { useSettingsStore } from '@/store/settingsStore';
import { syncNativeReminders } from '@/lib/notifications/nativeScheduler';
import { checkAndFireWebReminders } from '@/lib/notifications/webChecker';

const WEB_CHECK_INTERVAL_MS = 60_000;

/**
 * Keeps scheduled reminders in sync with current exam/deadline data.
 * Native: reschedules with the OS whenever the underlying data changes.
 * Web: re-checks on an interval and whenever the tab regains visibility,
 * since that's the only time web notifications can act at all.
 */
export function useNotificationSync() {
  const exams = useExamStore((s) => s.exams);
  const deadlines = useDeadlineStore((s) => s.deadlines);
  const { settings, updateSettings } = useSettingsStore();

  // kept in a ref so the interval/visibility callbacks below always read
  // the latest prefs/notified-ids without needing to be recreated
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const eligibleExams = settings.notificationPrefs.exams ? exams : [];
  const eligibleDeadlines = settings.notificationPrefs.deadlines ? deadlines : [];

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    syncNativeReminders(eligibleExams, eligibleDeadlines).catch(() => {
      // scheduling is best-effort; a failure here shouldn't break the app
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibleExams, eligibleDeadlines]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    function check() {
      checkAndFireWebReminders(eligibleExams, eligibleDeadlines, settingsRef.current.notifiedReminderIds, (firedIds) => {
        updateSettings({
          notifiedReminderIds: [...settingsRef.current.notifiedReminderIds, ...firedIds]
        });
      });
    }

    check();
    const interval = setInterval(check, WEB_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibleExams, eligibleDeadlines]);
}
