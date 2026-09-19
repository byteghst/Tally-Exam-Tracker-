import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function SyllabusProgressWidget({ progress, itemCount }: { progress: number; itemCount: number }) {
  return (
    <GlassCard className="p-5">
      {itemCount === 0 ? (
        <>
          <p className="text-sm font-medium text-ink-muted">Syllabus progress</p>
          <EmptyState
            title="Your syllabus is empty"
            description="Add your first topic to start tracking progress."
            action={
              <Link to="/syllabus">
                <Button size="sm" variant="secondary">
                  Add topic
                </Button>
              </Link>
            }
          />
        </>
      ) : (
        <div className="flex items-center gap-4">
          <ProgressRing value={progress} />
          <div>
            <p className="text-sm font-medium text-ink-muted">Syllabus progress</p>
            <p className="text-sm text-ink-faint">
              Across {itemCount} tracked item{itemCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
