import { useEffect, useMemo } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/Badge';
import { useExamStore } from '@/store/examStore';
import { useTaskStore } from '@/store/taskStore';
import { calculateScore } from '@/lib/scoring';

export function Analytics() {
  const { exams, hydrate: hydrateExams } = useExamStore();
  const { tasks, hydrate: hydrateTasks } = useTaskStore();

  useEffect(() => {
    hydrateExams();
    hydrateTasks();
  }, [hydrateExams, hydrateTasks]);

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

  if (completedExams.length === 0 && tasks.length === 0) {
    return (
      <div className="py-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Analytics</h1>
        <div className="mt-5">
          <EmptyState
            title="Not enough data yet"
            description="Analytics build up automatically from exams and tasks you record — nothing is estimated."
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
        <MetricCard label="Average percentage" value={avgPercentage !== null ? `${avgPercentage}%` : '—'} />
        <MetricCard label="Total tasks" value={tasks.length} />
        <MetricCard label="Task completion" value={taskCompletionRate !== null ? `${taskCompletionRate}%` : '—'} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">{value}</p>
    </GlassCard>
  );
}
