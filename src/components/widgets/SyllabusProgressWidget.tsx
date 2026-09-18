import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/Progress';

export function SyllabusProgressWidget({ progress }: { progress: number }) {
  return (
    <GlassCard className="flex items-center gap-4 p-5">
      <ProgressRing value={progress} />
      <div>
        <p className="text-sm font-medium text-ink-muted">Syllabus progress</p>
        <p className="text-sm text-ink-faint">Across all tracked items</p>
      </div>
    </GlassCard>
  );
}
