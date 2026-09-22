import { useEffect, useMemo, useState } from 'react';
import { Award, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/Badge';
import { ExamScoreTrendChart } from '@/components/features/analytics/ExamScoreTrendChart';
import { TaskCompletionTrendChart } from '@/components/features/analytics/TaskCompletionTrendChart';
import { useExamStore } from '@/store/examStore';
import { useTaskStore } from '@/store/taskStore';
import { useDeadlineStore } from '@/store/deadlineStore';
import { useSyllabusStore } from '@/store/syllabusStore';
import { calculateScore } from '@/lib/scoring';
import { computeMilestones } from '@/lib/milestones';
import { useCountUp } from '@/hooks/useCountUp';
import { db } from '@/data/db';
import type { ActivityLogEntry } from '@/types';

export function Analytics() {
  const { exams, hydrate: hydrateExams } = useExamStore();
  const { tasks, hydrate: hydrateTasks } = useTaskStore();
  const { deadlines, hydrate: hydrateDeadlines } = useDeadlineStore();
  const { nodes: syllabusNodes, hydrate: hydrateSyllabus } = useSyllabusStore();
  const [activityEntries, setActivityEntries] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    hydrateExams();
    hydrateTasks();
    hydrateDeadlines();
    hydrateSyllabus();
    db.activityLog.toArray().then(setActivityEntries);
  }, [hydrateExams, hydrateTasks, hydrateDeadlines, hydrateSyllabus]);

  const completedExams = exams.filter((e) => e.status === 'completed');

  const avgPercentage = useMemo(() => {
    if (completedExams.length === 0) return null;
    const values = completedExams
      .map((e) =>
        calculateScore(
          {
            correct: e.correct,
            wrong: e.wrong,
            unanswered: e.unanswered,
            positiveMarks: e.positiveMarks,
            negativeMarks: e.negativeMarks,
            totalMarks: e.totalMarks,
            manualScore: e.manualScoreOverride
          },
          e.totalQuestions
        ).percentage
      )
      .filter((p): p is number => p !== null);
    if (values.length === 0) return null;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }, [completedExams]);

  const taskCompletionRate =
    tasks.length > 0
      ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
      : null;

  const milestones = useMemo(
    () => computeMilestones({ exams, tasks, deadlines, syllabusNodes, activityEntries }),
    [exams, tasks, deadlines, syllabusNodes, activityEntries]
  );

  if (completedExams.length === 0 && tasks.length === 0) {
    return (
      <div className="py-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Analytics</h1>
        <div className="mt-5">
          <EmptyState
            title="Not enough data yet"
            description="Analytics build up automatically from exams and tasks you record — nothing is estimated."
            icon={BarChart3}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Analytics</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total exams" value={exams.length} />
        <MetricCard label="Average percentage" value={avgPercentage} suffix="%" />
        <MetricCard label="Total tasks" value={tasks.length} />
        <MetricCard label="Task completion" value={taskCompletionRate} suffix="%" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ExamScoreTrendChart exams={completedExams} />
        <TaskCompletionTrendChart tasks={tasks} />
      </div>

      {milestones.length > 0 && (
        <GlassCard className="p-5">
          <p className="mb-3 text-sm font-medium text-ink-muted">Milestones</p>
          <ul className="space-y-3">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-start gap-3">
                <Award size={18} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-sm text-ink">{m.label}</p>
                  {m.detail && <p className="text-xs text-ink-faint">{m.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}

function MetricCard({ label, value, suffix }: { label: string; value: number | null; suffix?: string }) {
  const animated = useCountUp(value ?? 0, 700, suffix === '%' ? 1 : 0);
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
        {value === null ? '—' : `${animated}${suffix ?? ''}`}
      </p>
    </GlassCard>
  );
}
