import type { Exam, Task, Deadline, SyllabusNode, ActivityLogEntry } from '@/types';
import { calculateScore } from '@/lib/scoring';
import { countAllTimeProductiveDays } from '@/lib/momentum';
import { formatDate, toISODate } from '@/lib/dates';

export interface Milestone {
  id: string;
  label: string;
  detail?: string;
}

interface MilestonesInput {
  exams: Exam[];
  tasks: Task[];
  deadlines: Deadline[];
  syllabusNodes: SyllabusNode[];
  activityEntries: ActivityLogEntry[];
}

/** Finds the timestamp of the Nth (1-indexed) log entry whose message starts with the given prefix, in chronological order. */
function nthEntryDate(entries: ActivityLogEntry[], prefix: string, n: number): string | undefined {
  const matches = entries.filter((e) => e.message.startsWith(prefix)).sort((a, b) => a.timestamp - b.timestamp);
  const entry = matches[n - 1];
  return entry ? formatDate(toISODate(new Date(entry.timestamp))) : undefined;
}

export function computeMilestones({
  exams,
  tasks,
  deadlines,
  syllabusNodes,
  activityEntries
}: MilestonesInput): Milestone[] {
  const milestones: Milestone[] = [];

  // --- Exam count milestones ---
  if (exams.length >= 1) {
    milestones.push({ id: 'first-exam', label: 'First exam recorded', detail: nthEntryDate(activityEntries, 'Added exam', 1) });
  }
  if (exams.length >= 10) {
    milestones.push({ id: 'exams-10', label: '10 exams recorded', detail: nthEntryDate(activityEntries, 'Added exam', 10) });
  }
  if (exams.length >= 25) {
    milestones.push({ id: 'exams-25', label: '25 exams recorded', detail: nthEntryDate(activityEntries, 'Added exam', 25) });
  }

  // --- Task completion milestones ---
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  if (completedTasks >= 1) {
    milestones.push({ id: 'first-task', label: 'First task completed', detail: nthEntryDate(activityEntries, 'Completed task', 1) });
  }
  if (completedTasks >= 10) {
    milestones.push({ id: 'tasks-10', label: '10 tasks completed', detail: nthEntryDate(activityEntries, 'Completed task', 10) });
  }

  // --- Productive-day milestones ---
  const productiveDays = countAllTimeProductiveDays(activityEntries);
  if (productiveDays >= 7) milestones.push({ id: 'days-7', label: '7 productive days' });
  if (productiveDays >= 30) milestones.push({ id: 'days-30', label: '30 productive days' });

  // --- Syllabus milestones ---
  const completedNodes = syllabusNodes.filter((n) => n.progressState === 'completed');
  if (completedNodes.length >= 1) {
    milestones.push({
      id: 'first-syllabus',
      label: 'First syllabus section completed',
      detail: nthEntryDate(activityEntries, 'Completed syllabus item', 1)
    });
  }
  if (syllabusNodes.length > 0 && completedNodes.length === syllabusNodes.length) {
    milestones.push({ id: 'syllabus-100', label: '100% syllabus completion' });
  }

  // --- Score/rank records (completed exams only) ---
  const completedExams = exams.filter((e) => e.status === 'completed');
  const withPercentage = completedExams
    .map((e) => ({
      exam: e,
      percentage: calculateScore(
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
    }))
    .filter((x): x is { exam: Exam; percentage: number } => x.percentage !== null);

  if (withPercentage.length > 0) {
    const best = withPercentage.reduce((a, b) => (b.percentage > a.percentage ? b : a));
    milestones.push({ id: 'highest-score', label: 'Highest score', detail: `${best.percentage}% — ${best.exam.name}` });
  }

  const withRank = completedExams.filter((e) => e.rank !== undefined);
  if (withRank.length > 0) {
    const best = withRank.reduce((a, b) => (b.rank! < a.rank! ? b : a));
    milestones.push({
      id: 'best-rank',
      label: 'Best rank',
      detail: `${best.rank}${best.participants ? ` / ${best.participants}` : ''} — ${best.name}`
    });
  }

  // biggest score improvement between consecutive same-type exams
  let biggestJump = 0;
  let biggestJumpExam: Exam | undefined;
  for (const type of ['daily', 'weekly'] as const) {
    const ofType = withPercentage
      .filter((x) => x.exam.type === type)
      .sort((a, b) => a.exam.date.localeCompare(b.exam.date));
    for (let i = 1; i < ofType.length; i++) {
      const diff = ofType[i].percentage - ofType[i - 1].percentage;
      if (diff > biggestJump) {
        biggestJump = diff;
        biggestJumpExam = ofType[i].exam;
      }
    }
  }
  if (biggestJumpExam) {
    milestones.push({
      id: 'biggest-jump',
      label: 'Biggest score improvement',
      detail: `+${Math.round(biggestJump * 10) / 10}% — ${biggestJumpExam.name}`
    });
  }

  // --- Deadlines ---
  if (deadlines.some((d) => d.status === 'completed')) {
    milestones.push({ id: 'first-deadline', label: 'First completed deadline' });
  }

  return milestones;
}
