import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { describeCountdown } from '@/lib/dates';
import type { Exam } from '@/types';

export function UpcomingExamWidget({ exam, onAddExam }: { exam?: Exam; onAddExam: () => void }) {
  return (
    <GlassCard className="p-5">
      <p className="text-sm font-medium text-ink-muted">Upcoming exam</p>
      {exam ? (
        <>
          <p className="mt-2 font-display text-lg font-semibold text-ink">{exam.name}</p>
          <p className="text-sm text-ink-muted">{describeCountdown(exam.date)}</p>
        </>
      ) : (
        <EmptyState
          title="No upcoming exams"
          description="Exams you add will show up here."
          action={
            <Button size="sm" variant="secondary" onClick={onAddExam}>
              Add exam
            </Button>
          }
        />
      )}
    </GlassCard>
  );
}
