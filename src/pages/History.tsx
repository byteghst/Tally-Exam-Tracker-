import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/Badge';
import { db } from '@/data/db';
import type { ActivityLogEntry } from '@/types';

export function History() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    db.activityLog.orderBy('timestamp').reverse().limit(100).toArray().then(setEntries);
  }, []);

  return (
    <div className="space-y-5 py-6">
      <h1 className="font-display text-2xl font-semibold text-ink">History</h1>
      {entries.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Actions like adding an exam or completing a task will be logged here."
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <GlassCard key={entry.id} className="p-3.5">
              <p className="text-sm text-ink">{entry.message}</p>
              <p className="text-xs text-ink-faint">{new Date(entry.timestamp).toLocaleString()}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
