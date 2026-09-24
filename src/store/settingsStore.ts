import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  accentColor: '#284EFE',
  glassIntensity: 60,
  blurIntensity: 40,
  radius: 16,
  density: 'comfortable',
  animationLevel: 'full',
  reducedTransparency: false,
  dateFormat: 'MMM d, yyyy',
  timeFormat: '12h',
  firstDayOfWeek: 0,
  scoringPrecision: 2,
  defaultExamType: 'daily',
  defaultTaskPriority: 'medium',
  notificationPrefs: { exams: true, deadlines: true, tasks: true },
  dashboardLayout: [
    { id: 'todays-tasks', visible: true, order: 0, size: 'md' },
    { id: 'upcoming-exam', visible: true, order: 1, size: 'md' },
    { id: 'next-deadline', visible: true, order: 2, size: 'md' },
    { id: 'syllabus-progress', visible: true, order: 3, size: 'md' }
  ],
  streaksEnabled: true,
  onboardingCompleted: false,
  showFocusNow: true,
  showDailyMission: true,
  celebratedMilestoneIds: [],
  celebrationBaselineDone: false,
  notifiedReminderIds: []
};

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (changes: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (changes) => set({ settings: { ...get().settings, ...changes } }),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS })
    }),
    { name: 'exam-tracker-settings' }
  )
);
