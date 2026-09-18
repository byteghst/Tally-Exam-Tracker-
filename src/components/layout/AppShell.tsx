import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ToastStack } from './ToastStack';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { OnboardingOverlay } from '@/components/features/onboarding/OnboardingOverlay';
import { useExamStore } from '@/store/examStore';
import { useDeadlineStore } from '@/store/deadlineStore';
import { useTaskStore } from '@/store/taskStore';
import { useSyllabusStore } from '@/store/syllabusStore';

export function AppShell() {
  const hydrateExams = useExamStore((s) => s.hydrate);
  const hydrateDeadlines = useDeadlineStore((s) => s.hydrate);
  const hydrateTasks = useTaskStore((s) => s.hydrate);
  const hydrateSyllabus = useSyllabusStore((s) => s.hydrate);

  // hydrate everything once at the shell level so search/command-palette
  // results are available immediately regardless of which page loads first;
  // individual pages also hydrate their own domain, which is a harmless,
  // idempotent re-fetch, not a source of truth conflict
  useEffect(() => {
    hydrateExams();
    hydrateDeadlines();
    hydrateTasks();
    hydrateSyllabus();
  }, [hydrateExams, hydrateDeadlines, hydrateTasks, hydrateSyllabus]);

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-safe-top md:px-8 md:pb-8">
          <TopBar />
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <ToastStack />
      <CommandPalette />
      <OnboardingOverlay />
    </div>
  );
}
