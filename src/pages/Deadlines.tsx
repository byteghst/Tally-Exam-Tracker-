import { useEffect, useState } from 'react';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DeadlineForm } from '@/components/features/deadlines/DeadlineForm';
import { useDeadlineStore } from '@/store/deadlineStore';
import { useOpenAddFromNavState } from '@/hooks/useOpenAddFromNavState';
import { describeCountdown, formatDate } from '@/lib/dates';
import type { Deadline } from '@/types';

const STATUS_TONE = {
  upcoming: 'neutral',
  due_today: 'warning',
  completed: 'success',
  overdue: 'danger',
  archived: 'neutral'
} as const;

export function Deadlines() {
  const { deadlines, hydrate, completeDeadline, deleteDeadline } = useDeadlineStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deadline | undefined>(undefined);

  useOpenAddFromNavState(() => {
    setEditing(undefined);
    setFormOpen(true);
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const active = deadlines.filter((d) => d.status !== 'archived').sort((a, b) => a.date.localeCompare(b.date));

  function openAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(deadline: Deadline) {
    setEditing(deadline);
    setFormOpen(true);
  }

  return (
    <div className="space-y-5 py-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Deadlines</h1>
        <Button size="sm" onClick={openAdd}>
          Add deadline
        </Button>
      </header>

      {active.length === 0 ? (
        <EmptyState title="No deadlines coming up" description="Registration dates and submissions will show up here." icon={Clock} action={
            <Button size="sm" onClick={openAdd}>
              Add your first deadline
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {active.map((deadline) => (
            <GlassCard key={deadline.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{deadline.title}</p>
                <p className="text-sm text-ink-muted">
                  {formatDate(deadline.date)} · {describeCountdown(deadline.date)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={STATUS_TONE[deadline.status]}>{deadline.status.replace('_', ' ')}</Badge>
                {deadline.status !== 'completed' && (
                  <Button size="sm" variant="secondary" onClick={() => completeDeadline(deadline.id)}>
                    Complete
                  </Button>
                )}
                <button
                  onClick={() => openEdit(deadline)}
                  aria-label={`Edit ${deadline.title}`}
                  className="rounded-control p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteDeadline(deadline.id)}
                  aria-label={`Delete ${deadline.title}`}
                  className="rounded-control p-1.5 text-ink-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <DeadlineForm open={formOpen} onClose={() => setFormOpen(false)} deadline={editing} />
    </div>
  );
}
