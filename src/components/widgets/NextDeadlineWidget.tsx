import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { describeCountdown } from '@/lib/dates';
import type { Deadline } from '@/types';

export function NextDeadlineWidget({
  deadline,
  onAddDeadline
}: {
  deadline?: Deadline;
  onAddDeadline: () => void;
}) {
  return (
    <GlassCard className="p-5">
      <p className="text-sm font-medium text-ink-muted">Next deadline</p>
      {deadline ? (
        <>
          <p className="mt-2 font-display text-lg font-semibold text-ink">{deadline.title}</p>
          <p className="text-sm text-ink-muted">{describeCountdown(deadline.date)}</p>
        </>
      ) : (
        <EmptyState
          title="No deadlines"
          description="Track registration dates and submissions here."
          action={
            <Button size="sm" variant="secondary" onClick={onAddDeadline}>
              Add deadline
            </Button>
          }
        />
      )}
    </GlassCard>
  );
}
