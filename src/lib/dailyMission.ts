import type { Task, SyllabusNode, ActivityLogEntry } from '@/types';
import { todayISO, toISODate } from '@/lib/dates';

export interface MissionItem {
  id: string;
  label: string;
  done: boolean;
}

interface DailyMissionInput {
  tasks: Task[];
  syllabusNodes: SyllabusNode[];
  activityEntries: ActivityLogEntry[];
}

const IN_PROGRESS_STATES = ['started', 'in_progress', 'revision_needed'];

/**
 * Deliberately limited to two item types: today's scheduled tasks, and
 * syllabus progress. Both have a genuine, unambiguous "done" signal in the
 * existing data. A third item type ("review your latest exam") appears in
 * the original spec but there's no "reviewed" flag anywhere in the data
 * model — adding one just to populate a checklist item would be exactly the
 * kind of fabricated state this app deliberately avoids, so it's left out
 * rather than faked.
 */
export function computeDailyMission({ tasks, syllabusNodes, activityEntries }: DailyMissionInput): MissionItem[] {
  const today = todayISO();
  const items: MissionItem[] = [];

  const todaysTasks = tasks.filter((t) => t.date === today);
  if (todaysTasks.length > 0) {
    items.push({
      id: 'tasks',
      label: `Complete ${todaysTasks.length} task${todaysTasks.length === 1 ? '' : 's'}`,
      done: todaysTasks.every((t) => t.status === 'completed')
    });
  }

  const inProgressNodes = syllabusNodes.filter((n) => IN_PROGRESS_STATES.includes(n.progressState));
  const completedSyllabusToday = activityEntries.some(
    (e) => e.entityType === 'syllabus' && e.message.startsWith('Completed') && toISODate(new Date(e.timestamp)) === today
  );
  if (inProgressNodes.length > 0 || completedSyllabusToday) {
    items.push({
      id: 'syllabus',
      label: 'Finish one syllabus item',
      done: completedSyllabusToday
    });
  }

  return items;
}
