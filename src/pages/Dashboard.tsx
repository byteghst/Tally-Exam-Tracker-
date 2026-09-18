import { useEffect, useState } from 'react';
import { ExamForm } from '@/components/features/exams/ExamForm';
import { DeadlineForm } from '@/components/features/deadlines/DeadlineForm';
import { TaskForm } from '@/components/features/tasks/TaskForm';
import { TodaysTasksWidget } from '@/components/widgets/TodaysTasksWidget';
import { UpcomingExamWidget } from '@/components/widgets/UpcomingExamWidget';
import { NextDeadlineWidget } from '@/components/widgets/NextDeadlineWidget';
import { SyllabusProgressWidget } from '@/components/widgets/SyllabusProgressWidget';
import { useExamStore } from '@/store/examStore';
import { useDeadlineStore } from '@/store/deadlineStore';
import { useTaskStore } from '@/store/taskStore';
import { useSyllabusStore } from '@/store/syllabusStore';
import { useSettingsStore } from '@/store/settingsStore';
import { isFuture, todayISO } from '@/lib/dates';
import { getVisibleOrderedIds } from '@/lib/dashboardWidgets';

export function Dashboard() {
  const { exams, hydrate: hydrateExams } = useExamStore();
  const { deadlines, hydrate: hydrateDeadlines } = useDeadlineStore();
  const { tasks, hydrate: hydrateTasks, toggleComplete } = useTaskStore();
  const { overallProgress, hydrate: hydrateSyllabus } = useSyllabusStore();
  const { settings } = useSettingsStore();

  const [examFormOpen, setExamFormOpen] = useState(false);
  const [deadlineFormOpen, setDeadlineFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  useEffect(() => {
    hydrateExams();
    hydrateDeadlines();
    hydrateTasks();
    hydrateSyllabus();
  }, [hydrateExams, hydrateDeadlines, hydrateTasks, hydrateSyllabus]);

  const todaysTasks = tasks.filter((t) => t.date === todayISO());
  const nextExam = exams
    .filter((e) => e.status === 'upcoming' && isFuture(e.date))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextDeadline = deadlines
    .filter((d) => d.status !== 'completed' && d.status !== 'archived')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const visibleIds = getVisibleOrderedIds(settings.dashboardLayout);

  return (
    <div className="space-y-6 py-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">Today</h1>
        <p className="text-sm text-ink-muted">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {visibleIds.length === 0 ? (
        <p className="text-sm text-ink-muted">
          All dashboard widgets are hidden. Turn some back on from Settings → Dashboard.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                return <UpcomingExamWidget key={id} exam={nextExam} onAddExam={() => setExamFormOpen(true)} />;
              case 'next-deadline':
                return (
                  <NextDeadlineWidget
                    key={id}
                    deadline={nextDeadline}
                    onAddDeadline={() => setDeadlineFormOpen(true)}
                  />
                );
              case 'syllabus-progress':
                return <SyllabusProgressWidget key={id} progress={overallProgress()} />;
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
