import { useEffect, useState } from 'react';
import { FileSpreadsheet, Clock, ListChecks, BookOpen } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/Badge';
import { db } from '@/data/db';
import type { ActivityLogEntry, ActivityEntityType } from '@/types';

const ENTITY_ICON: Record<ActivityEntityType, typeof FileSpreadsheet> = {
  exam: FileSpreadsheet,
  deadline: Clock,
  task: ListChecks,
  syllabus: BookOpen
};

export function History() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    db.activityLog
      .orderBy('timestamp')
      .reverse()
      .limit(100)
      .toArray()
      .then((result) => {
        setEntries(result);
        setLoaded(true);
      });
  }, []);

  return (
    <div className="space-y-5 py-6">
      <h1 className="font-display text-2xl font-semibold text-ink">History</h1>
      {loaded && entries.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Actions like adding an exam or completing a task will be logged here."
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const Icon = ENTITY_ICON[entry.entityType];
            return (
              <GlassCard key={entry.id} className="flex items-start gap-3 p-3.5">
                <Icon size={18} className="mt-0.5 shrink-0 text-ink-muted" />
                <div className="min-w-0">
                  <p className="text-sm text-ink">{entry.message}</p>
                  <p className="text-xs text-ink-faint">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}