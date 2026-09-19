import { useEffect, useState } from 'react';
import { ExamForm } from '@/components/features/exams/ExamForm';
import { DeadlineForm } from '@/components/features/deadlines/DeadlineForm';
import { TaskForm } from '@/components/features/tasks/TaskForm';
import { DashboardGreeting } from '@/components/features/dashboard/DashboardGreeting';
import { MomentumCard } from '@/components/features/dashboard/MomentumCard';
import { FocusNowCard } from '@/components/features/dashboard/FocusNowCard';
import { DailyMission } from '@/components/features/dashboard/DailyMission';
import { TodaysTasksWidget } from '@/components/widgets/TodaysTasksWidget';
import { ExamCountdownHero } from '@/components/widgets/ExamCountdownHero';
import { NextDeadlineWidget } from '@/components/widgets/NextDeadlineWidget';
import { SyllabusProgressWidget } from '@/components/widgets/SyllabusProgressWidget';
import { useExamStore } from '@/store/examStore';
import { useDeadlineStore } from '@/store/deadlineStore';
import { useTaskStore } from '@/store/taskStore';
import { useSyllabusStore } from '@/store/syllabusStore';
import { useSettingsStore } from '@/store/settingsStore';
import { db } from '@/data/db';
import { isFuture, todayISO } from '@/lib/dates';
import { getVisibleOrderedIds } from '@/lib/dashboardWidgets';
import { computeDailyMission } from '@/lib/dailyMission';
import type { ActivityLogEntry } from '@/types';

export function Dashboard() {
  const { exams, hydrate: hydrateExams } = useExamStore();
  const { deadlines, hydrate: hydrateDeadlines } = useDeadlineStore();
  const { tasks, hydrate: hydrateTasks, toggleComplete } = useTaskStore();
  const { nodes: syllabusNodes, overallProgress, hydrate: hydrateSyllabus } = useSyllabusStore();
  const { settings, updateSettings } = useSettingsStore();

  const [examFormOpen, setExamFormOpen] = useState(false);
  const [deadlineFormOpen, setDeadlineFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [activityEntries, setActivityEntries] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    hydrateExams();
    hydrateDeadlines();
    hydrateTasks();
    hydrateSyllabus();
    db.activityLog.orderBy('timestamp').reverse().limit(500).toArray().then(setActivityEntries);
  }, [hydrateExams, hydrateDeadlines, hydrateTasks, hydrateSyllabus]);

  const todaysTasks = tasks.filter((t) => t.date === todayISO());
  const nextExam = exams
    .filter((e) => e.status === 'upcoming' && isFuture(e.date))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextDeadline = deadlines
    .filter((d) => d.status !== 'completed' && d.status !== 'archived')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const visibleIds = getVisibleOrderedIds(settings.dashboardLayout);

  const missionItems = computeDailyMission({ tasks, syllabusNodes, activityEntries });
  const missionDismissedToday = settings.dailyMissionDismissedDate === todayISO();
  const showMission = settings.showDailyMission && !missionDismissedToday && missionItems.length > 0;

  const compact = settings.density === 'compact';

  return (
    <div className={compact ? 'space-y-3 py-4' : 'space-y-5 py-6'}>
      <DashboardGreeting userName={settings.userName} exams={exams} deadlines={deadlines} tasks={tasks} />

      {settings.streaksEnabled && <MomentumCard activityEntries={activityEntries} />}

      {settings.showFocusNow && (
        <FocusNowCard exams={exams} deadlines={deadlines} tasks={tasks} syllabusNodes={syllabusNodes} />
      )}

      {showMission && (
        <DailyMission
          items={missionItems}
          onDismiss={() => updateSettings({ dailyMissionDismissedDate: todayISO() })}
        />
      )}

      {visibleIds.length === 0 ? (
        <p className="text-sm text-ink-muted">
          All dashboard widgets are hidden. Turn some back on from Settings → Dashboard.
        </p>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compact ? 'gap-3' : 'gap-4'}`}>
          {visibleIds.map((id) => {
            switch (id) {
              case 'todays-tasks':
                return (
                  <TodaysTasksWidget
                    key={id}
                    tasks={todaysTasks}
                    onToggle={toggleComplete}
                    onAddTask={() => setTaskFormOpen(true)}
                  />
                );
              case 'upcoming-exam':
                return (
                  <ExamCountdownHero
                    key={id}
                    exam={nextExam}
                    syllabusProgress={syllabusNodes.length > 0 ? overallProgress() : undefined}
                    onAddExam={() => setExamFormOpen(true)}
                  />
                );
              case 'next-deadline':
                return (
                  <NextDeadlineWidget
                    key={id}
                    deadline={nextDeadline}
                    onAddDeadline={() => setDeadlineFormOpen(true)}
                  />
                );
              case 'syllabus-progress':
                return <SyllabusProgressWidget key={id} progress={overallProgress()} itemCount={syllabusNodes.length} />;
              default:
                return null;
            }
          })}
        </div>
      )}

      <ExamForm open={examFormOpen} onClose={() => setExamFormOpen(false)} />
      <DeadlineForm open={deadlineFormOpen} onClose={() => setDeadlineFormOpen(false)} />
      <TaskForm open={taskFormOpen} onClose={() => setTaskFormOpen(false)} />
    </div>
  );
}
