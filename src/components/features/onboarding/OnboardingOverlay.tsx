import { FileSpreadsheet, Clock, ListChecks, BookOpen, CalendarDays } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSettingsStore } from '@/store/settingsStore';

const HIGHLIGHTS = [
  { icon: FileSpreadsheet, title: 'Exams', body: 'Log daily and weekly exam results manually — scores, rank, and notes.' },
  { icon: Clock, title: 'Deadlines', body: 'Track registration dates and submissions before they sneak up on you.' },
  { icon: ListChecks, title: 'Tasks', body: 'Plan study sessions, including ones that repeat on a schedule.' },
  { icon: BookOpen, title: 'Syllabus', body: 'Build your own course/chapter/topic structure and track progress.' },
  { icon: CalendarDays, title: 'Calendar', body: 'See everything — exams, deadlines, tasks — on one shared calendar.' }
];

export function OnboardingOverlay() {
  const { settings, updateSettings } = useSettingsStore();

  if (settings.onboardingCompleted) return null;

  function finish() {
    updateSettings({ onboardingCompleted: true });
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" role="presentation">
      <GlassCard
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="w-full max-w-md p-6"
      >
        <h1 id="onboarding-title" className="font-display text-xl font-semibold text-ink">
          Welcome to Exam Tracker
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Everything here is manual and local to this device — nothing is auto-graded or synced anywhere.
        </p>

        <ul className="mt-5 space-y-4">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="flex items-start gap-3">
              <h.icon size={20} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium text-ink">{h.title}</p>
                <p className="text-sm text-ink-muted">{h.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <Button onClick={finish} className="mt-6 w-full">
          Get started
        </Button>
      </GlassCard>
    </div>,
    document.body
  );
}
