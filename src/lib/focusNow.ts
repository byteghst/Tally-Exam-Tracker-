import type { Exam, Deadline, Task, SyllabusNode } from '@/types';
import { daysBetween, todayISO } from '@/lib/dates';

export interface FocusRecommendation {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaPath: string;
}

interface FocusNowInput {
  exams: Exam[];
  deadlines: Deadline[];
  tasks: Task[];
  syllabusNodes: SyllabusNode[];
}

const EXAM_HORIZON_DAYS = 3;
const DEADLINE_HORIZON_DAYS = 3;
const IN_PROGRESS_STATES = ['started', 'in_progress', 'revision_needed'];

/**
 * Picks exactly one next action, in a fixed priority order, using only data
 * that already exists in the app. No AI, no fabricated urgency — every
 * branch is a plain, explainable rule over real records.
 */
export function computeFocusNow({ exams, deadlines, tasks, syllabusNodes }: FocusNowInput): FocusRecommendation {
  const today = todayISO();

  // 1. Overdue deadlines take top priority
  const overdueDeadlines = deadlines
    .filter((d) => d.status === 'overdue')
    .sort((a, b) => a.date.localeCompare(b.date));
  if (overdueDeadlines.length > 0) {
    const d = overdueDeadlines[0];
    const days = Math.abs(daysBetween(d.date, today));
    return {
      eyebrow: 'Overdue',
      title: d.title,
      subtitle:
        overdueDeadlines.length > 1
          ? `${days} day${days === 1 ? '' : 's'} overdue, plus ${overdueDeadlines.length - 1} more waiting`
          : `${days} day${days === 1 ? '' : 's'} overdue`,
      ctaLabel: 'Open deadlines',
      ctaPath: '/deadlines'
    };
  }

  // 2. An exam within the horizon
  const soonExams = exams
    .filter((e) => e.status === 'upcoming' && daysBetween(today, e.date) >= 0 && daysBetween(today, e.date) <= EXAM_HORIZON_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (soonExams.length > 0) {
    const e = soonExams[0];
    const days = daysBetween(today, e.date);
    return {
      eyebrow: 'Upcoming exam',
      title: e.name,
      subtitle: days === 0 ? 'Today' : `In ${days} day${days === 1 ? '' : 's'}`,
      ctaLabel: 'Open exam',
      ctaPath: `/exams/${e.id}`
    };
  }

  // 3. Overdue tasks
  const overdueTasks = tasks
    .filter((t) => t.date && t.date < today && t.status !== 'completed' && t.status !== 'archived' && t.status !== 'skipped')
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  if (overdueTasks.length > 0) {
    const t = overdueTasks[0];
    return {
      eyebrow: 'Overdue',
      title: t.name,
      subtitle:
        overdueTasks.length > 1
          ? `Overdue, plus ${overdueTasks.length - 1} more task${overdueTasks.length - 1 === 1 ? '' : 's'} waiting`
          : 'Overdue',
      ctaLabel: 'Open tasks',
      ctaPath: '/tasks'
    };
  }

  // 4. Today's remaining tasks
  const todaysTasks = tasks.filter((t) => t.date === today && t.status !== 'completed' && t.status !== 'archived' && t.status !== 'skipped');
  if (todaysTasks.length > 0) {
    const t = todaysTasks[0];
    return {
      eyebrow: 'Today',
      title: t.name,
      subtitle:
        todaysTasks.length > 1 ? `${todaysTasks.length} tasks remain today` : '1 task remains today',
      ctaLabel: 'Open tasks',
      ctaPath: '/tasks'
    };
  }

  // 5. An upcoming deadline within the horizon
  const soonDeadlines = deadlines
    .filter((d) => d.status === 'upcoming' && daysBetween(today, d.date) <= DEADLINE_HORIZON_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (soonDeadlines.length > 0) {
    const d = soonDeadlines[0];
    const days = daysBetween(today, d.date);
    return {
      eyebrow: 'Coming up',
      title: d.title,
      subtitle: days === 0 ? 'Due today' : `Due in ${days} day${days === 1 ? '' : 's'}`,
      ctaLabel: 'Open deadlines',
      ctaPath: '/deadlines'
    };
  }

  // 6. Any syllabus item already in progress
  const inProgress = syllabusNodes.filter((n) => IN_PROGRESS_STATES.includes(n.progressState));
  if (inProgress.length > 0) {
    const n = inProgress[0];
    return {
      eyebrow: 'Continue',
      title: n.title,
      subtitle: `${n.progressPercent}% complete`,
      ctaLabel: 'Open syllabus',
      ctaPath: '/syllabus'
    };
  }

  // 7. Clear
  return {
    eyebrow: "You're clear",
    title: 'Nothing urgent right now',
    subtitle:
      syllabusNodes.length > 0
        ? 'Use the time to continue your syllabus.'
        : 'Add an exam, task, or syllabus item to get started.',
    ctaLabel: syllabusNodes.length > 0 ? 'View syllabus' : 'Add an exam',
    ctaPath: syllabusNodes.length > 0 ? '/syllabus' : '/exams'
  };
}
